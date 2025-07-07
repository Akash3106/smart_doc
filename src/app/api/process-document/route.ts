import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfParse: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mammoth: any;

// Initialize modules only when needed
const getPdfParse = async () => {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
};

const getMammoth = async () => {
  if (!mammoth) {
    mammoth = (await import('mammoth')).default;
  }
  return mammoth;
};

export async function POST(request: NextRequest) {
  console.log('API route called');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file');

    if (!file) {
      console.log('No file uploaded');
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

    console.log('File type:', file.type, 'Allowed:', allowedTypes.includes(file.type));

    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    console.log('File size:', file.size, 'Max size:', maxSize);

    if (file.size > maxSize) {
      console.log('File too large');
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log('Processing file:', file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedContent = '';
    const metadata = {
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
        console.log('Processing PDF file');
        try {
          // Use dynamic import for pdf-parse
          const pdfParseModule = await getPdfParse();
          console.log('PDF-parse module loaded');
          
          const pdfData = await pdfParseModule(buffer);
          console.log('PDF parsed successfully, pages:', pdfData.numpages);
          
          extractedContent = pdfData.text || '';
          metadata.pageCount = pdfData.numpages || 0;
          metadata.wordCount = extractedContent.split(/\s+/).filter(word => word.length > 0).length;
          
          console.log('PDF processed successfully, content length:', extractedContent.length);
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
          
          // Fallback to placeholder if PDF processing fails
          console.log('Using PDF fallback');
          extractedContent = `[PDF File: ${file.name}]\n\nThis is a PDF file that has been uploaded. PDF text extraction encountered an error. The file contains ${Math.ceil(file.size / 1024)} KB of data.\n\nError: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`;
          metadata.wordCount = extractedContent.split(/\s+/).filter(word => word.length > 0).length;
        }
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        console.log('Processing DOCX/DOC file');
        try {
          // Use dynamic import for mammoth
          const mammothModule = await getMammoth();
          console.log('Mammoth module imported successfully');
          
          const docxResult = await mammothModule.extractRawText({ buffer });
          extractedContent = docxResult.value || '';
          metadata.wordCount = extractedContent.split(/\s+/).filter(word => word.length > 0).length;
          
          console.log('DOCX processed successfully, content length:', extractedContent.length);
        } catch (docxError) {
          console.error('DOCX processing error:', docxError);
          return NextResponse.json(
            { error: 'Failed to process DOCX file. The file might be corrupted.' },
            { status: 500 }
          );
        }
        break;

      case 'text/plain':
        console.log('Processing text file');
        extractedContent = buffer.toString('utf-8');
        metadata.wordCount = extractedContent.split(/\s+/).filter(word => word.length > 0).length;
        console.log('Text file processed successfully, content length:', extractedContent.length);
        break;

      default:
        console.log('Unsupported file type:', file.type);
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        );
    }

    // Clean up content
    extractedContent = extractedContent
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Content length after cleanup:', extractedContent.length);

    if (!extractedContent) {
      console.log('No content extracted');
      return NextResponse.json(
        { error: 'No readable content found in the document' },
        { status: 400 }
      );
    }

    const response = {
      success: true,
      data: {
        content: extractedContent,
        metadata: metadata,
        fileName: file.name,
        processedAt: new Date().toISOString()
      }
    };

    console.log('Returning successful response');
    return NextResponse.json(response);

  } catch (error) {
    console.error('Document processing error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process the document. Please check if the file is not corrupted.' },
      { status: 500 }
    );
  }
} 