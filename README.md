# SOC Security Intelligence Dashboard

A MongoDB-powered visualization platform that transforms raw security data into actionable intelligence for SOC analysts, cybersecurity engineers, and network administrators.

## Features
- **Dark Intelligence Design System**: Minimal Scandinavian UI mixed with Enterprise SaaS Polish.
- **Real-Time Next.js Architecture**: Built on Next.js 15 App router.
- **Geospatial Threat Map**: HTML5 Canvas Leaflet.js engine rendering bezier attack arcs globally.
- **Deep Log Inspection**: Inspect decoded JSON payloads of HTTP threats.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   Copy `.env.local.example` to `.env.local` and update your MongoDB credentials.

3. GeoIP Database:
   Download the `GeoLite2-City.mmdb` database from [MaxMind](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) and place it inside the `public` directory.

4. Run development server:
   ```bash
   npm run dev
   ```

## Production Architecture
This application utilizes server-side API endpoints directly interfacing with MongoDB Node.js driver (aggregations). All table filtering uses URL state parameters (`nuqs`) enabling deeply shareable links for SOC contexts without client-side hydration issues. 
