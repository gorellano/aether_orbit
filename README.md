# AETHER ORBIT

AETHER ORBIT is a minimalist, premium WebApp designed for real-time tracking of orbital bodies including the International Space Station (ISS), the Tiangong Space Station (CSS), and Starlink satellites.

Combining a "Deep Space" visual aesthetic with aggressive glassmorphism, Framer Motion animations, and a decoupled frontend-backend proxy layer, AETHER ORBIT provides secure, seamless telemetry streaming directly to the browser.

## Features

- **Real-Time Telemetry:** Tracks Altitude, Velocity, Coordinates, and Orbital path using the N2YO Tracker API.
- **Proximity Calculation:** Automatically computes the closest distance between your current device location and the satellite using Euclidean/Haversine math.
- **Glassmorphism UI:** Built completely with pure Tailwind CSS and Framer Motion for deep blur and sleek, dark-mode elements.
- **Map Focus:** Utilizes Leaflet with the CartoDB Dark Matter tileset to hide city labels and distractions.
- **Secure Architecture:** API keys are protected behind a Next.js Edge proxy to prevent credential leakage and support basic rate limiting.

## Prerequisites

- Node.js 20+
- Docker (optional, but recommended for production deployment)
- An active `N2YO_API_KEY` obtained from [n2yo.com/api](https://n2yo.com/api/) (If not provided, the local server will use mock telemetry).

## Project Structure

```
├── app/
│   ├── api/tracker/route.ts   # Secure API Proxy & Rate Limiting
│   ├── globals.css            # Deep Space Colors & Tailwind Classes
│   ├── layout.tsx             # Root layout wrapping
│   └── page.tsx               # Main Dashboard App Component
├── components/
│   ├── ProximityIndicator.tsx # Bottom progress indicator
│   ├── SpaceMap.tsx           # Leaflet wrapper with custom markers
│   └── TelemetryPanel.tsx     # Glassmorphism telemetry overlay
├── hooks/
│   ├── useGeolocation.ts      # HTML5 browser geo-coordinates tracking
│   └── useSpaceTracker.ts     # Polling interval system for API
├── lib/
│   └── utils.ts               # Math (Haversine) and helper functions
├── Dockerfile
├── docker-compose.yml
```

## Running Locally

1. Install all dependencies:
```bash
npm install
```

2. Create a `.env` file at the root:
```env
N2YO_API_KEY=your_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Running with Docker

A multi-stage `Dockerfile` has been included to create a highly optimized production image.

```bash
# Build the image and start the container in detached mode
docker-compose up --build -d
```
The application will be exposed on port `3000` with an automatic healthcheck.

## Deployment (Vercel)

AETHER ORBIT is optimized for deployment on Vercel. 
1. Import the project into Vercel.
2. In the Environment Variables, add `N2YO_API_KEY`.
3. Deploy. The Edge Network will automatically securely proxy the N2YO requests.
