"use client";

import { useState, useRef } from "react";

export default function TestPDF() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessing(true);
      setError("");
      setResult("");

      try {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

        const response = await fetch('/api/process-document', {
          method: 'POST',
          body: formData,
        });

        console.log('Response status:', response.status);

        const responseText = await response.text();
        console.log('Raw response text:', responseText);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} - ${responseText.substring(0, 200)}`);
        }

        try {
          const data = JSON.parse(responseText);
          setResult(JSON.stringify(data, null, 2));
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setError(error instanceof Error ? error.message : 'Failed to process file');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          PDF Processing Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF File
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
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <div className="text-gray-600 text-lg font-medium mb-1">Processing PDF...</div>
                </div>
              ) : (
                <>
                  <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                  </svg>
                  <div className="text-gray-500 text-lg font-medium mb-1">Click to upload PDF</div>
                  <div className="text-xs text-gray-400">PDF files only, up to 10MB</div>
                </>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Result:</h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
                {result}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Upload a PDF file to test the processing</li>
            <li>• Check the browser console for detailed logs</li>
            <li>• The API will extract text content from the PDF</li>
            <li>• If PDF processing fails, it will show a fallback message</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 