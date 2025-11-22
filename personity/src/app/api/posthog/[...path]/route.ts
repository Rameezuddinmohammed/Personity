import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  
  try {
    const body = await request.text();
    const url = `https://us.i.posthog.com/${pathString}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'PostHog-Proxy',
      },
      body,
    });
    
    const contentType = response.headers.get('content-type');
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('PostHog proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  
  try {
    const url = `https://us.i.posthog.com/${pathString}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'PostHog-Proxy',
      },
    });
    
    const contentType = response.headers.get('content-type');
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('PostHog proxy GET error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}
