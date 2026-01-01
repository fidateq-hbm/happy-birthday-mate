import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side handler for Firebase password reset redirects
 * 
 * Firebase redirects to this endpoint with the code, and we then redirect
 * to the reset-password page with the code preserved.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Log ALL parameters to see what Firebase is actually sending
  const allParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    allParams[key] = value;
  });
  
  console.log('=== API RESET HANDLER DEBUG ===');
  console.log('Full request URL:', request.nextUrl.toString());
  console.log('All query parameters:', allParams);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  const oobCode = searchParams.get('oobCode') || searchParams.get('oobcode') || searchParams.get('code');
  const mode = searchParams.get('mode');
  const continueUrl = searchParams.get('continueUrl');
  const apiKey = searchParams.get('apiKey');

  console.log('Extracted oobCode:', oobCode ? oobCode.substring(0, 20) + '...' : 'none');
  console.log('Extracted mode:', mode);
  console.log('Extracted continueUrl:', continueUrl);
  console.log('Extracted apiKey:', apiKey ? 'present' : 'none');

  // Check if code is in referrer (Firebase might send it there)
  const referer = request.headers.get('referer') || request.headers.get('referrer');
  console.log('Referer header:', referer);
  
  if (referer) {
    const refererUrl = new URL(referer);
    const refererCode = refererUrl.searchParams.get('oobCode') || refererUrl.searchParams.get('oobcode');
    if (refererCode && !oobCode) {
      console.log('Found code in referer!');
      // Use code from referer
      const resetUrl = new URL('/reset-password', request.nextUrl.origin);
      resetUrl.searchParams.set('oobCode', refererCode);
      resetUrl.searchParams.set('mode', mode || 'resetPassword');
      console.log('Redirecting with code from referer:', resetUrl.toString());
      return NextResponse.redirect(resetUrl);
    }
  }

  if (!oobCode || mode !== 'resetPassword') {
    console.error('Missing code or invalid mode - redirecting with error');
    // Redirect to reset-password page with error
    const resetUrl = new URL('/reset-password', request.nextUrl.origin);
    resetUrl.searchParams.set('error', 'missing_code');
    resetUrl.searchParams.set('debug', 'api_handler_called');
    return NextResponse.redirect(resetUrl);
  }

  // Redirect to reset-password page with the code preserved
  const resetUrl = new URL('/reset-password', request.nextUrl.origin);
  resetUrl.searchParams.set('oobCode', oobCode);
  resetUrl.searchParams.set('mode', mode);

  console.log('✅ Successfully redirecting with code:', resetUrl.toString());
  return NextResponse.redirect(resetUrl);
}

