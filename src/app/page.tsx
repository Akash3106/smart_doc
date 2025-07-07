"use client";

import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [tab, setTab] = useState<'file' | 'url'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex flex-col items-center py-12 px-2">
      {/* Header */}
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#7b3aed] mb-4">Smart Document Assistant</h1>
        <p className="text-gray-600 text-lg font-medium">
          Upload files or provide URLs to any documentation. Our AI will process the content so you can ask questions and have intelligent conversations with your documents.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-14 w-full max-w-4xl justify-center">
        {/* File Upload Card */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col items-center">
          <div className="mb-3">
            <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /></svg>
          </div>
          <div className="font-bold text-lg mb-1 text-black">File Upload</div>
          <div className="text-gray-500 text-center text-sm">Support for PDF, DOCX, and TXT files with instant processing</div>
        </div>
        {/* URL Processing Card */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col items-center">
          <div className="mb-3">
            <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656m-3.656-5.656a4 4 0 000 5.656m1.414-1.414a2 2 0 002.828 0l3.536-3.536a2 2 0 10-2.828-2.828l-3.536 3.536a2 2 0 000 2.828z" /></svg>
          </div>
          <div className="font-bold text-lg mb-1 text-black">URL Processing</div>
          <div className="text-gray-500 text-center text-sm">Process any online documentation or web content directly</div>
        </div>
        {/* AI Chat Card */}
        <div className="flex-1 bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col items-center">
          <div className="mb-3">
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8a9 9 0 100-18 9 9 0 000 18zm-3 0v-1a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </div>
          <div className="font-bold text-lg mb-1 text-black">AI Chat</div>
          <div className="text-gray-500 text-center text-sm">Ask questions and get contextual insights from your documents</div>
        </div>
      </div>

      {/* Process Your Document Section */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <svg className="h-6 w-6 text-gray-700 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0V7a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" /></svg>
          <h2 className="text-xl font-bold text-gray-900">Process Your Document</h2>
        </div>
        {/* Tab Switcher */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-150 ${tab === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
            onClick={e => { e.preventDefault(); setTab('file'); }}
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /></svg>
            Upload File
          </button>
          <button
            className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-150 ${tab === 'url' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
            onClick={e => { e.preventDefault(); setTab('url'); }}
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656m-3.656-5.656a4 4 0 000 5.656m1.414-1.414a2 2 0 002.828 0l3.536-3.536a2 2 0 10-2.828-2.828l-3.536 3.536a2 2 0 000 2.828z" /></svg>
            From URL
          </button>
        </div>
        {/* File Upload or URL Input */}
        {tab === 'file' ? (
          <div
            className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center py-12 cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 48 48"><path strokeLinecap="round" strokeLinejoin="round" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" /></svg>
            <div className="text-gray-500 text-lg font-medium mb-1">Drop your file here or click to browse</div>
            <div className="text-xs text-gray-400">PDF, DOCX, TXT up to 10MB</div>
            {fileName && (
              <div className="mt-2 text-green-600 font-medium text-sm">{fileName}</div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <label htmlFor="url-input" className="text-sm font-medium text-gray-700 mb-1">Paste your document URL</label>
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com/document"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            <button className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-base">Process URL</button>
          </div>
        )}
      </div>
    </div>
  );
}
