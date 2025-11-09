import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { geminiService } from '@/lib/geminiService';
import { newsApiService } from '@/lib/newsApi';

interface ApiTestResult {
  success: boolean;
  error?: string;
  response?: string;
}

export function ApiKeyTester() {
  const [geminiResult, setGeminiResult] = useState<ApiTestResult | null>(null);
  const [newsResult, setNewsResult] = useState<ApiTestResult | null>(null);
  const [testing, setTesting] = useState<{ gemini: boolean; news: boolean }>({
    gemini: false,
    news: false
  });

  const testGeminiApi = async () => {
    setTesting(prev => ({ ...prev, gemini: true }));
    try {
      const result = await geminiService.testApiKey();
      setGeminiResult(result);
    } catch (error) {
      setGeminiResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(prev => ({ ...prev, gemini: false }));
    }
  };

  const testNewsApi = async () => {
    setTesting(prev => ({ ...prev, news: true }));
    try {
      const articles = await newsApiService.searchNews('test', 1);
      setNewsResult({
        success: true,
        response: `Found ${articles.length} articles`
      });
    } catch (error) {
      setNewsResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(prev => ({ ...prev, news: false }));
    }
  };

  const renderResult = (result: ApiTestResult | null, testing: boolean) => {
    if (testing) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Testing...</span>
        </div>
      );
    }

    if (!result) return null;

    if (result.success) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>✅ API Key Working</span>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-4 h-4" />
            <span>❌ API Key Failed</span>
          </div>
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 max-w-md">
            {result.error}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">API Configuration Test</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Gemini AI API</h4>
            <p className="text-sm text-gray-600">Tests claim extraction and verification</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={testGeminiApi} 
              disabled={testing.gemini}
              size="sm"
              variant="outline"
            >
              Test Gemini API
            </Button>
          </div>
        </div>
        {renderResult(geminiResult, testing.gemini)}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">News API</h4>
            <p className="text-sm text-gray-600">Tests news article search</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={testNewsApi} 
              disabled={testing.news}
              size="sm"
              variant="outline"
            >
              Test News API
            </Button>
          </div>
        </div>
        {renderResult(newsResult, testing.news)}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Get Gemini API key from: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
          <li>2. Get News API key from: <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="underline">NewsAPI.org</a></li>
          <li>3. Add both keys to your .env.local file</li>
          <li>4. Restart your development server</li>
        </ul>
      </div>
    </div>
  );
}

export default ApiKeyTester;
