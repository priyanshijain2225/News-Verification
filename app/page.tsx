"use client";

import { useState, useEffect } from "react";
import { Search, Menu, ChevronRight, Loader2 } from "lucide-react";
import { VideoUploadModal } from "@/app/components/VideoUploadModal";
import Footer from "@/app/components/Footer";
import { NewsletterSubscribe } from "@/app/components/NewsletterSubscribe";
import { Card } from "../app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export default function NewsVerificationPage() {
  const [showModal, setShowModal] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
        if (!apiKey) {
          throw new Error("News API key is not configured");
        }
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?country=us&pageSize=50&apiKey=${apiKey}`
        );
        const data = await response.json();
        if (data.articles) {
          // Filter articles to only include those with images AND descriptions
          const validArticles = data.articles.filter(
            (article: NewsArticle) => 
              article.urlToImage && 
              article.urlToImage.trim() !== "" &&
              article.description && 
              article.description.trim() !== "" &&
              article.title &&
              article.title.trim() !== ""
          );
          // Take first 10 valid articles
          setArticles(validArticles.slice(0, 10));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Tips array used by the 6-steps section
  const tips = [
    {
      number: 1,
      title: "Confirm the Source",
      description:
        "If you're unfamiliar with the media outlet or author, read their about and contact pages to learn more about who they are and what they publish.",
      icon: "🔍",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      number: 2,
      title: "Check the Facts",
      description:
        "When something catches your attention, see what other news outlets are saying about the story and check for any similarities or differences in facts.",
      icon: "✓",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      number: 3,
      title: "Quality Counts",
      description:
        "If the content you are reading is messy, riddled with typos or grammar errors, it could be fake news. Most legitimate sources follow style guides.",
      icon: "📚",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      number: 4,
      title: "Read Before You Share",
      description:
        "Deceptive sites often use sensational headlines to hook readers and generate clicks. Before sharing a story, do your due diligence.",
      icon: "⚠️",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      number: 5,
      title: "Speak Up",
      description:
        "Media creators and consumers are responsible for fighting fake news. If you see fake news, reach out to the person who shared it.",
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      number: 6,
      title: "Check Your Biases",
      description:
        "Consider if your own beliefs could affect your judgement. Is the article objective? Is the content trying to evoke emotion?",
      icon: "⚖️",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="bg-black text-white px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <Menu className="w-6 h-6" /> */}
          <span className="text-lg font-bold">TruthLens</span>
        </div>

        <nav className="hidden md:flex items-center text-xl gap-12">
          <a href="#" className="hover:text-gray-300">
            Home
          </a>
          {/* <a href="#" className="hover:text-gray-300">
            Verify News
          </a> */}
          <a href="#latest" className="hover:text-gray-300">
            Latest
          </a>
          <a href="#verify" className="hover:text-gray-300">
            Verify News
          </a>
          <a href="#guide" className="hover:text-gray-300">
            Guide
          </a>
          <a href="#features" className="hover:text-gray-300">
            Features
          </a>
          {/* <a href="#sources" className="hover:text-gray-300">
            Sources
          </a> */}
          <a href="#footer" className="hover:text-gray-300">
            Contact Us
          </a>
        </nav>

        <button
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium"
          onClick={() => setShowModal(true)}
        >
          Verify News
        </button>
      </header>

      {/* Newsletter Signup */}
      <div className="bg-gray-100 px-8 py-5 flex items-center justify-between w-full border-y border-gray-200">
        <button
          onClick={() => setShowNewsletter(true)}
          className="bg-orange-500/80 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all"
        >
          Subscribe to Newsletter
        </button>

        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-3 py-2 w-64 shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Article */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {articles[0].author || articles[0].source.name || "News Source"}
                    </p>
                    <p className="text-sm text-gray-600">Author</p>
                  </div>
                </div>

                <a 
                  href={articles[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-90 transition-opacity"
                >
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight hover:text-orange-600 transition-colors">
                    {articles[0].title}
                  </h1>
                </a>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-orange-600 font-semibold text-sm">{articles[0].source.name}</span>
                  <span className="text-gray-600 text-sm">
                    {new Date(articles[0].publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <a 
                  href={articles[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-8 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {articles[0].urlToImage ? (
                    <img
                      src={articles[0].urlToImage}
                      alt={articles[0].title}
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/pic4.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </a>
              </>
            ) : (
              <p className="text-gray-500">No articles available</p>
            )}
          </div>

          {/* Right Column - Related Articles */}
          <div className="space-y-6 w-full max-w-2xl ml-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              articles.slice(1, 4).map((item, i) => (
              <a 
                key={i} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-row w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Left Text Section (60%) */}
                <div className="w-3/5 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-md leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description || "No description available"}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-600 font-semibold">{item.source.name}</span>
                    <span className="text-gray-600">{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Image Section (40%) */}
                <div className="w-2/5 h-auto">
                  {item.urlToImage ? (
                    <img src={item.urlToImage} alt={item.title} className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = "/pic3.jpg";}} />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center"><p className="text-xs text-gray-500">No image</p></div>
                  )}
                </div>
              </a>
              ))
            )}
          </div>
        </div>

        {/* Featured Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {loading ? (
            <div className="col-span-2 flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            articles.slice(4, 6).map((item, i) => (
              <a 
                key={i} 
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative rounded-lg overflow-hidden h-64 group cursor-pointer block"
              >
                {item.urlToImage ? (
                  <img src={item.urlToImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" onError={(e) => {(e.target as HTMLImageElement).src = "/pic2.jpg";}} />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white text-xs font-semibold">{item.source.name}</span>
                    <span className="text-white text-xs">{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                </div>
              </a>
            ))
          )}
        </div>

        {/* 🔥 Highlighted Latest News Section */}
        <section id="latest" className="mt-24 py-16 bg-white rounded-3xl shadow-inner">
          <div className="px-10 mb-8 flex items-center justify-between">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              📰 Latest <span className="text-orange-600">News</span>
            </h2>
            {/* <a href="#" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-all">
              Show More
              <ChevronRight className="w-5 h-5" />
            </a> */}
          </div>

          <div
            ref={(el) => {
              if (!el) return;
              let running = true;
              const scroll = () => {
                if (running) el.scrollLeft += 1;
                if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
                requestAnimationFrame(scroll);
              };
              requestAnimationFrame(scroll);
              el.addEventListener("mouseenter", () => (running = false));
              el.addEventListener("mouseleave", () => (running = true));
            }}
            className="flex gap-10 overflow-x-auto px-12 pb-8 scroll-smooth no-scrollbar"
          >
            {loading ? (
              <div className="w-full flex justify-center py-10">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                {articles.slice(0, 10).map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[340px] max-w-[360px] bg-white shadow-lg rounded-2xl p-5 flex flex-col border border-orange-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex-shrink-0 cursor-pointer"
                  >
                    <div className="w-full h-44 mb-5 rounded-xl overflow-hidden relative">
                      {item.urlToImage ? (
                        <img
                          src={item.urlToImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/pic1.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description || "No description available"}</p>
                  </a>
                ))}
                <div className="min-w-[340px] flex-shrink-0" aria-hidden />
              </>
            )}
          </div>
        </section>

        {/* Latest Articles Section */}
        <div className="mt-16 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            <span className="text-orange-500">Verify </span>Now
          </h2>
        </div>

        {/* Video Upload Section */}
        <div id="verify" className="mt-20 mb-24 text-center">
          <h2 className="text-2xl font-bold mb-4">News Verification Upload</h2>
          <p className="text-gray-600 mb-6">Upload your video or link for authenticity verification.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all"
          >
            Upload Verification Content
          </button>
        </div>

        {/* 🧭 Fake News Guide Section */}
        <section id="guide" className="py-24 bg-gradient-to-b from-white to-orange-50 border-t border-gray-200">
          <div className="text-center mb-16 px-6">
            <h2 className="text-5xl md:text-6xl font-extrabold text-black mb-4">
              How to Spot <span className="text-orange-600">Fake News</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
              Learn to identify misinformation and become a more informed digital citizen.
            </p>
          </div>

          {/* 3 Intro Cards */}
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 px-6">
            <Card className="border-l-4 border-orange-600 p-6 bg-white">
              <h3 className="text-xl font-bold text-orange-600">What is Fake News?</h3>
              <p className="mt-3 text-gray-700">
                It’s information that’s false or misleading — often made to deceive readers or gain attention.
              </p>
            </Card>

            <Card className="border-l-4 border-orange-600 p-6 bg-white">
              <h3 className="text-xl font-bold text-orange-600">Why Does It Exist?</h3>
              <p className="mt-3 text-gray-700">
                Misinformation spreads for influence, profit, or politics — and can travel fast on social media.
              </p>
            </Card>

            <Card className="border-l-4 border-orange-600 p-6 bg-white">
              <h3 className="text-xl font-bold text-orange-600">Where Can You Find It?</h3>
              <p className="mt-3 text-gray-700">
                It’s common on social media, blogs, and even fake websites designed to mimic real news outlets.
              </p>
            </Card>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-100 mt-20 py-16">
            <div className="max-w-5xl mx-auto text-center">
              <h3 className="text-3xl font-bold text-black mb-12">Quick Tips to Spot Fake News</h3>
              <div className="grid gap-10 md:grid-cols-3 px-6">
                {[
                  {
                    title: "Check the Source",
                    desc: "Is it from a credible publication you recognize and trust?",
                  },
                  {
                    title: "Read Beyond Headlines",
                    desc: "Click through before sharing — misleading headlines are common.",
                  },
                  {
                    title: "Check Your Emotions",
                    desc: "If something makes you angry or scared instantly, pause and verify it.",
                  },
                ].map((tip, i) => (
                  <div key={i} className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-xl">?</div>
                    <h4 className="text-xl font-semibold text-gray-900">{tip.title}</h4>
                    <p className="mt-2 text-gray-600">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- CLEAN & COHESIVE: 6 Steps to Verify Information ---- */}
            <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
            <div className="mx-auto max-w-6xl">
                <h2 className="text-center text-4xl font-extrabold text-black">
                6 Steps to <span className="text-orange-600">Verify Information</span>
                </h2>
                <p className="mt-4 text-center text-gray-600 text-lg">
                Follow these key steps to determine if what you're reading is truly credible.
                </p>

                <div className="mt-16 grid gap-10 lg:grid-cols-2">
                {tips.map((tip) => (
                    <div
                    key={tip.number}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                    {/* Number Badge */}
                    <div className="mb-5 flex items-center gap-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-lg shadow-sm">
                        {tip.number}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{tip.title}</h3>
                    </div>

                    {/* Icon & Description */}
                    <div className="text-2xl mb-3 text-orange-500">{tip.icon}</div>
                    <p className="text-gray-700 leading-relaxed">{tip.description}</p>

                    {/* Subtle hover effect */}
                    <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-orange-400 transition-all duration-300"></div>
                    </div>
                ))}
                </div>
            </div>
            </section>
            {/* ---- end clean section ---- */}


          {/* CTA */}
          <div className="text-center mt-20">
            <h3 className="text-3xl font-bold text-black mb-4">Be a Critical Thinker</h3>
            <p className="text-gray-700 max-w-2xl mx-auto mb-8">
              In a world of viral misinformation, your awareness is the best defense. Think, verify, and share responsibly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold">Learn More</Button>
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white px-8 py-3 rounded-lg font-semibold transition-all">
                Share This Guide
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 w-full py-28 bg-gray-50 border-t border-gray-200 mt-24">
          <div className="text-center mb-20 px-4">
            <h2 className="text-5xl md:text-6xl font-extrabold text-orange-500 mb-3 drop-shadow-sm">
              Platform <span className="text-black">Highlights</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-2xl max-w-3xl mx-auto">
              Cutting-edge features that power real-time truth verification.
            </p>
          </div>

          {/* Auto-scrolling carousel */}
          <div
            ref={(el) => {
              if (!el) return;
              let running = true;
              const scrollSpeed = 0.7; // adjust scroll speed here

              const scroll = () => {
                if (running) el.scrollLeft += scrollSpeed;
                if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
                requestAnimationFrame(scroll);
              };
              requestAnimationFrame(scroll);

              el.addEventListener("mouseenter", () => (running = false));
              el.addEventListener("mouseleave", () => (running = true));
            }}
            className="flex gap-8 overflow-x-auto px-12 pb-10 scroll-smooth scroll-container"
          >
            {[
              {
                title: "Multimodal Misinformation Detection",
                desc: "Analyze text, images, and videos together to detect manipulation and deepfakes in real time.",
              },
              {
                title: "Knowledge Graph Integration",
                desc: "Cross-verify information from reliable databases using a multi-layer knowledge graph.",
              },
              {
                title: "Real-Time Event Validation",
                desc: "Instantly validate live events such as elections, disasters, and news broadcasts.",
              },
              {
                title: "Profile Behavior Scoring",
                desc: "Assess social media profiles based on activity, credibility, and influence.",
              },
              {
                title: "Dynamic Hashtag Analysis",
                desc: "Predict and monitor trending hashtags to identify misinformation campaigns.",
              },
            ].map((feature, i) => (
              <div key={i} className="min-w-[320px] max-w-[350px] bg-white shadow-md rounded-2xl p-6 flex flex-col items-center justify-between border border-gray-100 hover:shadow-lg transition-all duration-300 flex-shrink-0">
                <div className="w-full h-44 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl mb-5 flex items-center justify-center text-gray-400 text-sm italic">
                  Media Placeholder
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-sm text-center">{feature.desc}</p>
              </div>
            ))}
            <div className="min-w-[320px] flex-shrink-0" aria-hidden />
          </div>

          {/* Hide scrollbar */}
          <style jsx>{`
            .scroll-container {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scroll-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </section>

        {/* Sources Section */}
        <section id="sources" className="relative z-10 w-full py-28 bg-white border-t border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 opacity-70 pointer-events-none"></div>

          <div className="relative text-center mb-16 px-4 z-10">
            <h2 className="text-5xl md:text-6xl font-extrabold text-orange-600 mb-4 drop-shadow-sm">Verified Sources</h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              TruthLens collaborates with globally trusted news organizations and verified data partners.
            </p>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
            {[
              { name: "BBC News", logo: "BBC.png" },
              { name: "Reuters", logo: "Reuters.png" },
              { name: "Associated Press", logo: "AP.svg" },
              { name: "The Guardian", logo: "guardian.png" },
              { name: "NDTV", logo: "NDTV.png" },
              { name: "CNN", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg" },
              { name: "Al Jazeera", logo: "Jazeera.png" },
              { name: "Times of India", logo: "TOI.png" },
              { name: "Hindustan Times", logo: "HT.jpeg" },
              { name: "ANI", logo: "ANI.jpg" },
            ].map((src, i) => (
              <div key={i} className="flex items-center justify-between w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 flex items-center justify-center">
                    <img src={src.logo} alt={src.name} className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-all duration-300" />
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-gray-800">{src.name}</p>
                </div>
                <span className="text-sm md:text-base font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Verified</span>
              </div>
            ))}
          </div>
        </section>

        {showModal && <VideoUploadModal
            onClose={() => setShowModal(false)}
            onUploadComplete={(types, verificationData) => {
              setShowModal(false);
              if (verificationData) {
                router.push(`/results?types=${types.join(",")}&verified=true`);
              } else {
                router.push(`/results?types=${types.join(",")}`);
              }
            }}
          />}

        {/* Dialog-style Newsletter component */}
        <NewsletterSubscribe open={showNewsletter} onOpenChange={setShowNewsletter} />
      </main>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}
