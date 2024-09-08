import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export interface TreasuryAsset {
  href: string;
  imgSrc: string;
  id: string;
  symbol: string;
}

export interface PortfolioSummary {
  treasuryAssets: Array<TreasuryAsset>;
  // totalTreasuryValue: number;
  // latestYield: number;
  rollingAPR: number;
}

export interface DetailedPortfolioData {
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

export const usePortfolioData = () => {
  const [summaryData, setSummaryData] = useState<PortfolioSummary | null>(null);
  const [detailedData, setDetailedData] = useState<DetailedPortfolioData | null>(null);
  const [loading, setLoading] = useState({ summary: true, detailed: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const functions = getFunctions();
        const getPortfolioSummary = httpsCallable<any, PortfolioSummary>(functions, "getPortfolioSummary");
        const result = await getPortfolioSummary();
        setSummaryData(result.data);
      } catch (err) {
        setError("Failed to fetch summary data");
      } finally {
        setLoading((prev) => ({ ...prev, summary: false }));
      }
    };

    fetchSummaryData();
  }, []);

  const fetchDetailedData = async () => {
    if (detailedData) return; // Avoid fetching if we already have the data

    setLoading((prev) => ({ ...prev, detailed: true }));
    try {
      const functions = getFunctions();
      const getDetailedPortfolioData = httpsCallable<any, DetailedPortfolioData>(functions, "getDetailedPortfolioData");
      const result = await getDetailedPortfolioData();
      setDetailedData(result.data);
    } catch (err) {
      setError("Failed to fetch detailed data");
    } finally {
      setLoading((prev) => ({ ...prev, detailed: false }));
    }
  };

  return { summaryData, detailedData, loading, error, fetchDetailedData };
};
