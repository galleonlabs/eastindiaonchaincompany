import { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.png";
import "./App.css";
import { format } from "date-fns";
import TreasuryAssets from "./TreasuryAssets";
import { calculateRollingAPR, fetchData, fetchPrices, groupByDate, Harvest, TreasuryAsset, YieldData } from "./utils";
import {
  ChartOptions,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import HoverTooltip from "./Tooltip";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [treasuryAssets, setTreasuryAssets] = useState<TreasuryAsset[]>([]);
  const [yieldData, setYieldData] = useState<YieldData[]>([]);
  const [totalTreasuryValue, setTotalTreasuryValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreasuryAssets = async () => {
      try {
        setLoading(true);
        const assets = (await fetchData("treasuryAssets")) as TreasuryAsset[];
        const assetIds = assets.map((asset) => asset.id);
        const prices = await fetchPrices(assetIds);
        const updatedAssets = assets.map((asset) => ({
          ...asset,
          usdValue: prices[asset.id] * asset.quantity,
        }));
        setTreasuryAssets(updatedAssets);
        const totalValue = updatedAssets.reduce((acc, asset) => acc + (asset.usdValue || 0), 0);
        setTotalTreasuryValue(totalValue);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch treasury assets");
        setLoading(false);
      }
    };

    fetchTreasuryAssets();
  }, []);

  useEffect(() => {
    const fetchHarvestAssets = async () => {
      try {
        setLoading(true);

        const harvests = (await fetchData("harvests")) as Harvest[];

        const groupedHarvests = groupByDate(harvests.sort((a: Harvest, b: Harvest) => a.date.seconds - b.date.seconds));
        const dates = Object.keys(groupedHarvests);

        const allIds = [...new Set(harvests.map((h) => h.id))];
        const prices = await fetchPrices(allIds);

        const yieldData = dates.map((date) => {
          const totalUSD = groupedHarvests[date].reduce((sum, h) => {
            const price = prices[h.id];
            return sum + price * h.quantity;
          }, 0);
          return { date, totalUSD };
        });

        setYieldData(yieldData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch treasury assets");
        setLoading(false);
      }
    };

    fetchHarvestAssets();
  }, []);

  const rollingAPR = useMemo(() => calculateRollingAPR(yieldData, totalTreasuryValue), [yieldData, totalTreasuryValue]);

  const yieldFrequency = useMemo(() => {
    const sortedDates = yieldData.map((d) => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
    const differences = sortedDates
      .slice(1)
      .map((date, i) => (date.getTime() - sortedDates[i].getTime()) / (1000 * 3600 * 24));
    return {
      averageDays: differences.reduce((a, b) => a + b, 0) / differences.length,
      minDays: Math.min(...differences),
      maxDays: Math.max(...differences),
    };
  }, [yieldData]);

  const yieldConsistencyScore = useMemo(() => {
    const yields = yieldData.map((d) => d.totalUSD);
    const mean = yields.reduce((a, b) => a + b, 0) / yields.length;
    const variance = yields.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0) / yields.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;

    // Transform coefficient of variation to a 0-100 score
    // where 100 is perfectly consistent (0% CV) and 0 is highly inconsistent (100% CV or more)
    const score = Math.max(0, 100 - coefficientOfVariation);
    return score;
  }, [yieldData]);

  const relativePerformance = useMemo(() => {
    const average = yieldData.reduce((sum, d) => sum + d.totalUSD, 0) / yieldData.length;
    return yieldData.map((d) => ({
      date: d.date,
      relativePerformance: (d.totalUSD / average) * 100,
    }));
  }, [yieldData]);

  const latestRelativePerformance = useMemo(() => {
    if (relativePerformance.length === 0) return 100; // Default to 100 if no data
    const latest = relativePerformance[relativePerformance.length - 1].relativePerformance;
    return latest - 100; // Difference from 100%
  }, [relativePerformance]);

  const yieldToTreasuryRatio = useMemo(() => {
    const totalYield = yieldData.reduce((sum, d) => sum + d.totalUSD, 0);
    const treasuryValue = treasuryAssets.reduce((sum, a) => sum + (a.usdValue || 0), 0);
    return (totalYield / treasuryValue) * 100;
  }, [yieldData, treasuryAssets]);

  const yieldChartData = useMemo(
    () => ({
      labels: yieldData.map((yieldEntry) => format(new Date(yieldEntry.date), "dd/MM/yyyy")),
      datasets: [
        {
          label: "Harvest Yield as % of Treasury",
          data: yieldData.map((yieldEntry) => (yieldEntry.totalUSD / totalTreasuryValue) * 100),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    }),
    [yieldData, totalTreasuryValue]
  );

  const cumulativeYieldChartData = useMemo(
    () => ({
      labels: yieldData.map((yieldEntry) => format(new Date(yieldEntry.date), "dd/MM/yyyy")),
      datasets: [
        {
          label: "Cumulative Yield as % of Treasury",
          data: yieldData.reduce((acc, yieldEntry) => {
            const currentValue = (yieldEntry.totalUSD / totalTreasuryValue) * 100;
            const previousValue = acc.length > 0 ? acc[acc.length - 1] : 0;
            acc.push(previousValue + currentValue);
            return acc;
          }, [] as number[]),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
      ],
    }),
    [yieldData, totalTreasuryValue]
  );

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
      <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-16 justify-center mb-32 text-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-16 justify-center mb-32 text-center">
        Error: {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-16 justify-center mb-32 px-4 sm:px-6 lg:px-8">
      <div className="justify-center flex">
        <img src={logo} className="h-32 w-32" alt="logo" />
      </div>
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold">East India Onchain Company</h1>
        <p className="text-lg">Yield merchants and traders of natural crypto resources</p>
      </div>

      <TreasuryAssets assets={treasuryAssets} />

      <div className="">
        <div className="mx-auto  border-l border-r border-theme-pan-navy bg-theme-pan-champagne  pb-4">
          <h1 className="text-xl pl-6 font-bold text-left">Yield Performance</h1>
          <HoverTooltip text="Based on the last 4 harvests">
            <p className="text-md pl-6 text-left">Rolling APR: {Number(rollingAPR).toFixed(2)}%</p>
          </HoverTooltip>
          <div className="mx-8 rounded-sm pb-3 pt-2">
            <Line data={yieldChartData} options={chartOptions} />
          </div>
          <div className="mx-8 rounded-sm pb-3 pt-2">
            <Line data={cumulativeYieldChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mx-auto border-b border-l border-r border-theme-pan-navy bg-theme-pan-champagne rounded-bl rounded-br pb-6">
        <h1 className="text-xl pl-6 font-bold text-left">Portfolio Insights</h1>
        <div className="grid grid-cols-2 gap-4 mx-8 mt-4">
          <div>
            <p className="font-semibold">Average Harvest Frequency:</p>
            <p>{yieldFrequency.averageDays} Days</p>
          </div>
          <div>
            <HoverTooltip text="Measures yield consistency. Higher score indicates more consistent yields.">
              <div>
                <p className="font-semibold">Yield Consistency Score:</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-theme-pan-sky h-2.5 rounded-full"
                      style={{ width: `${yieldConsistencyScore}%` }}
                    ></div>
                  </div>
                  <p>{yieldConsistencyScore.toFixed(0)}/100</p>
                </div>
              </div>
            </HoverTooltip>
          </div>
          <div>
            <p className="font-semibold">Latest Yield Performance:</p>
            <p className={latestRelativePerformance >= 0 ? "text-theme-pan-sky" : "text-red-600"}>
              {latestRelativePerformance >= 0 ? "+" : ""}
              {latestRelativePerformance.toFixed(2)}% vs average
            </p>
          </div>
          <div>
            <p className="font-semibold">Yield to Treasury Ratio:</p>
            <p>{yieldToTreasuryRatio.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className=" mx-auto flex justify-evenly max-w-4xl py-3 pb-1  ">
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
