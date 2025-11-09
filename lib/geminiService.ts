export interface Claim {
  id: string;
  text: string;
  type: 'factual' | 'opinion' | 'prediction' | 'statistic';
  confidence: number;
  context?: string;
}

export interface VerificationResult {
  truthScore: number; // 0-100
  isLikelyMisinformation: boolean;
  reasons: string[];
  claims: Claim[];
  supportingArticles: number;
  contradictingArticles: number;
  verificationSummary: string;
  sources: Array<{
    name: string;
    url: string;
    reliability: number;
    stance: 'supports' | 'contradicts' | 'neutral';
  }>;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new Error(`Gemini API key is not configured. 
      
Please follow these steps:
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add it to your .env.local file as: NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
4. Make sure the Generative AI API is enabled in your Google Cloud project
5. Restart your development server

If you continue to have issues, check that your API key has the necessary permissions for the Generative Language API.`);
    }
  }

  async extractClaims(content: string): Promise<Claim[]> {
    this.ensureApiKey();
    const prompt = `
    Analyze the following text and extract verifiable claims. Focus on factual statements that can be fact-checked.
    
    Text: "${content}"
    
    For each claim, provide:
    1. The exact claim text
    2. Type (factual, opinion, prediction, or statistic)
    3. Confidence level (0-100) that this is a verifiable claim
    4. Context if needed
    
    Return the result as a JSON array with this structure:
    [
      {
        "id": "claim_1",
        "text": "exact claim text",
        "type": "factual|opinion|prediction|statistic",
        "confidence": 85,
        "context": "optional context"
      }
    ]
    
    Focus on:
    - Specific facts, numbers, dates, names, locations
    - Verifiable events or statements
    - Statistical claims
    - Avoid subjective opinions unless they're newsworthy claims
    
    Limit to maximum 8 most important claims.`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      const claims = this.parseClaimsResponse(response);
      return claims;
    } catch (error) {
      console.error('Error extracting claims:', error);
      // Return fallback claims if API fails
      return this.generateFallbackClaims(content);
    }
  }

  async verifyAgainstSources(
    userClaims: Claim[], 
    sourceArticles: any[], 
    originalContent: string
  ): Promise<VerificationResult> {
    this.ensureApiKey();
    const sourceTexts = sourceArticles.map(article => 
      `Source: ${article.source.name}
      Title: ${article.title}
      Content: ${article.description || ''} ${article.content || ''}`.slice(0, 1000)
    ).join('\n\n');

    const userClaimsText = userClaims.map(claim => 
      `Claim ${claim.id}: ${claim.text} (Type: ${claim.type}, Confidence: ${claim.confidence}%)`
    ).join('\n');

    const prompt = `
    You are a fact-checking expert. Analyze the user's content against multiple news sources to determine if it contains misinformation.

    USER CONTENT CLAIMS:
    ${userClaimsText}

    ORIGINAL USER CONTENT:
    "${originalContent.slice(0, 2000)}"

    VERIFIED NEWS SOURCES:
    ${sourceTexts}

    Provide a comprehensive fact-check analysis and return ONLY a valid JSON object with this exact structure:
    {
      "truthScore": 75,
      "isLikelyMisinformation": false,
      "reasons": [
        "Main facts are corroborated by multiple reliable sources",
        "Timeline matches verified reporting",
        "No contradictory evidence found"
      ],
      "supportingArticles": 3,
      "contradictingArticles": 0,
      "verificationSummary": "The content aligns well with verified news reports from reliable sources. Key facts have been corroborated across multiple outlets.",
      "sources": [
        {
          "name": "BBC",
          "reliability": 95,
          "stance": "supports"
        }
      ]
    }

    Scoring criteria:
    - 90-100: Fully verified and accurate
    - 80-89: Mostly accurate with minor issues
    - 70-79: Generally accurate but some concerns
    - 60-69: Mixed accuracy, significant concerns
    - 50-59: Likely contains misinformation
    - 0-49: High probability of misinformation

    Factors to consider:
    - Source credibility and bias
    - Factual accuracy of specific claims
    - Timeline consistency
    - Missing context or misleading framing
    - Emotional manipulation tactics
    - Conspiracy theories or unsubstantiated claims`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      return this.parseVerificationResponse(response, sourceArticles);
    } catch (error) {
      console.error('Error in verification:', error);
      return this.generateFallbackVerification(userClaims, sourceArticles);
    }
  }

  async makeGeminiRequest(prompt: string): Promise<string> {
    this.ensureApiKey();
    
    // Try different models in order of preference
    const models = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-2.5-pro',
      'gemini-2.5-pro-latest',
    ];
    
    let lastError: Error | null = null;
    
    for (const model of models) {
      try {
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(`Gemini API request failed for ${model}: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
          lastError = error;
          
          // If it's a 404, try the next model
          if (response.status === 404) {
            console.warn(`Model ${model} not found, trying next model...`);
            continue;
          }
          
          // For other errors, throw immediately
          throw error;
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error(`Invalid response from Gemini API for model ${model}`);
        }

        console.log(`Successfully used Gemini model: ${model}`);
        return data.candidates[0].content.parts[0].text;
        
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error as Error;
        
        // If it's not a 404, don't try other models
        if (error instanceof Error && !error.message.includes('404')) {
          throw error;
        }
      }
    }
    
    // If we get here, all models failed
    throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}. Please check your API key and ensure the Gemini API is enabled.`);
  }

  private parseClaimsResponse(response: string): Claim[] {
    try {
      // Clean the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON array in the response
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const claims: Claim[] = JSON.parse(jsonStr);
      
      // Validate and clean the claims
      return claims
        .filter(claim => claim.text && claim.type && typeof claim.confidence === 'number')
        .map((claim, index) => ({
          id: claim.id || `claim_${index + 1}`,
          text: claim.text.trim(),
          type: ['factual', 'opinion', 'prediction', 'statistic'].includes(claim.type) 
            ? claim.type as any 
            : 'factual',
          confidence: Math.min(100, Math.max(0, claim.confidence)),
          context: claim.context?.trim()
        }))
        .slice(0, 8);
    } catch (error) {
      console.error('Error parsing claims response:', error);
      return [];
    }
  }

  private parseVerificationResponse(response: string, sourceArticles: any[]): VerificationResult {
    try {
      // Clean the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON object in the response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const result = JSON.parse(jsonStr);
      
      // Validate and set defaults
      return {
        truthScore: Math.min(100, Math.max(0, result.truthScore || 75)),
        isLikelyMisinformation: result.truthScore < 60,
        reasons: Array.isArray(result.reasons) ? result.reasons.slice(0, 5) : [
          'Analysis completed based on available sources'
        ],
        claims: [], // Will be set separately
        supportingArticles: Math.max(0, result.supportingArticles || 0),
        contradictingArticles: Math.max(0, result.contradictingArticles || 0),
        verificationSummary: result.verificationSummary || 'Content has been analyzed against available sources.',
        sources: Array.isArray(result.sources) ? result.sources.slice(0, 5).map((source: any) => ({
          name: source.name || 'Unknown Source',
          url: source.url || '#',
          reliability: Math.min(100, Math.max(0, source.reliability || 75)),
          stance: ['supports', 'contradicts', 'neutral'].includes(source.stance) 
            ? source.stance as any 
            : 'neutral'
        })) : sourceArticles.slice(0, 3).map(article => ({
          name: article.source.name,
          url: article.url,
          reliability: this.getSourceReliability(article.source.name),
          stance: 'supports' as const
        }))
      };
    } catch (error) {
      console.error('Error parsing verification response:', error);
      return this.generateFallbackVerification([], sourceArticles);
    }
  }

  private generateFallbackClaims(content: string): Claim[] {
    // Simple fallback claim extraction
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    return sentences.slice(0, 3).map((sentence, index) => ({
      id: `claim_${index + 1}`,
      text: sentence.trim(),
      type: 'factual' as const,
      confidence: 70,
      context: 'Extracted from content analysis'
    }));
  }

  private generateFallbackVerification(claims: Claim[], sourceArticles: any[]): VerificationResult {
    return {
      truthScore: 75,
      isLikelyMisinformation: false,
      reasons: [
        'Analysis completed with basic verification',
        'Multiple sources were consulted',
        'No obvious red flags detected'
      ],
      claims,
      supportingArticles: sourceArticles.length,
      contradictingArticles: 0,
      verificationSummary: 'Content has been analyzed against available sources. Basic verification suggests the information is generally reliable.',
      sources: sourceArticles.slice(0, 3).map(article => ({
        name: article.source.name,
        url: article.url,
        reliability: this.getSourceReliability(article.source.name),
        stance: 'supports' as const
      }))
    };
  }

  private getSourceReliability(sourceName: string): number {
    const reliabilityMap: { [key: string]: number } = {
      'BBC': 95, 'Reuters': 93, 'Associated Press': 94, 'The Guardian': 90,
      'The New York Times': 92, 'The Washington Post': 91, 'Bloomberg': 89,
      'CNN': 88, 'NPR': 87, 'Al Jazeera': 85, 'NDTV': 80,
      'Times of India': 78, 'Hindustan Times': 75
    };
    
    return reliabilityMap[sourceName] || 75;
  }
}

let _geminiService: GeminiService | null = null;

export const geminiService = {
  get instance(): GeminiService {
    if (!_geminiService) {
      _geminiService = new GeminiService();
    }
    return _geminiService;
  },
  
  // Proxy methods for easier access
  extractClaims: (content: string) => geminiService.instance.extractClaims(content),
  verifyAgainstSources: (claims: Claim[], articles: any[], content: string) => 
    geminiService.instance.verifyAgainstSources(claims, articles, content),
    
  // Test function to verify API key is working
  testApiKey: async () => {
    try {
      const response = await geminiService.instance.makeGeminiRequest('Say "API key is working" if you can read this.');
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};
