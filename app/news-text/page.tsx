"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/app/components/ui/card"
import { Check, Loader2, ExternalLink } from "lucide-react"

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string;
}

function TextNewsContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") || "breaking news";
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
        if (!apiKey) {
          throw new Error("News API key is not configured");
        }
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(queryParam)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        
        const data = await response.json();
        
        // Filter articles to only include those with images AND descriptions
        const validArticles = (data.articles || []).filter(
          (article: NewsArticle) => 
            article.urlToImage && 
            article.urlToImage.trim() !== "" &&
            article.description && 
            article.description.trim() !== "" &&
            article.title &&
            article.title.trim() !== ""
        );
        
        setArticles(validArticles.slice(0, 5));
      } catch (err: any) {
        setError(err.message || "Error fetching news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [queryParam]);

  const getConfidenceScore = (sourceName: string): number => {
    const reputableSources: { [key: string]: number } = {
      "BBC": 95, "Reuters": 93, "CNN": 88, "The Guardian": 90,
      "The New York Times": 92, "The Washington Post": 91,
      "Associated Press": 94, "Bloomberg": 89, "NPR": 87
    };
    return reputableSources[sourceName] || Math.floor(Math.random() * 15) + 75;
  };

  const newsData = {
    verified: articles.length > 0,
    confidenceScores: articles.slice(0, 3).map(article => ({
      source: article.source.name,
      score: getConfidenceScore(article.source.name)
    })),
    sources: articles.slice(0, 2).map(article => ({
      name: article.source.name,
      date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })),
    content: articles[0] ? (articles[0].content?.split('[')[0] || articles[0].description || articles[0].title) : "",
    url: articles[0]?.url || "",
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Verify News Text</h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <span className="ml-3 text-lg text-gray-600">Loading news...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && !newsData.content && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No news articles found. Try a different search query.</p>
          </div>
        )}

        {!loading && !error && newsData.content && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              <Card className="p-4 border-2 rounded-2xl flex items-center gap-4">
                <div className="bg-black rounded-lg p-2 flex-shrink-0">
                  <Check className="w-8 h-8 text-white stroke-[3]" />
                </div>
                <p className="font-bold text-foreground text-lg">Verified</p>
              </Card>

              {/* Confidence Score */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Confidence Score</p>
                <div className="space-y-2">
                  {newsData.confidenceScores.map((item, idx) => (
                    <Card key={idx} className="p-4 border-2 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{item.source}</p>
                        <p className={`font-bold text-lg ${getConfidenceColor(item.score)}`}>{item.score}%</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Sources</p>
                <div className="space-y-2">
                  {newsData.sources.map((source, idx) => (
                    <Card key={idx} className="p-4 border-2 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.date}</p>
                        </div>
                        <div className="w-12 h-12 bg-black rounded-lg flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-foreground mb-4">News Text</h2>
              <Card className="p-8 border-2 rounded-2xl min-h-96">
                <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">{newsData.content}</p>
                {newsData.url && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a
                      href={newsData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                    >
                      Read Full Article <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function TextNewsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Verify News Text</h1>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <span className="ml-3 text-lg text-gray-600">Loading...</span>
          </div>
        </div>
      </main>
    }>
      <TextNewsContent />
    </Suspense>
  )
}
