import { Reader } from "@maxmind/geoip2-node";
import path from "path";
import { getDb } from "./mongodb";

export interface GeoLocation {
  lat: number;
  lng: number;
  country: string;
  city: string;
}

const isPrivateIp = (ip: string) => {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127 ||
    parts[0] === 0
  );
};

export async function lookupIp(ip: string): Promise<GeoLocation> {
  if (!ip) return { lat: 0, lng: 0, country: "Unknown Location", city: "Unknown" };
  
  if (isPrivateIp(ip)) {
    return { lat: 0, lng: 0, country: "Internal Network", city: "Internal" };
  }

  try {
    const db = await getDb();
    const cached = await db.collection("geo_cache").findOne({ ip });
    if (cached) {
      return { 
        lat: cached.lat, 
        lng: cached.lng, 
        country: cached.country, 
        city: cached.city 
      };
    }

    const dbPath = path.join(process.cwd(), "public", "GeoLite2-City.mmdb");
    const reader = await Reader.open(dbPath);
    const response = reader.city(ip);
    
    const result = {
      lat: response.location?.latitude || 0,
      lng: response.location?.longitude || 0,
      country: response.country?.names?.en || response.registeredCountry?.names?.en || "Unknown Location",
      city: response.city?.names?.en || "Unknown",
    };

    await db.collection("geo_cache").updateOne(
      { ip },
      { $set: { ...result, ip, createdAt: new Date() } },
      { upsert: true }
    );

    return result;
  } catch (error) {
    return { lat: 0, lng: 0, country: "Unknown Location", city: "Unknown" };
  }
}
