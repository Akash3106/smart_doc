"use client";

import { useState, useRef } from "react";

interface ProcessedDocument {
  content: string;
  metadata: {
    title: string;
    author: string;
    pageCount: number;
    wordCount: number;
    fileType: string;
    fileSize: number;
  };
  fileName: string;
  processedAt: string;
}

interface DocumentResponse {
  success: boolean;
  data: ProcessedDocument;
}

export default function TestDocument() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [processedDocument, setProcessedDocument] = useState<DocumentResponse | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessing(true);
      setError("");
      setProcessedDocument(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/process-document', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to process document');
        }

        setProcessedDocument(data);
      } catch (error) {
        console.error('Error processing document:', error);
        setError(error instanceof Error ? error.message : 'Failed to process document');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Document Processing Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document (PDF, DOCX, DOC, TXT)
            </label>
            <div
              className={`w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center py-8 cursor-pointer transition-colors ${
                isProcessing ? 'border-gray-400 cursor-not-allowed' : 'hover:border-blue-400'
              }`}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <div className="text-gray-600 text-lg font-medium mb-1">Processing document...</div>
                  <div className="text-xs text-gray-400">Please wait</div>
                </div>
              ) : (
                <>
                  <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                  </svg>
                  <div className="text-gray-500 text-lg font-medium mb-1">Drop your document here or click to browse</div>
                  <div className="text-xs text-gray-400">PDF, DOCX, DOC, TXT up to 10MB</div>
                </>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {processedDocument && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Processed Document</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Document Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">File Name:</span>
                    <p className="text-gray-800 mt-1">{processedDocument.data.fileName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">File Type:</span>
                    <p className="text-gray-800 mt-1">{processedDocument.data.metadata.fileType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">File Size:</span>
                    <p className="text-gray-800 mt-1">{(processedDocument.data.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Word Count:</span>
                    <p className="text-gray-800 mt-1">{processedDocument.data.metadata.wordCount.toLocaleString()} words</p>
                  </div>
                  {processedDocument.data.metadata.pageCount > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">Page Count:</span>
                      <p className="text-gray-800 mt-1">{processedDocument.data.metadata.pageCount} pages</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Content Preview</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Content Length:</span>
                    <p className="text-gray-800 mt-1">{processedDocument.data.content.length.toLocaleString()} characters</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Preview:</span>
                    <p className="text-gray-800 mt-1 text-sm line-clamp-4">
                      {processedDocument.data.content.substring(0, 200)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Full Content</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {processedDocument.data.content}
                </pre>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>Processed at: {new Date(processedDocument.data.processedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 