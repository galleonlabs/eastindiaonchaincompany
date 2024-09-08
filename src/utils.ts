import { TreasuryAsset } from "./hooks/usePortfolioData";

export interface Harvest {
  assetSymbol: string;
  id: string;
  quantity: number;
  date: { seconds: number; nanoseconds: number };
}

export interface PortfolioData {
  treasuryAssets: TreasuryAsset[];
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

export interface YieldData {
  date: string;
  totalUSD: number;
}