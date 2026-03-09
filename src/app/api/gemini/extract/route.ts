import { NextRequest, NextResponse } from 'next/server';
import { geminiClient } from '@/lib/gemini/client';

// Increase body size limit using the new Next.js 14 format
export const maxDuration = 60; // Maximum duration in seconds
export const dynamic = 'force-dynamic'; // Ensure dynamic execution

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB for Gemini)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('📄 Processing file:', {
      name: file.name,
      type: file.type,
      size: `${(buffer.length / 1024).toFixed(2)} KB`
    });

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // Extract data using Gemini
    const extractedData = await geminiClient.extractBillData(buffer, file.type);

    return NextResponse.json({
      success: true,
      ...extractedData
    });

  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Check for specific Gemini errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key. Please check your configuration.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Gemini API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('safety')) {
      return NextResponse.json(
        { error: 'The bill content was flagged by safety filters. Please ensure the bill is clear and appropriate.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to extract bill data' },
      { status: 500 }
    );
  }
}