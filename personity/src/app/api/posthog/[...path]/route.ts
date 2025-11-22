import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const pathString = path.join('/');
  
  try {
    const body = await request.text();
    
    const response = await fetch(
      `https://us.i.posthog.com/${pathString}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }
    );
    
    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('PostHog proxy error:', error);
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
    const response = await fetch(
      `https://us.i.posthog.com/${pathString}${searchParams ? `?${searchParams}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('PostHog proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}
