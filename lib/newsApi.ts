interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export class NewsAPIService {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY || '';
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new Error('News API key is not configured. Please add NEXT_PUBLIC_NEWSAPI_KEY to your environment variables.');
    }
  }

  async searchNews(query: string, pageSize: number = 20): Promise<NewsArticle[]> {
    this.ensureApiKey();
    const url = `${this.baseUrl}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`News API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: NewsAPIResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`News API error: ${data.status}`);
      }

      // Filter articles with valid content
      return data.articles.filter(article => 
        article.title &&
        article.description &&
        (article.content || article.description) &&
        article.url
      );
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  async getTopHeadlines(country: string = 'us', pageSize: number = 50): Promise<NewsArticle[]> {
    this.ensureApiKey();
    const url = `${this.baseUrl}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`News API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: NewsAPIResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`News API error: ${data.status}`);
      }

      return data.articles.filter(article => 
        article.title &&
        article.description &&
        article.urlToImage &&
        article.url
      );
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      throw error;
    }
  }

  // Extract keywords from text for better search queries
  extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    // Return top 5 most relevant words
    return [...new Set(words)].slice(0, 5);
  }

  // Generate search query from extracted content
  generateSearchQuery(content: string): string {
    const keywords = this.extractKeywords(content);
    return keywords.join(' ');
  }
}

let _newsApiService: NewsAPIService | null = null;

export const newsApiService = {
  get instance(): NewsAPIService {
    if (!_newsApiService) {
      _newsApiService = new NewsAPIService();
    }
    return _newsApiService;
  },
  
  // Proxy methods for easier access
  searchNews: (query: string, pageSize?: number) => newsApiService.instance.searchNews(query, pageSize),
  getTopHeadlines: (country?: string, pageSize?: number) => newsApiService.instance.getTopHeadlines(country, pageSize),
  extractKeywords: (text: string) => newsApiService.instance.extractKeywords(text),
  generateSearchQuery: (content: string) => newsApiService.instance.generateSearchQuery(content)
};
