# Blog Knowledge - Smart Document Assistant

A Next.js application that allows users to upload files or provide URLs to scrape blog content and process it for AI-powered conversations.

## Features

### 🚀 Core Functionality

- **File Upload**: Support for DOCX, and TXT files
- **URL Processing**: Scrape blog content from any URL
- **AI Chat**: Ask questions and get contextual insights from your documents using OpenAI's GPT models
- **Smart Content Extraction**: Automatically extracts titles, authors, content, and metadata
- **Conversation History**: Maintains chat history for contextual conversations

### 📊 Blog Scraping API

The application includes a powerful blog scraping API that extracts:

- **Title**: Page title and main headings
- **Content**: Clean, readable text content
- **Author**: Author information from meta tags or page content
- **Published Date**: Publication date from various sources
- **Description**: Meta description and Open Graph data
- **Keywords**: Meta keywords for SEO analysis
- **Images**: All image URLs found on the page
- **Links**: All external links for further analysis

## API Endpoints

### POST `/api/chat`

Chat with OpenAI about document content.

**Request Body:**

```json
{
  "prompt": "What are the main topics covered?",
  "documentContent": "Document content here...",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous question"
    },
    {
      "role": "assistant",
      "content": "Previous answer"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "response": "AI response based on document content",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST `/api/scrape`

Scrapes blog content from a provided URL.

**Request Body:**

```json
{
  "url": "https://example.com/blog-post"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "Blog Post Title",
    "content": "Extracted blog content...",
    "author": "Author Name",
    "publishedDate": "2024-01-01T00:00:00Z",
    "description": "Blog post description",
    "keywords": "blog, content, keywords",
    "images": ["https://example.com/image1.jpg"],
    "links": ["https://example.com/link1"]
  },
  "url": "https://example.com/blog-post",
  "scrapedAt": "2024-01-01T12:00:00Z"
}
```

## Getting Started

### Prerequisites

- Node.js 20.18.1 or higher
- npm or yarn
- OpenAI API key (for AI chat functionality)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd blog_knowledge
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add your OpenAI API key:

```bash
# OpenAI API Configuration
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Testing the Scraping API

Visit `/test-scrape` to test the blog scraping functionality with a user-friendly interface.

### Main Application

1. Go to the homepage
2. Choose between "Upload File" or "From URL" tabs
3. For URL processing:
   - Enter a blog URL
   - Click "Process URL"
   - The scraped content will be available for AI chat
4. For file upload:
   - Upload a PDF, DOCX, or TXT file
   - The document content will be processed and available for AI chat
5. Chat with AI:
   - Navigate to the document page
   - Ask questions about the content
   - Use suggested questions or type your own
   - View conversation history

## Technical Details

### Dependencies

- **Next.js 15.3.5**: React framework with App Router
- **Cheerio**: Server-side HTML parsing and manipulation
- **Axios**: HTTP client for web scraping
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

### Architecture

- **API Routes**: Next.js API routes for server-side functionality
- **Client Components**: React components with client-side interactivity
- **Server Components**: Static rendering for better performance

### Error Handling

The scraping API includes comprehensive error handling for:

- Invalid URLs
- Network timeouts
- Unreachable websites
- Malformed HTML content

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── scrape/
│   │       └── route.ts          # Blog scraping API
│   ├── test-scrape/
│   │   └── page.tsx              # Test interface
│   ├── document/
│   │   └── page.tsx              # Document processing page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
```

### Adding New Features

1. Create new API routes in `src/app/api/`
2. Add new pages in `src/app/`
3. Update the main interface in `src/app/page.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
