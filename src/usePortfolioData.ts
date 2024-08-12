import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { PortfolioData } from "./utils";

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const usePortfolioData = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);

        const cachedData = sessionStorage.getItem("portfolioData");
        const cachedTimestamp = sessionStorage.getItem("portfolioDataTimestamp");

        if (cachedData && cachedTimestamp) {
          const parsedData = JSON.parse(cachedData);
          const timestamp = parseInt(cachedTimestamp, 10);

          if (Date.now() - timestamp < CACHE_DURATION) {
            setPortfolioData(parsedData);
            setLoading(false);
            return;
          }
        }

        const functions = getFunctions();
        const getPortfolioData = httpsCallable<any, PortfolioData>(functions, "getPortfolioData");
        const result = await getPortfolioData();

        sessionStorage.setItem("portfolioData", JSON.stringify(result.data));
        sessionStorage.setItem("portfolioDataTimestamp", Date.now().toString());

        setPortfolioData(result.data);
      } catch (err) {
        setError("Failed to fetch portfolio data");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  return { portfolioData, loading, error };
};
