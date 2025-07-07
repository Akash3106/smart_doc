"use client";

export default function DocumentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex flex-col">
      {/* Header */}
      <header className="flex items-center px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-900">docs.snowflake.com</div>
            <div className="text-xs text-gray-500">URL Content · Ready for conversation</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 w-full max-w-6xl mx-auto py-8 gap-8">
        {/* Chat Area */}
        <section className="flex-1 flex flex-col">
          <div className="mb-6">
            <div className="font-bold text-xl text-gray-900 mb-4">AI Assistant</div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-800 flex-1">
                Hello! I've processed "docs.snowflake.com" and I'm ready to answer your questions about it. What would you like to know?
                <div className="text-xs text-gray-400 mt-2">23:59:39</div>
              </div>
            </div>
          </div>
          {/* Chat Input */}
          <div className="mt-auto pt-8">
            <form className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question about the document..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="w-full max-w-xs flex flex-col gap-6">
          <button className="w-full bg-white border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50 transition">Process New Document</button>
          <div>
            <div className="font-semibold text-gray-900 mb-3">Suggested Questions</div>
            <div className="flex flex-col gap-2">
              <button className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm">What are the main topics covered in this document?</button>
              <button className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm">Can you summarize the key points?</button>
              <button className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm">What are the most important takeaways?</button>
              <button className="text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm">Are there any specific recommendations mentioned?</button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
} 