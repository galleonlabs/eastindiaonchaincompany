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

export const calculateRollingAPR = (
  yieldData: { date: string; totalUSD: number }[],
  totalTreasuryValue: number,
  rollingPeriodDays: number = 30
) => {
  const rollingAPR = yieldData.map((entry, index) => {
    const availableDays = Math.min(index + 1, rollingPeriodDays);
    const rollingPeriodData = yieldData.slice(Math.max(index + 1 - rollingPeriodDays, 0), index + 1);
    const rollingTotalUSD = rollingPeriodData.reduce((sum, e) => sum + e.totalUSD, 0);
    const averageDailyYield = rollingTotalUSD / availableDays;
    const annualizedYield = averageDailyYield * 365;
    return (annualizedYield / totalTreasuryValue) * 100; // Annualized yield as a percentage
  });
  return rollingAPR;
};