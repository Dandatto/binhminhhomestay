/**
 * Binh Minh Real-time Hub Data Provider (Mock)
 * In production, these fetch from Windy, Google Weather, and Ao Tien Port APIs.
 */

export const getWeather = async () => {
  // Simulating API latency
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    temp: 28,
    condition: "Sunny",
    windSpeed: "12 km/h",
    uvIndex: 6,
    humidity: "65%",
    lastUpdated: new Date().toISOString()
  };
};

export const getTide = async () => {
  return {
    currentHeight: "0.5m",
    trend: "rising",
    nextHighTide: "14:30"
  };
};

export const getVessels = async () => {
  return [
    { id: 1, route: "Ao Tiên - Minh Châu", time: "07:30", status: "Arrived", operator: "Havaco" },
    { id: 2, route: "Ao Tiên - Minh Châu", time: "10:30", status: "Departed", operator: "Quang Minh" },
    { id: 3, route: "Ao Tiên - Minh Châu", time: "13:30", status: "Scheduled", operator: "Havaco" },
    { id: 4, route: "Ao Tiên - Minh Châu", time: "15:30", status: "Scheduled", operator: "Kalong" },
  ];
};
