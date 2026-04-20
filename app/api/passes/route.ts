import { NextResponse } from "next/server";

const N2YO_API_KEY = process.env.N2YO_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  
  if (!id || !lat || !lng) {
    return NextResponse.json({ error: "Missing required parameters (id, lat, lng)" }, { status: 400 });
  }

  if (!N2YO_API_KEY) {
    // Return empty mock passes if no API key
    return NextResponse.json({ info: { passescount: 0 }, passes: [] });
  }

  try {
    // We request visual passes for the next 5 days, from the user's location, at 0m altitude, with 300sec minimum visibility
    const url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/${id}/${lat}/${lng}/0/5/300/&apiKey=${N2YO_API_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache per hour to avoid spamming the API limit
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "N2YO API Error" }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Flyby fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
