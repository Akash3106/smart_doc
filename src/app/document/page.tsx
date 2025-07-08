"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { sendChatMessage, addMessage, setDocumentContent } from "@/store/slices/chatSlice";
import { useRouter } from "next/navigation";

export default function DocumentPage() {
  const router = useRouter();

  const [documentName, setDocumentName] = useState("Document");
  const [documentType, setDocumentType] = useState<"file" | "url">("file");
  const [inputMessage, setInputMessage] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Hardcoded password
  const HARDCODED_PASSWORD = process.env.NEXT_PUBLIC_HARDCODED_PASSWORD;

  // Get Redux state
  const dispatch = useAppDispatch();
  const processedDocument = useAppSelector(state => state.document.processedDocument);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeTab = useAppSelector(state => (state as any).ui.activeTab);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrapedData = useAppSelector(state => (state as any).scraping.scrapedData);
  const messages = useAppSelector(state => state.chat.messages);
  const isLoading = useAppSelector(state => state.chat.isLoading);
  const error = useAppSelector(state => state.chat.error);
  const documentContent = useAppSelector(state => state.chat.documentContent);

  // Function to truncate long names
  const truncateName = (name: string) => {
    const words = name.split(' ');
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return name;
  };

  // Password validation function
  const validatePassword = (inputPassword: string) => {
    const isValid = inputPassword === HARDCODED_PASSWORD;
    setIsPasswordValid(isValid);
    setShowPasswordError(!isValid && inputPassword.length > 0);
    return isValid;
  };

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length > 0) {
      validatePassword(value);
    } else {
      setIsPasswordValid(false);
      setShowPasswordError(false);
    }
  };

  useEffect(() => {
    // Use Redux state for processed document data
    if (!processedDocument && !scrapedData) {
      router.push("/");
      return;
    }
    if (activeTab === "file" && processedDocument) {
      const name = processedDocument.fileName || processedDocument.metadata?.title || "Uploaded Document";
      setDocumentName(truncateName(name));
      setDocumentType("file");
      // Set document content for chat
      if (processedDocument.content) {
        dispatch(setDocumentContent(processedDocument.content));
      }
    } else if (activeTab === "url" && scrapedData) {
      // Use Redux state for scraped data
      const name = scrapedData.title || "Scraped Content";
      setDocumentName(truncateName(name));
      setDocumentType("url");
      // Set document content for chat
      if (scrapedData.content) {
        dispatch(setDocumentContent(scrapedData.content));
      }
    }
  }, [processedDocument, scrapedData, activeTab, dispatch, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !documentContent) return;

    // Check password before sending message
    if (!isPasswordValid) {
      setShowPasswordError(true);
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    dispatch(addMessage(userMessage));

    // Send message to AI
    await dispatch(sendChatMessage({
      prompt: inputMessage,
      documentContent,
      conversationHistory: messages,
    }));

    setInputMessage("");
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex flex-col">
      {/* Header */}
      <header className="flex items-center px-8 py-6 border-b-2 border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2 border border-blue-200">
            <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-900">{documentName}</div>
            <div className="text-xs text-gray-500">
              {documentType === "file" ? "Document Content" : "URL Content"} · Ready for conversation
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 w-full max-w-6xl mx-auto py-8 gap-8">
        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="font-bold text-xl text-gray-900 mb-4">AI Assistant</div>
            
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1 border border-blue-200">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-800 flex-1 shadow-sm">
                  Hello! I&apos;ve processed &quot;{documentName}&quot; and I&apos;m ready to answer your questions about it. What would you like to know?
                  <div className="text-xs text-gray-400 mt-2">{formatTime(new Date().toISOString())}</div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="bg-blue-100 rounded-full p-2 mt-1 border border-blue-200">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </div>
                  )}
                  <div className={`rounded-xl px-5 py-4 flex-1 max-w-[80%] border ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    {message.content}
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-gray-100 rounded-full p-2 mt-1 border border-gray-200">
                      <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1 border border-blue-200">
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-800 flex-1 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1 border border-red-200">
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-800 flex-1 shadow-sm">
                    Error: {error}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t top-0 border-gray-200 bg-gray-50">
            {/* Password Input */}
            {!isPasswordValid && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Enter Password to Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter password..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white shadow-sm"
                  />
                  {isPasswordValid && (
                    <div className="text-green-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                {showPasswordError && (
                  <div className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Incorrect password
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isPasswordValid ? "Ask a question about the document..." : "Enter password first..."}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white shadow-sm"
                disabled={isLoading || !documentContent || !isPasswordValid}
              />
              <button 
                type="submit" 
                disabled={isLoading || !inputMessage.trim() || !documentContent || !isPasswordValid}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg p-3 transition-colors border border-blue-600 shadow-sm"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="w-full max-w-xs flex flex-col gap-6">
          <button className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
          onClick={() => router.push("/")}
          >
            Process New Document
          </button>
          
          {/* Special Summary Button */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white border border-blue-400 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 rounded-full p-2 border border-white/30">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm">AI Summary</div>
                <div className="text-xs opacity-90">Generate key insights</div>
              </div>
            </div>
            <button 
              onClick={() => setInputMessage("Please provide a concise summary and the key takeaways from this document. Focus on the most important points and actionable insights.")}
              disabled={!isPasswordValid}
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed border border-white/30 rounded-lg py-3 font-semibold text-white transition-all duration-200 text-sm shadow-sm"
            >
              Generate Summary & Key Takeaways
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Suggested Questions</div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setInputMessage("What are the main topics covered in this document?")}
                disabled={!isPasswordValid}
                className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition text-sm shadow-sm"
              >
                What are the main topics covered in this document?
              </button>
              <button 
                onClick={() => setInputMessage("Can you summarize the key points?")}
                disabled={!isPasswordValid}
                className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition text-sm shadow-sm"
              >
                Can you summarize the key points?
              </button>
              <button 
                onClick={() => setInputMessage("What are the most important takeaways?")}
                disabled={!isPasswordValid}
                className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition text-sm shadow-sm"
              >
                What are the most important takeaways?
              </button>
              <button 
                onClick={() => setInputMessage("Are there any specific recommendations mentioned?")}
                disabled={!isPasswordValid}
                className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition text-sm shadow-sm"
              >
                Are there any specific recommendations mentioned?
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
} 