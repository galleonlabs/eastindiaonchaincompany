import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { format } from "date-fns";

admin.initializeApp();

interface TreasuryAsset {
  href: string;
  imgSrc: string;
  id: string;
  symbol: string;
  quantity: number;
}

interface Harvest {
  assetSymbol: string;
  id: string;
  quantity: number;
  date: admin.firestore.Timestamp;
}

interface YieldData {
  date: string;
  totalUSD: number;
}

interface Prices {
  [key: string]: {
    usd: number;
  };
}

interface PortfolioData {
  treasuryAssets: Omit<TreasuryAsset, "quantity">[];
  rollingAPR: number;
  yieldConsistencyScore: number;
  yieldFrequency: {
    averageDays: number;
    minDays: number;
    maxDays: number;
  };
  latestRelativePerformance: number;
  yieldToTreasuryRatio: number;
  yieldChartData: {
    labels: string[];
    data: number[];
  };
  cumulativeYieldChartData: {
    labels: string[];
    data: number[];
  };
}

export const getPortfolioData = functions.https.onCall(async (data, context): Promise<PortfolioData> => {
  try {
    const treasuryAssetsSnapshot = await admin.firestore().collection("treasuryAssets").get();
    const harvestsSnapshot = await admin.firestore().collection("harvests").get();

    const treasuryAssets = treasuryAssetsSnapshot.docs.map((doc) => doc.data() as TreasuryAsset);
    const harvests = harvestsSnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          date: doc.data().date.toDate(),
        } as Harvest & { date: Date })
    );

    const assetIds = [...new Set([...treasuryAssets.map((asset) => asset.id), ...harvests.map((h) => h.id)])];
    const prices = await fetchPrices(assetIds);

    const totalTreasuryValue = treasuryAssets.reduce((sum, asset) => sum + prices[asset.id].usd * asset.quantity, 0);

    const yieldData = processYieldData(harvests, prices);

     yieldData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const rollingAPR = calculateRollingAPR(yieldData, totalTreasuryValue);
    const yieldConsistencyScore = calculateYieldConsistencyScore(yieldData);
    const yieldFrequency = calculateYieldFrequency(yieldData);
    const latestRelativePerformance = calculateLatestRelativePerformance(yieldData);
    const yieldToTreasuryRatio = calculateYieldToTreasuryRatio(yieldData, totalTreasuryValue);

    const yieldChartData = prepareYieldChartData(yieldData, totalTreasuryValue);
    const cumulativeYieldChartData = prepareCumulativeYieldChartData(yieldData, totalTreasuryValue);

    const processedTreasuryAssets = treasuryAssets.map(({ href, imgSrc, id, symbol }) => ({
      href,
      imgSrc,
      id,
      symbol,
    }));

    return {
      treasuryAssets: processedTreasuryAssets,
      rollingAPR,
      yieldConsistencyScore,
      yieldFrequency,
      latestRelativePerformance,
      yieldToTreasuryRatio,
      yieldChartData,
      cumulativeYieldChartData,
    };
  } catch (error) {
    console.error("Error in getPortfolioData:", error);
    throw new functions.https.HttpsError("internal", "Failed to process portfolio data");
  }
});

async function fetchPrices(assetIds: string[]): Promise<Prices> {
  const response = await axios.get<Prices>(
    `https://api.coingecko.com/api/v3/simple/price?ids=${assetIds.join(",")}&vs_currencies=usd`
  );
  return response.data;
}

function processYieldData(harvests: (Harvest & { date: Date })[], prices: Prices): YieldData[] {
  const groupedHarvests = groupByDate(harvests);
  const yieldData = Object.entries(groupedHarvests).map(([date, harvests]) => ({
    date,
    totalUSD: harvests.reduce((sum, h) => sum + prices[h.id].usd * h.quantity, 0),
  }));

  // Sort yieldData by date
  return yieldData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function groupByDate(harvests: (Harvest & { date: Date })[]): Record<string, (Harvest & { date: Date })[]> {
  return harvests.reduce((acc, harvest) => {
    const date = harvest.date.toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(harvest);
    return acc;
  }, {} as Record<string, (Harvest & { date: Date })[]>);
}

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

function calculateYieldConsistencyScore(yieldData: YieldData[]): number {
  if (yieldData.length < 2) return 100; // Perfect score if not enough data

  const yields = yieldData.map((d) => d.totalUSD);
  const mean = yields.reduce((a, b) => a + b, 0) / yields.length;
  const variance = yields.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0) / yields.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / mean) * 100;

  return Math.max(0, 100 - coefficientOfVariation);
}

function calculateYieldFrequency(yieldData: YieldData[]): { averageDays: number; minDays: number; maxDays: number } {
  if (yieldData.length < 2) return { averageDays: 0, minDays: 0, maxDays: 0 };

  const sortedDates = yieldData.map((d) => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
  const differences = sortedDates
    .slice(1)
    .map((date, i) => (date.getTime() - sortedDates[i].getTime()) / (1000 * 3600 * 24));

  return {
    averageDays: differences.reduce((a, b) => a + b, 0) / differences.length,
    minDays: Math.min(...differences),
    maxDays: Math.max(...differences),
  };
}

function calculateLatestRelativePerformance(yieldData: YieldData[]): number {
  if (yieldData.length < 2) return 0;

  const average = yieldData.reduce((sum, d) => sum + d.totalUSD, 0) / yieldData.length;
  const latest = yieldData[yieldData.length - 1].totalUSD;
  return (latest / average) * 100 - 100;
}

function calculateYieldToTreasuryRatio(yieldData: YieldData[], totalTreasuryValue: number): number {
  if (totalTreasuryValue <= 0) return 0;

  const totalYield = yieldData.reduce((sum, d) => sum + d.totalUSD, 0);
  return (totalYield / totalTreasuryValue) * 100;
}

function prepareYieldChartData(
  yieldData: YieldData[],
  totalTreasuryValue: number
): { labels: string[]; data: number[] } {
  return {
    labels: yieldData.map((d) => format(new Date(d.date), "dd/MM/yyyy")),
    data: yieldData.map((d) => (d.totalUSD / totalTreasuryValue) * 100),
  };
}

function prepareCumulativeYieldChartData(
  yieldData: YieldData[],
  totalTreasuryValue: number
): { labels: string[]; data: number[] } {
  let cumulative = 0;
  return {
    labels: yieldData.map((d) => format(new Date(d.date), "dd/MM/yyyy")),
    data: yieldData.map((d) => {
      cumulative += (d.totalUSD / totalTreasuryValue) * 100;
      return cumulative;
    }),
  };
}
