
## 🚀 Deployment & Configuration

### 1. GitHub Integration
The project is set up to automatically deploy from GitHub to Vercel.

### 2. Environment Variables
To fix build errors and run the application, you **must** add the following environment variables in the [Vercel Project Dashboard](https://vercel.com/dashboard):

- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `MONGODB_DB`: The name of your database (default: `ids_db`).

### 3. Local Development
1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Fill in your `MONGODB_URI`.
4. Run `npm install && npm run dev`.

### 4. GeoIP Database
The application expects a `GeoLite2-City.mmdb` file in the `public/` directory for IP geolocation. If missing, the app will fall back to "Unknown Location".


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
