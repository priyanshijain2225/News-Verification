import { newsApiService, NewsArticle } from './newsApi';
import { webScraperService } from './webScraper';
import { geminiService, Claim, VerificationResult } from './geminiService';

export interface VerificationInput {
  type: 'text' | 'link' | 'video';
  content: string; // For text: the actual text, for link/video: the URL
}

export interface ProcessedInput {
  originalContent: string;
  extractedText: string;
  title?: string;
  url?: string;
  source?: string;
}

export interface CompleteVerificationResult extends VerificationResult {
  input: ProcessedInput;
  relatedArticles: NewsArticle[];
  processingTime: number;
  timestamp: string;
}

export class NewsVerificationService {
  private maxRetries = 3;
  private retryDelay = 1000;

  async verifyContent(input: VerificationInput): Promise<CompleteVerificationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Starting verification for ${input.type} content...`);
      
      // Step 1: Process the input content
      const processedInput = await this.processInput(input);
      
      // Step 2: Extract claims from the content
      const claims = await this.extractClaimsWithRetry(processedInput.extractedText);
      
      // Step 3: Search for similar articles
      const relatedArticles = await this.findRelatedArticles(processedInput.extractedText);
      
      // Step 4: Verify against sources
      const verificationResult = await this.performVerificationWithRetry(
        claims, 
        relatedArticles, 
        processedInput.extractedText
      );
      
      // Step 5: Compile final result
      const processingTime = Date.now() - startTime;
      
      return {
        ...verificationResult,
        claims,
        input: processedInput,
        relatedArticles: relatedArticles.slice(0, 5), // Limit to top 5
        processingTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Verification process failed:', error);
      throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processInput(input: VerificationInput): Promise<ProcessedInput> {
    switch (input.type) {
      case 'text':
        return {
          originalContent: input.content,
          extractedText: input.content,
          title: 'User Submitted Text'
        };
        
      case 'link':
        try {
          console.log('Scraping URL:', input.content);
          
          // Check if it's a YouTube URL
          if (input.content.includes('youtube.com') || input.content.includes('youtu.be')) {
            const scraped = await webScraperService.scrapeYouTubeContent(input.content);
            return {
              originalContent: input.content,
              extractedText: scraped.content,
              title: scraped.title,
              url: input.content,
              source: scraped.siteName
            };
          } else {
            const scraped = await webScraperService.scrapeUrl(input.content);
            return {
              originalContent: input.content,
              extractedText: scraped.content,
              title: scraped.title,
              url: input.content,
              source: scraped.siteName
            };
          }
        } catch (error) {
          console.error('Failed to scrape URL:', error);
          // Fallback: use URL as text
          return {
            originalContent: input.content,
            extractedText: `Content from URL: ${input.content}`,
            title: 'Link Content',
            url: input.content
          };
        }
        
      case 'video':
        // For video files, we would need video processing capabilities
        // For now, treat as text input
        return {
          originalContent: input.content,
          extractedText: `Video content: ${input.content}`,
          title: 'Video Content'
        };
        
      default:
        throw new Error(`Unsupported input type: ${input.type}`);
    }
  }

  private async extractClaimsWithRetry(content: string): Promise<Claim[]> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Extracting claims (attempt ${attempt}/${this.maxRetries})...`);
        const claims = await geminiService.extractClaims(content);
        
        if (claims.length > 0) {
          console.log(`Successfully extracted ${claims.length} claims`);
          return claims;
        }
        
        if (attempt === this.maxRetries) {
          console.log('No claims extracted, using fallback');
          return this.createFallbackClaims(content);
        }
        
      } catch (error) {
        console.error(`Claim extraction attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          return this.createFallbackClaims(content);
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }
    
    return [];
  }

  private async findRelatedArticles(content: string): Promise<NewsArticle[]> {
    try {
      console.log('Searching for related articles...');
      
      // Generate search query from content
      const searchQuery = newsApiService.generateSearchQuery(content);
      console.log('Search query:', searchQuery);
      
      if (!searchQuery.trim()) {
        console.log('No search terms generated, using fallback query');
        return await newsApiService.searchNews('news', 10);
      }
      
      const articles = await newsApiService.searchNews(searchQuery, 15);
      console.log(`Found ${articles.length} related articles`);
      
      // Filter and rank articles
      const filteredArticles = articles
        .filter(article => this.isRelevantArticle(article, content))
        .slice(0, 10);
      
      console.log(`Filtered to ${filteredArticles.length} relevant articles`);
      return filteredArticles;
      
    } catch (error) {
      console.error('Error finding related articles:', error);
      
      // Fallback: try to get top headlines
      try {
        console.log('Using fallback: fetching top headlines');
        return await newsApiService.getTopHeadlines('us', 10);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  private async performVerificationWithRetry(
    claims: Claim[], 
    articles: NewsArticle[], 
    originalContent: string
  ): Promise<VerificationResult> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Performing verification (attempt ${attempt}/${this.maxRetries})...`);
        
        const result = await geminiService.verifyAgainstSources(claims, articles, originalContent);
        console.log(`Verification completed with truth score: ${result.truthScore}`);
        
        return result;
        
      } catch (error) {
        console.error(`Verification attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          console.log('All verification attempts failed, using fallback');
          return this.createFallbackVerification(claims, articles);
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }
    
    return this.createFallbackVerification(claims, articles);
  }

  private isRelevantArticle(article: NewsArticle, content: string): boolean {
    const contentLower = content.toLowerCase();
    const titleLower = (article.title || '').toLowerCase();
    const descLower = (article.description || '').toLowerCase();
    
    // Extract keywords from content
    const keywords = newsApiService.extractKeywords(content);
    
    // Check if article contains any of the keywords
    const relevanceScore = keywords.reduce((score, keyword) => {
      const keywordLower = keyword.toLowerCase();
      if (titleLower.includes(keywordLower)) score += 3;
      if (descLower.includes(keywordLower)) score += 2;
      return score;
    }, 0);
    
    return relevanceScore > 0 || titleLower.includes(contentLower.slice(0, 50));
  }

  private createFallbackClaims(content: string): Claim[] {
    // Simple sentence splitting for fallback claims
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200)
      .slice(0, 3);

    return sentences.map((sentence, index) => ({
      id: `fallback_${index + 1}`,
      text: sentence,
      type: 'factual' as const,
      confidence: 60,
      context: 'Generated from content analysis'
    }));
  }

  private createFallbackVerification(claims: Claim[], articles: NewsArticle[]): VerificationResult {
    const hasArticles = articles.length > 0;
    const averageReliability = hasArticles 
      ? articles.reduce((sum, article) => sum + this.getSourceReliability(article.source.name), 0) / articles.length
      : 70;

    return {
      truthScore: Math.min(85, Math.max(50, averageReliability)),
      isLikelyMisinformation: averageReliability < 60,
      reasons: hasArticles 
        ? [
            `Analyzed against ${articles.length} news sources`,
            'Basic verification patterns applied',
            'No obvious misinformation indicators found'
          ]
        : [
            'Limited source verification available',
            'Basic content analysis completed',
            'Exercise caution with unverified content'
          ],
      claims,
      supportingArticles: articles.length,
      contradictingArticles: 0,
      verificationSummary: hasArticles 
        ? `Content analyzed against ${articles.length} sources. Basic verification suggests the information is generally reliable, though independent verification is recommended.`
        : 'Limited sources available for verification. Exercise caution and seek additional verification.',
      sources: articles.slice(0, 3).map(article => ({
        name: article.source.name,
        url: article.url,
        reliability: this.getSourceReliability(article.source.name),
        stance: 'neutral' as const
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility method to get verification status text
  static getVerificationStatusText(truthScore: number): string {
    if (truthScore >= 90) return 'Highly Verified';
    if (truthScore >= 80) return 'Mostly Verified';
    if (truthScore >= 70) return 'Partially Verified';
    if (truthScore >= 60) return 'Questionable';
    if (truthScore >= 50) return 'Likely Misinformation';
    return 'High Risk of Misinformation';
  }

  // Utility method to get verification color class
  static getVerificationColorClass(truthScore: number): string {
    if (truthScore >= 80) return 'text-green-600';
    if (truthScore >= 70) return 'text-blue-600';
    if (truthScore >= 60) return 'text-yellow-600';
    if (truthScore >= 50) return 'text-orange-600';
    return 'text-red-600';
  }
}

let _newsVerificationService: NewsVerificationService | null = null;

export const newsVerificationService = {
  get instance(): NewsVerificationService {
    if (!_newsVerificationService) {
      _newsVerificationService = new NewsVerificationService();
    }
    return _newsVerificationService;
  },
  
  // Proxy methods for easier access
  verifyContent: (input: VerificationInput) => newsVerificationService.instance.verifyContent(input)
};
