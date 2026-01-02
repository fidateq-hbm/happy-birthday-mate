import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint to serve uploaded images from the backend
 * This ensures images are served from the same HTTPS domain as the frontend
 * to avoid mixed content issues
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params (Next.js 15+ requires this)
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const imagePath = pathSegments.join('/');
    
    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    // Get backend API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Warn if using localhost in production (likely misconfiguration)
    if (apiUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.error('⚠️ WARNING: NEXT_PUBLIC_API_URL is set to localhost in production!', {
        apiUrl,
        imagePath,
        hint: 'Set NEXT_PUBLIC_API_URL to your production backend URL in Vercel environment variables'
      });
    }
    
    // Construct backend URL - backend serves static files at /uploads
    const backendUrl = `${apiUrl}/uploads/${imagePath}`;
    
    // Log for debugging (remove in production if needed)
    console.log('Proxying image request:', {
      imagePath,
      backendUrl,
      apiUrl,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Fetch image from backend
    const response = await fetch(backendUrl, {
      headers: {
        // Forward any authorization if needed
        ...(request.headers.get('authorization') && {
          Authorization: request.headers.get('authorization')!,
        }),
      },
    });

    if (!response.ok) {
      console.error('Backend image fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        backendUrl,
        imagePath
      });
      return NextResponse.json(
        { error: 'Image not found', details: `Backend returned ${response.status} for ${backendUrl}` },
        { status: response.status }
      );
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}

