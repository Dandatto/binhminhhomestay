/**
 * GET /api/v1/weather
 * Fetches real-time weather and wave data for Minh Chau Island
 * from Open-Meteo (free, no API key required).
 * Data is cached for 30 minutes via Next.js `revalidate`.
 *
 * Coords: Lat 21.0153, Lon 107.4813 (Minh Chau, Van Don, Quang Ninh)
 */

import { NextResponse } from "next/server";

export const revalidate = 1800; // Cache 30 minutes

const LAT = 21.0153;
const LON = 107.4813;

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,weather_code,wind_speed_10m,uv_index,relative_humidity_2m` +
  `&hourly=wave_height` +
  `&wind_speed_unit=kmh&timezone=Asia%2FBangkok&forecast_days=1`;

// Map WMO weather codes to Vietnamese descriptions
function describeWeather(code: number): string {
  if (code === 0) return "Trời quang, biển êm";
  if (code <= 3) return "Mây rải rác, dễ chịu";
  if (code <= 48) return "Sương mù nhẹ";
  if (code <= 67) return "Có mưa nhỏ";
  if (code <= 77) return "Tuyết / hạt băng (hiếm)";
  if (code <= 82) return "Mưa rào";
  if (code <= 99) return "Giông bão, chú ý an toàn";
  return "Không xác định";
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Thấp";
  if (uv <= 5) return "Trung bình";
  if (uv <= 7) return "Cao";
  if (uv <= 10) return "Rất cao";
  return "Cực cao";
}

export async function GET() {
  try {
    const res = await fetch(WEATHER_URL, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo responded ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    // Get current hour's wave height
    const now = new Date();
    const hourIndex = now.getHours();
    const waveHeight: number = data.hourly?.wave_height?.[hourIndex] ?? 0.0;

    const payload = {
      temp: Math.round(current.temperature_2m),
      condition: describeWeather(current.weather_code),
      windSpeed: `${Math.round(current.wind_speed_10m)} km/h`,
      uvIndex: Math.round(current.uv_index ?? 0),
      uvLabel: uvLabel(current.uv_index ?? 0),
      humidity: `${current.relative_humidity_2m}%`,
      waveHeight: `${waveHeight.toFixed(1)}m`,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[weather API]", err);
    // Graceful fallback so UI never crashes
    return NextResponse.json(
      {
        temp: null,
        condition: "Không lấy được dữ liệu",
        windSpeed: "—",
        uvIndex: null,
        uvLabel: "—",
        humidity: "—",
        waveHeight: "—",
        lastUpdated: new Date().toISOString(),
        error: true,
      },
      { status: 200 }
    );
  }
}
