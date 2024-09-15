import logo from "./assets/logo.png";
import "./App.css";
import TreasuryAssets from "./components/TreasuryAssets";
import HoverTooltip from "./components/Tooltip";
import Loading from "./components/Loading";
import YieldChart from "./components/YieldChart";
import { usePortfolioData } from "./hooks/usePortfolioData";
import { useEffect } from "react";

function App() {
  const { summaryData, detailedData, loading, error, fetchDetailedData } = usePortfolioData();

  useEffect(() => {
    console.log("Fetching summary data", summaryData, loading.summary, error);

    if (!loading.summary && summaryData && !error) {
      console.log("Fetching detailed data");

      fetchDetailedData();
    }
  }, [summaryData]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-16 justify-center mb-32 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-16 justify-center mb-32 px-4 sm:px-6 lg:px-8">
        <header className="text-center pt-4">
          <div className="justify-center flex">
            <img src={logo} className="h-32 w-32" alt="logo" />
          </div>
          <div className="text-center pt-4">
            <h1 className="text-2xl font-bold">East India Onchain Company</h1>
            <p className="text-lg">Yield merchants and traders of natural crypto resources</p>
          </div>
        </header>

        {loading.summary ? (
          <Loading />
        ) : (
          <>
            {summaryData && (
              <>
                <TreasuryAssets assets={summaryData.treasuryAssets} />
                <main>
                  <div
                    className={
                      loading.detailed
                        ? "mx-auto border-l border-b pt-6 border-r border-theme-pan-navy bg-theme-pan-champagne pb-6"
                        : "mx-auto border-l pt-6 border-r border-theme-pan-navy bg-theme-pan-champagne pb-4"
                    }
                  >
                    <h1 className="text-xl pl-6 font-bold text-left">Yield Performance</h1>
                    <HoverTooltip text="Based on the last 4 harvests">
                      <p className="text-md pl-6 text-left">Rolling APR: {summaryData.rollingAPR.toFixed(2)}%</p>
                    </HoverTooltip>
                    {/* <p className="text-md pl-6 text-left">
                    Total Treasury Value: ${summaryData.totalTreasuryValue.toFixed(2)}
                  </p> */}
                    {/* <p className="text-md pl-6 text-left">Latest Yield: ${summaryData.latestYield.toFixed(2)}</p> */}
                  </div>

                  {loading.detailed && <Loading />}

                  {detailedData && (
                    <div className=" border-l border-r border-b rounded-bl-md rounded-br-md border-theme-pan-navy bg-theme-pan-champagne pb-4">
                      <div className="mx-8 ">
                        <YieldChart
                          labels={detailedData.yieldChartData.labels}
                          data={detailedData.yieldChartData.data.map((value) => Number(value.toFixed(2)))} // Round to 2 decimal places
                          label="Harvest Yield as % of Treasury"
                          borderColor="#0072B5"
                          backgroundColor="rgb(0, 114, 181, 0.2)"
                        />
                      </div>

                      <div className="mx-8 mt-8">
                        <YieldChart
                          labels={detailedData.cumulativeYieldChartData.labels}
                          data={detailedData.cumulativeYieldChartData.data.map((value) => Number(value.toFixed(2)))} // Round to 2 decimal places
                          label="Cumulative Yield as % of Treasury"
                          borderColor="rgba(255, 99, 132, 1)"
                          backgroundColor="rgba(255, 99, 132, 0.2)"
                        />
                      </div>
                      <h2 className="pt-8 text-xl pl-6 font-bold text-left">Portfolio Insights</h2>
                      <div className="grid mb-4 grid-cols-2 gap-4 mx-8 mt-4">
                        <div>
                          <p className="font-semibold">Average Harvest Frequency:</p>
                          <p>{detailedData.yieldFrequency.averageDays.toFixed(1)} Days</p>
                        </div>
                        <div>
                          <HoverTooltip text="Measures yield consistency. Higher score indicates more consistent yields.">
                            <div>
                              <p className="font-semibold">Yield Consistency Score:</p>
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div
                                    className="bg-theme-pan-sky h-2.5 rounded-full"
                                    style={{ width: `${detailedData.yieldConsistencyScore}%` }}
                                  ></div>
                                </div>
                                <p>{detailedData.yieldConsistencyScore.toFixed(0)}/100</p>
                              </div>
                            </div>
                          </HoverTooltip>
                        </div>
                        <div>
                          <p className="font-semibold">Latest Yield Performance:</p>
                          <p
                            className={
                              detailedData.latestRelativePerformance >= 0 ? "text-theme-pan-sky" : "text-red-500"
                            }
                          >
                            {detailedData.latestRelativePerformance >= 0 ? "+" : ""}
                            {detailedData.latestRelativePerformance.toFixed(2)}% vs average
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">Yield to Treasury Ratio:</p>
                          <p>{detailedData.yieldToTreasuryRatio.toFixed(2)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </main>
              </>
            )}
          </>
        )}
        <footer className="mt-2">
          <div className="mx-auto flex justify-evenly max-w-4xl py-3 pb-1">
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
            {/* <a
              target="_blank"
              href="https://galleonlabs.io"
              className="text-md text-center inline-flex border-b hover:border-b-theme-pan-navy border-transparent"
            >
              Galleon Labs
            </a> */}
            <a
              target="_blank"
              href="https://github.com/galleonlabs"
              className="text-md text-center inline-flex border-b hover:border-b-theme-pan-navy border-transparent"
            >
              Github
            </a>
          </div>
        </footer>
      </div>
      )
    </>
  );
}

export default App;
