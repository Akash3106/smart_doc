"use client";

import { useState } from "react";

interface ScrapedData {
  title: string;
  content: string;
  author: string;
  publishedDate: string;
  description: string;
  keywords: string;
  images: string[];
  links: string[];
}

interface ScrapeResponse {
  success: boolean;
  data: ScrapedData;
  url: string;
  scrapedAt: string;
}

export default function TestScrape() {
  const [url, setUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [scrapedData, setScrapedData] = useState<ScrapeResponse | null>(null);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsProcessing(true);
    setError("");
    setScrapedData(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape URL');
      }

      setScrapedData(data);
    } catch (error) {
      console.error('Error processing URL:', error);
      setError(error instanceof Error ? error.message : 'Failed to process URL');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Blog Scraping Test
        </h1>

        <form onSubmit={handleScrape} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Blog URL
            </label>
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/blog-post"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isProcessing}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isProcessing ? 'Scraping...' : 'Scrape Blog'}
          </button>
        </form>

        {scrapedData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Scraped Data</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Title:</span>
                    <p className="text-gray-800 mt-1">{scrapedData.data.title || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Author:</span>
                    <p className="text-gray-800 mt-1">{scrapedData.data.author || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Published Date:</span>
                    <p className="text-gray-800 mt-1">{scrapedData.data.publishedDate || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Description:</span>
                    <p className="text-gray-800 mt-1">{scrapedData.data.description || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Keywords:</span>
                    <p className="text-gray-800 mt-1">{scrapedData.data.keywords || 'Not found'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Content & Links</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Content Preview:</span>
                    <p className="text-gray-800 mt-1 text-sm line-clamp-4">
                      {scrapedData.data.content.substring(0, 200)}...
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Images Found:</span>
                    <p className="text-gray-800 mt-1">{scrapedData.data.images.length} images</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Links Found:</span>
                    <p className="text-gray-800 mt-1">{scrapedData.data.links.length} links</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Full Content</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {scrapedData.data.content}
                </pre>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>Scraped from: {scrapedData.url}</p>
              <p>Scraped at: {new Date(scrapedData.scrapedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 