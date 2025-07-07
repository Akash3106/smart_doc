import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid URL format ${error}`},
        { status: 400 }
      );
    }

    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract blog data
    const scrapedData = {
      title: '',
      content: '',
      author: '',
      publishedDate: '',
      description: '',
      keywords: '',
      images: [] as string[],
      links: [] as string[]
    };

    // Extract title
    scrapedData.title = $('title').text().trim() || 
                       $('h1').first().text().trim() ||
                       $('meta[property="og:title"]').attr('content') || '';

    // Extract main content
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      'main',
      '.blog-content'
    ];

    // Find the best content element
    let contentElement = $('body'); // Default fallback
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        contentElement = element;
        break;
      }
    }

    // Clean and extract text content
    scrapedData.content = contentElement
      .find('p, h1, h2, h3, h4, h5, h6, li, blockquote')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(text => text.length > 10) // Filter out very short text
      .join('\n\n');

    // Extract author
    scrapedData.author = $('.author, .byline, [rel="author"]').text().trim() ||
                        $('meta[name="author"]').attr('content') || '';

    // Extract published date
    scrapedData.publishedDate = $('time').attr('datetime') ||
                               $('meta[property="article:published_time"]').attr('content') ||
                               $('.date, .published').text().trim() || '';

    // Extract description
    scrapedData.description = $('meta[name="description"]').attr('content') ||
                             $('meta[property="og:description"]').attr('content') || '';

    // Extract keywords
    scrapedData.keywords = $('meta[name="keywords"]').attr('content') || '';

    // Extract images
    scrapedData.images = $('img')
      .map((_, el) => {
        const src = $(el).attr('src');
        const dataSrc = $(el).attr('data-src');
        return src || dataSrc;
      })
      .get()
      .filter(src => src && src.startsWith('http'));

    // Extract links
    scrapedData.links = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get()
      .filter(href => href && href.startsWith('http'));

    // Clean up content (remove extra whitespace)
    scrapedData.content = scrapedData.content
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({
      success: true,
      data: scrapedData,
      url: url,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        return NextResponse.json(
          { error: 'URL not found or unreachable' },
          { status: 404 }
        );
      }
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to scrape the URL. Please check if the URL is accessible.' },
      { status: 500 }
    );
  }
} 