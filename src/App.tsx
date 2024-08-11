import { useEffect, useState } from "react";
import logo from "./assets/logo.png";
import "./App.css";
import TreasuryAssets from "./TreasuryAssets";
import { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import HoverTooltip from "./Tooltip";
import { getFunctions, httpsCallable } from "firebase/functions";
import { TreasuryAsset } from "./utils";
import Loading from "./Loading";

interface PortfolioData {
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

function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);

        // Check if we have cached data
        const cachedData = sessionStorage.getItem("portfolioData");
        const cachedTimestamp = sessionStorage.getItem("portfolioDataTimestamp");

        if (cachedData && cachedTimestamp) {
          const parsedData = JSON.parse(cachedData);
          const timestamp = parseInt(cachedTimestamp, 10);

          // Check if the cached data is less than 5 minutes old
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            setPortfolioData(parsedData);
            setLoading(false);
            return;
          }
        }

        // If no valid cached data, fetch from the Cloud Function
        const functions = getFunctions();
        const getPortfolioData = httpsCallable<any, PortfolioData>(functions, "getPortfolioData");
        const result = await getPortfolioData();

        // Cache the new data
        sessionStorage.setItem("portfolioData", JSON.stringify(result.data));
        sessionStorage.setItem("portfolioDataTimestamp", Date.now().toString());

        setPortfolioData(result.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch portfolio data");
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);


  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `${Number(value).toFixed(2)}%`;
          },
        },
      },
    },
  };

  if (loading)
    return (
      <Loading/>
    );
  if (error)
    return (
      <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-16 justify-center mb-32 text-center">
        Error: {error}
      </div>
    );

  if (!portfolioData) return null;

  return (
    <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy  rounded-sm mt-16 justify-center mb-32 px-4 sm:px-6 lg:px-8">
      <div className="justify-center flex">
        <img src={logo} className="h-32 w-32" alt="logo" />
      </div>
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold">East India Onchain Company</h1>
        <p className="text-lg">Yield merchants and traders of natural crypto resources</p>
      </div>

      <TreasuryAssets assets={portfolioData.treasuryAssets} />

      <div className="">
        <div className="mx-auto  border-l border-r border-theme-pan-navy bg-theme-pan-champagne  pb-4">
          <h1 className="text-xl pl-6 font-bold text-left">Yield Performance</h1>
          <HoverTooltip text="Based on the last 4 harvests">
            <p className="text-md pl-6 text-left">Rolling APR: {portfolioData.rollingAPR.toFixed(2)}%</p>
          </HoverTooltip>
          <div className="mx-8 rounded-sm pb-3 pt-2">
            <Line
              data={{
                labels: portfolioData.yieldChartData.labels,
                datasets: [
                  {
                    label: "Harvest Yield as % of Treasury",
                    data: portfolioData.yieldChartData.data,
                    borderColor: "#0072B5",
                    backgroundColor: "rgb(0, 114, 181, 0.2)",
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <div className="mx-8 rounded-sm pb-3 pt-2">
            <Line
              data={{
                labels: portfolioData.cumulativeYieldChartData.labels,
                datasets: [
                  {
                    label: "Cumulative Yield as % of Treasury",
                    data: portfolioData.cumulativeYieldChartData.data,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto border-b border-l border-r border-theme-pan-navy bg-theme-pan-champagne rounded-bl rounded-br pb-6">
        <h1 className="text-xl pl-6 font-bold text-left">Portfolio Insights</h1>
        <div className="grid grid-cols-2 gap-4 mx-8 mt-4">
          <div>
            <p className="font-semibold">Average Harvest Frequency:</p>
            <p>{portfolioData.yieldFrequency.averageDays.toFixed(1)} Days</p>
          </div>
          <div>
            <HoverTooltip text="Measures yield consistency. Higher score indicates more consistent yields.">
              <div>
                <p className="font-semibold">Yield Consistency Score:</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-theme-pan-sky h-2.5 rounded-full"
                      style={{ width: `${portfolioData.yieldConsistencyScore}%` }}
                    ></div>
                  </div>
                  <p>{portfolioData.yieldConsistencyScore.toFixed(0)}/100</p>
                </div>
              </div>
            </HoverTooltip>
          </div>
          <div>
            <p className="font-semibold">Latest Yield Performance:</p>
            <p className={portfolioData.latestRelativePerformance >= 0 ? "text-theme-pan-sky" : ""}>
              {portfolioData.latestRelativePerformance >= 0 ? "+" : ""}
              {portfolioData.latestRelativePerformance.toFixed(2)}% vs average
            </p>
          </div>
          <div>
            <p className="font-semibold">Yield to Treasury Ratio:</p>
            <p>{portfolioData.yieldToTreasuryRatio.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className=" mx-auto flex justify-evenly max-w-4xl py-3 pb-1">
        <a
          target="_blank"
          href="https://twitter.com/galleonlabs"
          className="text-md text-center inline-flex border-b hover:border-b-theme-pan-navy border-transparent"
        >
          Twitter
        </a>
        <a
          target="_blank"
          href="https://twitter.com/davyjones0x"
          className="text-md text-center inline-flex border-b hover:border-b-theme-pan-navy border-transparent"
        >
          Davy Jones
        </a>
        <a
          target="_blank"
          href="https://galleonlabs.io"
          className="text-md text-center inline-flex border-b hover:border-b-theme-pan-navy border-transparent"
        >
          Galleon Labs
        </a>
        <a
          target="_blank"
          href="https://github.com/galleonlabs"
          className="text-md text-center inline-flex border-b hover:border-b-theme-pan-navy border-transparent"
        >
          Github
        </a>
      </div>
    </div>
  );
}

export default App;