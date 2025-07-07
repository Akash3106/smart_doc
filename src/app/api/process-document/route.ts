import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedContent = '';
    let metadata = {
      title: file.name,
      author: '',
      pageCount: 0,
      wordCount: 0,
      fileType: file.type,
      fileSize: file.size
    };

    // Process based on file type
    switch (file.type) {
      case 'application/pdf':
        const pdfData = await pdf(buffer);
        extractedContent = pdfData.text;
        metadata.pageCount = pdfData.numpages;
        metadata.wordCount = extractedContent.split(/\s+/).length;
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedContent = docxResult.value;
        metadata.wordCount = extractedContent.split(/\s+/).length;
        break;

      case 'text/plain':
        extractedContent = buffer.toString('utf-8');
        metadata.wordCount = extractedContent.split(/\s+/).length;
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        );
    }

    // Clean up content
    extractedContent = extractedContent
      .replace(/\s+/g, ' ')
      .trim();

    if (!extractedContent) {
      return NextResponse.json(
        { error: 'No readable content found in the document' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: extractedContent,
        metadata: metadata,
        fileName: file.name,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Document processing error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process the document. Please check if the file is not corrupted.' },
      { status: 500 }
    );
  }
} 