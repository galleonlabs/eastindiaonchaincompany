import { useEffect, useState } from 'react';
import logo from './assets/logo.png';
import './App.css';
import { format } from 'date-fns';
import TreasuryAssets from './TreasuryAssets';
import ResourceHarvests from './ResourceHarvests';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { fetchData, fetchPrices } from './utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TreasuryAsset {
  href: string;
  imgSrc: string;
  id: string;
  symbol: string;
  quantity: number;
  usdValue?: number;
}

interface Harvest {
  assetSymbol: string;
  id: string;
  quantity: number;
  date: { seconds: number; nanoseconds: number };
}

interface Yield {
  quantity: number;
  date: { seconds: number; nanoseconds: number };
}

function App() {
  const [treasuryAssets, setTreasuryAssets] = useState<TreasuryAsset[]>([]);
  const [harvestAssets, setHarvestAssets] = useState<Harvest[]>([]);
  const [yieldData, setYieldData] = useState<Yield[]>([]);
  const [totalTreasuryValue, setTotalTreasuryValue] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchTreasuryAssets = async () => {
      const assets = await fetchData('treasuryAssets') as TreasuryAsset[];

      const assetIds = assets.map(asset => asset.id);
      const prices = await fetchPrices(assetIds);

      const updatedAssets = assets.map(asset => ({
        ...asset,
        usdValue: prices[asset.id] * asset.quantity,
      }));

      setTreasuryAssets(updatedAssets);

      const totalValue = updatedAssets.reduce((acc, asset) => acc + (asset.usdValue || 0), 0);
      setTotalTreasuryValue(totalValue);
    };

    fetchTreasuryAssets();
  }, []);

  useEffect(() => {
    const fetchHarvestAssets = async () => {
      const harvests = await fetchData('harvests') as Harvest[];
      setHarvestAssets(harvests);
    };

    fetchHarvestAssets();
  }, []);

  useEffect(() => {
    const fetchYieldData = async () => {
      const yields = await fetchData('yieldOvertime') as Yield[];

      // Sort the yield data by date in chronological order
      const sortedYields = yields.sort((a, b) => a.date.seconds - b.date.seconds);
      setYieldData(sortedYields);
    };

    fetchYieldData();
  }, [totalTreasuryValue]);

  const groupedHarvestAssets = harvestAssets.reduce((acc, harvest) => {
    const date = format(new Date(harvest.date.seconds * 1000), 'dd/MM/yyyy');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(harvest.assetSymbol);
    return acc;
  }, {} as Record<string, string[]>);

  const groupedHarvestAssetsArray = Object.entries(groupedHarvestAssets).map(([date, symbols]) => ({
    date,
    symbols: symbols.join(', '),
  }));

  const totalPages = Math.ceil(groupedHarvestAssetsArray.length / itemsPerPage);

  // Calculate the aggregated yield over time
  let aggregatedYield = 0;
  const aggregatedYieldData = yieldData.map(yieldEntry => {
    aggregatedYield += yieldEntry.quantity;
    return (aggregatedYield / totalTreasuryValue) * 100;
  });

  const chartData = {
    labels: yieldData.map(yieldEntry => format(new Date(yieldEntry.date.seconds * 1000), 'dd/MM/yyyy')),
    datasets: [
      {
        label: 'Yield as % of Treasury Value',
        data: yieldData.map(yieldEntry => (yieldEntry.quantity / totalTreasuryValue) * 100),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Aggregated Yield as % of Treasury Value',
        data: aggregatedYieldData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          callback: function (value) {
            return `${Number(value).toFixed(2)}%`;
          }
        }
      }
    }
  };

  return (
    <div className='mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-16 justify-center mb-32'>
      <div className='justify-center flex'>
        <img src={logo} className="h-32 w-32" alt="logo" />
      </div>
      <div className='text-center pt-4'>
        <h1 className='text-2xl font-bold'>East India Onchain Company</h1>
        <p className='text-lg'>
          Yield merchants and traders of natural crypto resources
        </p>
      </div>

      <TreasuryAssets assets={treasuryAssets} />

      <div className="mx-auto border-b border-l border-theme-pan-navy bg-theme-pan-champagne rounded-bl rounded-tr py-4 mt-6">
        <h1 className="text-lg pl-4 font-bold text-left">Yield Performance</h1>
        <div className="mx-8 rounded-sm pb-3 pt-2">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <ResourceHarvests
        harvestAssets={groupedHarvestAssetsArray}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}

export default App;
