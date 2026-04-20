import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Optional: Use edge runtime for speed
export const revalidate = 0;   // disable cache for real-time data

// Basic in-memory rate limiting map (for Demo/Edge purposes, ideally use Vercel KV)
const rateLimit = new Map<string, { count: number, resetAt: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '25544'; // Default to ISS

  // 1. Basic Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const limitWindow = 60000; // 1 minute
  const maxRequests = 30; // 30 requests per minute per IP

  let userLimit = rateLimit.get(ip);
  if (!userLimit || userLimit.resetAt < now) {
    userLimit = { count: 1, resetAt: now + limitWindow };
  } else {
    userLimit.count += 1;
  }
  rateLimit.set(ip, userLimit);

  if (userLimit.count > maxRequests) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 2. Fetch N2YO Data
  const apiKey = process.env.N2YO_API_KEY;

  if (!apiKey) {
    // If no API key, return MOCK data to allow UI development and testing
    console.warn("No N2YO_API_KEY found, returning MOCK data");
    
    // Create a mock orbit drifting slightly based on time
    const drift = (Date.now() % 100000) / 10000;
    return NextResponse.json({
      info: { satname: "MOCK SATELLITE", satid: Number(id) },
      positions: [{
        satlatitude: 51.64 + drift,
        satlongitude: -112.84 + drift * 2,
        sataltitude: 417.85 + Math.sin(drift) * 10,
        timestamp: Math.floor(Date.now() / 1000)
      }]
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff' // Basic security header
      }
    });
  }

  try {
    // N2YO endpoint: /positions/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{seconds}
    // We use observer at 0,0,0 and 1 seconds just to get the current position.
    const url = `https://api.n2yo.com/rest/v1/satellite/positions/${id}/0/0/0/1/&apiKey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`N2YO API responded with status: ${response.status}`);
    }
    let data;
    try {
      data = await response.json();
    } catch(e) {
      const text = await response.text();
      throw new Error(`Invalid JSON from N2YO (Status ${response.status}): ${text.substring(0, 100)}`);
    }
    
    // Forward the JSON, append security headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
      }
    });

  } catch (error: unknown) {
    console.error("Tracker API Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
