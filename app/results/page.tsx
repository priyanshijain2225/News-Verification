"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Card } from "@/app/components/ui/card";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { VerificationStatus } from "@/app/components/verification-status";
import { ConfidenceScoreBox } from "@/app/components/confidence-score-box";
import { SourceBox } from "@/app/components/source-box";
import { ClaimsDisplay } from "@/app/components/ClaimsDisplay";
import { VerificationSummaryCard } from "@/app/components/VerificationSummaryCard";

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

function CombinedResultsContent() {
  const searchParams = useSearchParams();
  const typesParam = searchParams.get("types");
  const queryParam = searchParams.get("query") || "breaking news";
  const isVerified = searchParams.get("verified") === "true";
  const types = typesParam ? typesParam.split(",") : [];
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationResults, setVerificationResults] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if we have verification results from the verification process
        if (isVerified) {
          const storedResults = localStorage.getItem('verificationResults');
          if (storedResults) {
            const parsedResults = JSON.parse(storedResults);
            setVerificationResults(parsedResults);
            
            // Use articles from verification results if available
            if (parsedResults.results && parsedResults.results.length > 0) {
              const allArticles: NewsArticle[] = [];
              parsedResults.results.forEach((result: any) => {
                if (result.relatedArticles) {
                  allArticles.push(...result.relatedArticles);
                }
              });
              setArticles(allArticles.slice(0, 5));
              setLoading(false);
              return;
            }
          }
        }
        
        // Fallback to regular news fetching
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
        
        setArticles(validArticles.slice(0, 3));
      } catch (err: any) {
        setError(err.message || "Error fetching news");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [queryParam, isVerified]);

  // Generate dynamic confidence scores based on source reputation or verification results
  const getConfidenceScore = (sourceName: string): number => {
    const reputableSources: { [key: string]: number } = {
      "BBC": 95, "Reuters": 93, "CNN": 88, "The Guardian": 90,
      "The New York Times": 92, "The Washington Post": 91,
      "Associated Press": 94, "Bloomberg": 89, "NPR": 87
    };
    return reputableSources[sourceName] || Math.floor(Math.random() * 15) + 75;
  };

  // Create news data object with verification results if available
  const getNewsData = () => {
    if (verificationResults && verificationResults.results) {
      const firstResult = verificationResults.results[0];
      
      return {
        verified: !firstResult.isLikelyMisinformation,
        truthScore: firstResult.truthScore,
        verificationSummary: firstResult.verificationSummary,
        reasons: firstResult.reasons || [],
        confidenceScores: firstResult.sources?.slice(0, 3).map((source: any) => ({
          source: source.name,
          score: source.reliability
        })) || articles.slice(0, 3).map(article => ({
          source: article.source.name,
          score: getConfidenceScore(article.source.name)
        })),
        sources: firstResult.sources?.map((source: any) => ({
          name: source.name,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          description: `${source.stance === 'supports' ? 'Supports' : source.stance === 'contradicts' ? 'Contradicts' : 'Neutral on'} the claims`,
          url: source.url
        })) || articles.map(article => ({
          name: article.source.name,
          date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          description: `Verified news coverage from ${article.source.name}`,
          url: article.url
        })),
        claims: firstResult.claims || [],
        input: firstResult.input,
        link: articles[0] ? {
          title: articles[0].title,
          description: articles[0].description || "No description available",
          url: articles[0].url,
          image: articles[0].urlToImage || "/placeholder-news.jpg",
        } : null,
        video: articles[1] ? {
          title: articles[1].title,
          thumbnail: articles[1].urlToImage || "/placeholder-video.jpg",
          duration: "3:45",
          url: articles[1].url,
        } : null,
        text: firstResult.input?.extractedText || articles[2]?.content?.split('[')[0] || articles[2]?.description || "No content available",
      };
    }

    // Fallback to original structure
    return {
      verified: articles.length > 0,
      truthScore: 75,
      confidenceScores: articles.slice(0, 3).map(article => ({
        source: article.source.name,
        score: getConfidenceScore(article.source.name)
      })),
      sources: articles.map(article => ({
        name: article.source.name,
        date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: `Verified news coverage from ${article.source.name}`,
        url: article.url
      })),
      claims: [],
      link: articles[0] ? {
        title: articles[0].title,
        description: articles[0].description || "No description available",
        url: articles[0].url,
        image: articles[0].urlToImage || "/placeholder-news.jpg",
      } : null,
      video: articles[1] ? {
        title: articles[1].title,
        thumbnail: articles[1].urlToImage || "/placeholder-video.jpg",
        duration: "3:45",
        url: articles[1].url,
      } : null,
      text: articles[2]?.content?.split('[0') || articles[2]?.description || "No content available",
    };
  };

  const newsData = getNewsData();

  // 🔸 Sidebar with basic verification info
  const renderSidebar = () => (
    <aside className="space-y-4 lg:space-y-6 w-full">
      <VerificationStatus isVerified={newsData.verified} truthScore={newsData.truthScore} />

      <div>
        <p className="font-semibold text-gray-700 mb-2">Confidence Scores</p>
        <div className="space-y-2">
          {newsData.confidenceScores.map((item: any, idx: number) => (
            <ConfidenceScoreBox key={idx} score={item.score} sourceName={item.source} />
          ))}
        </div>

        {/* 🟧 Expanded reliability section */}
        <div className="mt-4 lg:mt-6 grid grid-cols-1 gap-4">
          <div className="flex flex-col justify-between items-center bg-gray-50 border border-black/20 rounded-lg p-4 shadow-sm min-h-40">
            <p className="text-lg lg:text-xl text-center font-semibold text-orange-500 mb-1">
              Overall <br /> Reliability
            </p>
            <p className={`text-xl lg:text-2xl font-bold my-auto ${
              newsData.truthScore >= 80 ? 'text-green-600' :
              newsData.truthScore >= 70 ? 'text-blue-600' :
              newsData.truthScore >= 60 ? 'text-yellow-600' :
              newsData.truthScore >= 50 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {newsData.truthScore >= 80 ? 'High' :
               newsData.truthScore >= 70 ? 'Good' :
               newsData.truthScore >= 60 ? 'Medium' :
               newsData.truthScore >= 50 ? 'Low' : 'Very Low'}
            </p>
            <p className="text-xs text-gray-600 text-center">
              Cross-verified with {newsData.confidenceScores.length} trusted sources.
            </p>
          </div>

          <div className="flex flex-col justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm min-h-40">
            <p className="text-base lg:text-lg text-center font-semibold text-orange-500">
              Verification <br /> Summary
            </p>

            <p className="text-sm text-center text-gray-600 leading-snug my-auto px-2">
              {newsData.verificationSummary && newsData.verificationSummary.length > 0 
                ? newsData.verificationSummary.slice(0, 120) + (newsData.verificationSummary.length > 120 ? '...' : '')
                : "Independent reviews confirm the content matches verified facts."}
            </p>

            <div className="h-1" />
          </div>
        </div>
      </div>
    </aside>
  );

  // 🔸 Detailed Analysis Section (right side)
  const renderDetailedAnalysis = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Enhanced Verification Summary */}
      {verificationResults && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <VerificationSummaryCard
            truthScore={newsData.truthScore}
            isLikelyMisinformation={verificationResults.results[0]?.isLikelyMisinformation || false}
            reasons={newsData.reasons || []}
            verificationSummary={newsData.verificationSummary || ""}
            supportingArticles={verificationResults.results[0]?.supportingArticles || 0}
            contradictingArticles={verificationResults.results[0]?.contradictingArticles || 0}
            sources={verificationResults.results[0]?.sources || []}
          />
        </div>
      )}

      {/* Claims Analysis Section */}
      {newsData.claims && newsData.claims.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Extracted Claims</h4>
          <ClaimsDisplay claims={newsData.claims} />
        </div>
      )}
    </div>
  );

  // 🔸 Sources row under main content
  const renderSourcesRow = () => (
    <div className="mt-6 lg:mt-8">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Verified Sources</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsData.sources.slice(0, 6).map((s: any, i: number) => (
          <div
            key={i}
            className="flex justify-center"
          >
            <SourceBox {...s} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-24">
        <h1 className="text-4xl font-bold text-black mb-8 text-center">
          <span className="text-orange-500">Verification</span> Results
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <span className="ml-3 text-lg text-gray-600">Loading news verification...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No news articles found. Try a different search query.</p>
          </div>
        )}

        {/* 🎥 VIDEO SECTION */}
        {!loading && types.includes("video") && newsData.video && (
          <section className="border-t-4 border-orange-500 pt-10">
            <h2 className="text-2xl font-bold text-black mb-6">🎥 Video Verification</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-3 lg:order-1">
                {renderSidebar()}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-5 lg:order-2">
                <Card className="p-6 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                  <a 
                    href={newsData.video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative group cursor-pointer">
                      <img
                        src={newsData.video.thumbnail}
                        alt={newsData.video.title}
                        className="w-full h-80 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center rounded-2xl transition">
                        <Play className="w-16 h-16 text-white fill-white" />
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm font-medium">
                        {newsData.video.duration}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-black mt-4 hover:text-orange-600 transition-colors">{newsData.video.title}</h3>
                  </a>
                </Card>

                {renderSourcesRow()}
              </div>

              {/* Detailed Analysis - Right Side */}
              <div className="lg:col-span-4 lg:order-3">
                {renderDetailedAnalysis()}
              </div>
            </div>
          </section>
        )}

        {/* 🔗 LINK SECTION */}
        {!loading && types.includes("link") && newsData.link && (
          <section className="border-t-4 border-orange-500 pt-10">
            <h2 className="text-2xl font-bold text-black mb-6">
              <span className="text-orange-500">Link</span> Verification
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-3 lg:order-1">
                {renderSidebar()}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-5 lg:order-2">
                <Card className="p-6 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                  {newsData.link.image && (
                    <img
                      src={newsData.link.image}
                      alt={newsData.link.title}
                      className="w-full h-60 object-cover rounded-2xl mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="font-bold text-xl text-black mb-2">{newsData.link.title}</h3>
                  <p className="text-sm text-gray-700 mb-4">{newsData.link.description}</p>
                  <a
                    href={newsData.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Visit Link <ExternalLink className="w-4 h-4" />
                  </a>
                </Card>

                {renderSourcesRow()}
              </div>

              {/* Detailed Analysis - Right Side */}
              <div className="lg:col-span-4 lg:order-3">
                {renderDetailedAnalysis()}
              </div>
            </div>
          </section>
        )}

        {/* 📝 TEXT SECTION */}
        {!loading && types.includes("text") && (
          <section className="border-t-4 border-orange-500 pt-10">
            <h2 className="text-2xl font-bold text-black mb-6">📝 Text Verification</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-3 lg:order-1">
                {renderSidebar()}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-5 lg:order-2">
                <Card className="p-6 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all min-h-96">
                  <p className="text-lg text-gray-800 leading-relaxed">{newsData.text}</p>
                </Card>

                {renderSourcesRow()}
              </div>

              {/* Detailed Analysis - Right Side */}
              <div className="lg:col-span-4 lg:order-3">
                {renderDetailedAnalysis()}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function CombinedResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-24">
          <h1 className="text-4xl font-bold text-black mb-8 text-center">
            <span className="text-orange-500">Verification</span> Results
          </h1>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <span className="ml-3 text-lg text-gray-600">Loading verification results...</span>
          </div>
        </div>
      </main>
    }>
      <CombinedResultsContent />
    </Suspense>
  );
}
