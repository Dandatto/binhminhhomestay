/**
 * GET /api/v1/weather
 * Fetches real-time weather + marine wave data for Minh Chau Island, Van Don.
 *
 * Coords: Lat 21.0153, Lon 107.4813 (Đảo Minh Châu, Vân Đồn, Quảng Ninh)
 * - Main weather: Open-Meteo Forecast API (free, no key)
 * - Wave height: Open-Meteo Marine API (separate endpoint, free)
 * - Cache: ISR revalidate 60 min (island weather changes slowly)
 */

import { NextResponse } from "next/server";

export const revalidate = 3600; // 1 hour — sufficient for island weather

const LAT = 21.0153;
const LON = 107.4813;

// Main forecast API — add wind gust for rough sea warning
const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,uv_index,relative_humidity_2m` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max` +
  `&wind_speed_unit=kmh&timezone=Asia%2FBangkok&forecast_days=7`;

// Marine API — separate endpoint specifically for wave data
const MARINE_URL =
  `https://marine-api.open-meteo.com/v1/marine?` +
  `latitude=${LAT}&longitude=${LON}` +
  `&current=wave_height,wave_direction,swell_wave_height` +
  `&timezone=Asia%2FBangkok`;

/** Map WMO weather code → Vietnamese short label */
function describeWeather(code: number): string {
  if (code === 0) return "Trời quang";
  if (code <= 1) return "Ít mây";
  if (code <= 3) return "Mây rải rác";
  if (code <= 48) return "Sương mù nhẹ";
  if (code <= 55) return "Mưa phùn";
  if (code <= 67) return "Có mưa";
  if (code <= 77) return "Mưa đá / tuyết";
  if (code <= 82) return "Mưa rào";
  if (code <= 99) return "Giông bão";
  return "Không xác định";
}

/** Map wave height to sea state label for island guests */
function waveLabel(h: number): string {
  if (h < 0.3) return "Biển êm";
  if (h < 0.8) return "Sóng nhẹ";
  if (h < 1.5) return "Sóng vừa";
  if (h < 2.5) return "Sóng mạnh";
  return "Biển động";
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
    // Fetch weather and marine data in parallel
    const [weatherRes, marineRes] = await Promise.allSettled([
      fetch(WEATHER_URL, { next: { revalidate: 3600 } }),
      fetch(MARINE_URL, { next: { revalidate: 3600 } }),
    ]);

    if (weatherRes.status === "rejected" || !weatherRes.value.ok) {
      throw new Error("Open-Meteo weather API failed");
    }

    const weatherData = await weatherRes.value.json();
    const current = weatherData.current;
    const daily = weatherData.daily;

    // Wave data from Marine API (may fail gracefully)
    let waveHeight = 0.0;
    let swellHeight = 0.0;
    let waveDirection = null;

    if (marineRes.status === "fulfilled" && marineRes.value.ok) {
      const marineData = await marineRes.value.json();
      waveHeight = marineData.current?.wave_height ?? 0.0;
      swellHeight = marineData.current?.swell_wave_height ?? 0.0;
      waveDirection = marineData.current?.wave_direction ?? null;
    }

    // Use wind speed as a secondary wave indicator if marine API unavailable
    const windSpeedKmh = Math.round(current.wind_speed_10m);
    const waveHeightDisplay = waveHeight > 0
      ? `${waveHeight.toFixed(1)}m`
      : windSpeedKmh > 30
        ? "Sóng cao (ước tính)"
        : "Biển êm";

    // 7-day forecast
    const forecast = daily.time.map((time: string, i: number) => ({
      date: time,
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      minTemp: Math.round(daily.temperature_2m_min[i]),
      condition: describeWeather(daily.weather_code[i]),
      code: daily.weather_code[i],
      uvMax: Math.round(daily.uv_index_max?.[i] ?? 0),
    }));

    const payload = {
      temp: Math.round(current.temperature_2m),
      condition: describeWeather(current.weather_code),
      weatherCode: current.weather_code,
      windSpeed: `${windSpeedKmh} km/h`,
      windGusts: current.wind_gusts_10m ? `${Math.round(current.wind_gusts_10m)} km/h` : null,
      uvIndex: Math.round(current.uv_index ?? 0),
      uvLabel: uvLabel(current.uv_index ?? 0),
      humidity: `${current.relative_humidity_2m}%`,
      // Marine data
      waveHeight: waveHeightDisplay,
      waveHeightRaw: waveHeight,
      swellHeight: swellHeight > 0 ? `${swellHeight.toFixed(1)}m` : null,
      waveLabel: waveLabel(waveHeight),
      waveDirection,
      // Forecast
      forecast,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[weather API]", err);
    return NextResponse.json(
      {
        temp: null,
        condition: "Chưa có dữ liệu",
        weatherCode: null,
        windSpeed: "—",
        windGusts: null,
        uvIndex: null,
        uvLabel: "—",
        humidity: "—",
        waveHeight: "—",
        waveHeightRaw: null,
        swellHeight: null,
        waveLabel: "—",
        waveDirection: null,
        lastUpdated: new Date().toISOString(),
        error: true,
      },
      { status: 200 }
    );
  }
}
