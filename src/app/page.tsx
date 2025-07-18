"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTab, addNotification } from "@/store/slices/uiSlice";
import { setCurrentFile, processDocument, clearError } from "@/store/slices/documentSlice";
import { setCurrentUrl, scrapeUrl } from "@/store/slices/scrapingSlice";
import Notification from "@/components/Notification";
// import { RootState } from "@/store/store";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Redux hooks
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { activeTab } = useAppSelector(state => (state as any).ui);
  const { currentFile, isProcessing: isProcessingFile, error: fileError } = useAppSelector(state => state.document);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUrl, isScraping, error: scrapingError } = useAppSelector(state => (state as any).scraping);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      dispatch(setCurrentFile(file));
      dispatch(clearError());
      
      try {
        const result = await dispatch(processDocument(file)).unwrap();
        
        // Store the processed document data
        localStorage.setItem('processedDocument', JSON.stringify({ success: true, data: result }));
        dispatch(addNotification({ type: 'success', message: 'Document processed successfully!' }));
        router.push("/document");
      } catch (error) {
        console.error('Error processing file:', error);
        dispatch(addNotification({ type: 'error', message: error as string }));
      }
    }
  };

  const handleProcessUrl = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!currentUrl.trim()) {
      dispatch(addNotification({ type: 'error', message: 'Please enter a valid URL' }));
      return;
    }

    try {
      const result = await dispatch(scrapeUrl(currentUrl.trim())).unwrap();
      
      // Store the scraped data in localStorage
      localStorage.setItem('scrapedData', JSON.stringify(result));
      dispatch(addNotification({ type: 'success', message: 'URL scraped successfully!' }));
      router.push("/document");
    } catch (error) {
      console.error('Error processing URL:', error);
      dispatch(addNotification({ type: 'error', message: error as string }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex flex-col items-center py-2 px-2 overflow-hidden animate-bgFadeIn">
      <Notification />
      {/* Header */}
      <div className="max-w-2xl w-full text-center mb-2 animate-fadeInUp">
        <h1 className="text-4xl font-extrabold text-[#7b3aed] mb-4">Smart Document Assistant</h1>
        <p className="text-gray-600 text-lg font-medium">
          Upload files or provide URLs to any documentation. Our AI will process the content so you can ask questions and have intelligent conversations with your documents.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-4 w-full max-w-4xl justify-center">
        {/* File Upload Card */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col items-center transform transition duration-500 hover:scale-105 hover:shadow-xl animate-fadeInUp delay-100">
          <div className="mb-3">
            <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /></svg>
          </div>
          <div className="font-bold text-lg mb-1 text-black">File Upload</div>
          <div className="text-gray-500 text-center text-sm">Support for DOCX, and TXT files with instant processing</div>
        </div>
        {/* URL Processing Card */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col items-center transform transition duration-500 hover:scale-105 hover:shadow-xl animate-fadeInUp delay-200">
          <div className="mb-3">
            <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656m-3.656-5.656a4 4 0 000 5.656m1.414-1.414a2 2 0 002.828 0l3.536-3.536a2 2 0 10-2.828-2.828l-3.536 3.536a2 2 0 000 2.828z" /></svg>
          </div>
          <div className="font-bold text-lg mb-1 text-black">URL Processing</div>
          <div className="text-gray-500 text-center text-sm">Process any online documentation or web content directly</div>
        </div>
        {/* AI Chat Card */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col items-center transform transition duration-500 hover:scale-105 hover:shadow-xl animate-fadeInUp delay-300">
          <div className="mb-3">
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18zm-3 0v-1a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </div>
          <div className="font-bold text-lg mb-1 text-black">AI Chat</div>
          <div className="text-gray-500 text-center text-sm">Ask questions and get contextual insights from your documents</div>
        </div>
      </div>

      {/* Process Your Document Section */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow border border-gray-200 p-8 animate-fadeInUp delay-400">
        <div className="flex items-center mb-6">
          <svg className="h-6 w-6 text-gray-700 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0V7a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" /></svg>
          <h2 className="text-xl font-bold text-gray-900">Process Your Document</h2>
        </div>
        {/* Tab Switcher */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-150 ${activeTab === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
            onClick={e => { e.preventDefault(); dispatch(setActiveTab('file')); }}
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /></svg>
            Upload File
          </button>
          <button
            className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-150 ${activeTab === 'url' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
            onClick={e => { e.preventDefault(); dispatch(setActiveTab('url')); }}
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656m-3.656-5.656a4 4 0 000 5.656m1.414-1.414a2 2 0 002.828 0l3.536-3.536a2 2 0 10-2.828-2.828l-3.536 3.536a2 2 0 000 2.828z" /></svg>
            From URL
          </button>
        </div>
        {/* File Upload or URL Input */}
        {activeTab === 'file' ? (
          <div
            className={`w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center py-12 cursor-pointer transition-colors ${
              isProcessingFile ? 'border-gray-400 cursor-not-allowed' : 'hover:border-blue-400 animate-pulseBorder'
            } animate-fadeInUp delay-500`}
            onClick={() => !isProcessingFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessingFile}
            />
            {isProcessingFile ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <div className="text-gray-600 text-lg font-medium mb-1">Processing file...</div>
                <div className="text-xs text-gray-400">Please wait</div>
              </div>
            ) : (
              <>
                <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 48 48"><path strokeLinecap="round" strokeLinejoin="round" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" /></svg>
                <div className="text-gray-500 text-lg font-medium mb-1">Drop your file here or click to browse</div>
                <div className="text-xs text-gray-400">DOCX, TXT up to 10MB</div>
              </>
            )}
            {currentFile?.name && !isProcessingFile && (
              <div className="mt-2 text-green-600 font-medium text-sm">{currentFile.name}</div>
            )}
            {fileError && (
              <div className="mt-2 text-red-600 text-sm">{fileError}</div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fadeInUp delay-500">
            <label htmlFor="url-input" className="text-sm font-medium text-gray-700 mb-1">Paste your document URL</label>
            <input
              id="url-input"
              type="url"
              value={currentUrl}
              onChange={(e) => dispatch(setCurrentUrl(e.target.value))}
              placeholder="https://example.com/document"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            {scrapingError && (
              <div className="mt-2 text-red-600 text-sm">{scrapingError}</div>
            )}
            <button 
              onClick={handleProcessUrl} 
              disabled={isScraping}
              className={`mt-2 w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-base ${
                isScraping 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isScraping ? 'Processing...' : 'Process URL'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-2xl mt-8 animate-fadeInUp delay-600">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            {/* Social Handles - Left */}
            <div className="flex space-x-6">
              <a 
                href="https://linkedin.com/in/akash-04/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a 
                href="mailto:akash.sharma3106@gmail.com"
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Gmail
              </a>
            </div>

            {/* Copyright - Right */}
            <div className="text-gray-600">
              © 2025 Akash Deep Sharma. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
