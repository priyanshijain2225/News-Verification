interface ScrapingResult {
  title: string;
  content: string;
  url: string;
  publishedAt?: string;
  author?: string;
  siteName?: string;
}

export class WebScraperService {
  async scrapeUrl(url: string): Promise<ScrapingResult> {
    try {
      // Validate URL
      new URL(url);
      
      // Use a CORS proxy for client-side scraping
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const htmlContent = data.contents;
      
      // Parse HTML using DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract content using multiple strategies
      const result = this.extractContentFromDocument(doc, url);
      
      return result;
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw new Error(`Failed to scrape content from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractContentFromDocument(doc: Document, url: string): ScrapingResult {
    // Strategy 1: Try Open Graph tags
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    
    // Strategy 2: Try Twitter Card tags
    const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const twitterDescription = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    
    // Strategy 3: Try standard meta tags
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    const metaAuthor = doc.querySelector('meta[name="author"]')?.getAttribute('content');
    
    // Strategy 4: Extract from HTML elements
    const htmlTitle = doc.querySelector('title')?.textContent;
    
    // Extract main content
    let content = '';
    
    // Try article content selectors
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main p',
      '.story-body',
      '.article-body'
    ];
    
    for (const selector of articleSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        content = this.extractTextContent(element);
        if (content.length > 100) break; // Found substantial content
      }
    }
    
    // Fallback: extract all paragraphs
    if (content.length < 100) {
      const paragraphs = Array.from(doc.querySelectorAll('p'))
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 50)
        .slice(0, 10); // Take first 10 substantial paragraphs
      
      content = paragraphs.join(' ');
    }
    
    // Clean and limit content
    content = this.cleanText(content).slice(0, 5000); // Limit to 5000 chars
    
    const title = ogTitle || twitterTitle || htmlTitle || 'Untitled';
    const description = ogDescription || twitterDescription || metaDescription || '';
    
    // Combine title and description with content for full text
    const fullContent = [title, description, content]
      .filter(text => text && text.trim())
      .join('. ')
      .slice(0, 8000); // Limit total content
    
    return {
      title: title.trim(),
      content: fullContent.trim(),
      url,
      siteName: ogSiteName || new URL(url).hostname,
      author: metaAuthor || undefined
    };
  }

  private extractTextContent(element: Element): string {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as Element;
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 
      '.advertisement', '.ads', '.social-share', 
      '.comments', '.related-articles'
    ];
    
    unwantedSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    return clone.textContent || '';
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Keep basic punctuation
      .trim();
  }

  // YouTube video content extraction
  async scrapeYouTubeContent(url: string): Promise<ScrapingResult> {
    try {
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      
      // For YouTube, we'll extract what we can from the page
      const result = await this.scrapeUrl(url);
      
      return {
        ...result,
        siteName: 'YouTube',
        content: `YouTube Video: ${result.title}. ${result.content}`.slice(0, 1000)
      };
    } catch (error) {
      console.error('Error scraping YouTube content:', error);
      throw error;
    }
  }

  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /youtu\.be\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  // Check if URL is from a major news site
  isNewsSite(url: string): boolean {
    const newsSites = [
      'bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'theguardian.com',
      'nytimes.com', 'washingtonpost.com', 'bloomberg.com', 'npr.org',
      'abcnews.go.com', 'cbsnews.com', 'nbcnews.com', 'foxnews.com',
      'aljazeera.com', 'ndtv.com', 'timesofindia.indiatimes.com',
      'hindustantimes.com', 'indianexpress.com'
    ];
    
    return newsSites.some(site => url.includes(site));
  }
}

let _webScraperService: WebScraperService | null = null;

export const webScraperService = {
  get instance(): WebScraperService {
    if (!_webScraperService) {
      _webScraperService = new WebScraperService();
    }
    return _webScraperService;
  },
  
  // Proxy methods for easier access
  scrapeUrl: (url: string) => webScraperService.instance.scrapeUrl(url),
  scrapeYouTubeContent: (url: string) => webScraperService.instance.scrapeYouTubeContent(url),
  isNewsSite: (url: string) => webScraperService.instance.isNewsSite(url)
};
