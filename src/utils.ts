// utils.ts
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";
import { db } from "./main";

export interface Harvest {
  assetSymbol: string;
  id: string;
  quantity: number;
  date: { seconds: number; nanoseconds: number };
}

export const fetchData = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => doc.data());
};

export const fetchPrices = async (assetIds: string[]) => {
  const cachedPrices = JSON.parse(sessionStorage.getItem("assetPrices") || "{}");
  const uncachedIds = assetIds.filter((id) => !cachedPrices[id]);

  if (uncachedIds.length > 0) {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${uncachedIds.join(",")}&vs_currencies=usd`
    );
    const prices = response.data;

    uncachedIds.forEach((id) => {
      cachedPrices[id] = prices[id]?.usd;
    });

    sessionStorage.setItem("assetPrices", JSON.stringify(cachedPrices));
  }

  return cachedPrices;
};

export const groupByDate = (harvests: Harvest[]) => {
  const grouped = harvests.reduce((acc: Record<string, Harvest[]>, harvest: Harvest) => {
    const date = new Date(harvest.date.seconds * 1000).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(harvest);
    return acc;
  }, {});
  return grouped;
};

export const calculateRollingAPR = (yieldData: { date: string; totalUSD: number }[], totalTreasuryValue: number) => {
  if (yieldData.length < 4 || totalTreasuryValue <= 0) {
    return 0; // Return 0 if there's not enough data or invalid treasury value
  }

  // Get the last 4 data points
  const lastFourDataPoints = yieldData.slice(-4);

  // Calculate total yield for the last 4 data points
  const totalYield = lastFourDataPoints.reduce((sum, entry) => sum + entry.totalUSD, 0);

  // Calculate the time span in days
  const startDate = new Date(lastFourDataPoints[0].date);
  const endDate = new Date(lastFourDataPoints[3].date);
  const daysDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

  // Calculate daily yield
  const averageDailyYield = totalYield / daysDifference;

  // Annualize the yield
  const annualizedYield = averageDailyYield * 365;

  // Calculate APR as a percentage
  const APR = (annualizedYield / totalTreasuryValue) * 100;

  return APR;
};
export interface TreasuryAsset {
  href: string;
  imgSrc: string;
  id: string;
  symbol: string;
  quantity: number;
  usdValue?: number;
}
export interface YieldData {
  date: string;
  totalUSD: number;
}
