import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing PDF module availability');
    
    // Test if pdfjs-dist is available
    try {
      const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
      console.log('PDF.js module available');
      
      return NextResponse.json({
        success: true,
        message: 'PDF.js module is available',
        module: 'pdfjs-dist'
      });
    } catch (requireError) {
      console.error('PDF.js module require failed:', requireError);
      
      return NextResponse.json({
        success: false,
        error: 'PDF.js module not available',
        requireError: requireError instanceof Error ? requireError.message : 'Unknown require error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 