import { useEffect, useState } from 'react';
import logo from './assets/logo.png';
import './App.css';
import { format } from 'date-fns';
import TreasuryAssets from './TreasuryAssets';
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

interface Yield {
  quantity: number;
  date: { seconds: number; nanoseconds: number };
}

function App() {
  const [treasuryAssets, setTreasuryAssets] = useState<TreasuryAsset[]>([]);
  const [yieldData, setYieldData] = useState<Yield[]>([]);
  const [totalTreasuryValue, setTotalTreasuryValue] = useState<number>(0);

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
    const fetchYieldData = async () => {
      const yields = await fetchData('yieldOvertime') as Yield[];

      // Sort the yield data by date in chronological order
      const sortedYields = yields.sort((a, b) => a.date.seconds - b.date.seconds);
      setYieldData(sortedYields);
    };

    fetchYieldData();
  }, [totalTreasuryValue]);

  let aggregatedYield = 0;
  const aggregatedYieldData = yieldData.map(yieldEntry => {
    aggregatedYield += yieldEntry.quantity;
    return (aggregatedYield / totalTreasuryValue) * 100;
  });

  const chartData = {
    labels: yieldData.map(yieldEntry => format(new Date(yieldEntry.date.seconds * 1000), 'dd/MM/yyyy')),
    datasets: [
      {
        label: 'Harvest Yield as % of Treasury',
        data: yieldData.map(yieldEntry => (yieldEntry.quantity / totalTreasuryValue) * 100),
        borderColor: '#0072B5',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Cumulative Yield as % of Treasury',
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
        beginAtZero: true,
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

      <div className="mx-auto border-l border-r border-b border-theme-pan-navy rounded-sm bg-theme-pan-champagne pt-4 pb-2 ">
        <h1 className="text-xl pl-6 font-bold text-left">Yield Performance</h1>
        <div className="mx-8 rounded-sm pb-3 pt-3">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className=" mx-auto flex justify-evenly max-w-4xl py-3 pb-1 border-t border-theme-pan-navy pt-3">
          <a target='_blank' href='https://twitter.com/galleonlabs' className='text-md text-center inline-flex border-b hover:border-b-theme-yellow border-transparent'>Twitter</a>
          <a target='_blank' href='https://twitter.com/davyjones0x' className='text-md text-center inline-flex border-b hover:border-b-theme-yellow border-transparent'>Davy Jones</a>
          <a target='_blank' href='https://galleonlabs.io' className='text-md text-center inline-flex border-b hover:border-b-theme-yellow border-transparent'>Galleon Labs</a>
          <a target='_blank' href='https://github.com/galleonlabs/tortuga-onchain' className='text-md text-center inline-flex border-b hover:border-b-theme-yellow border-transparent'>Github</a>
        </div>
      </div>


    

    </div>
  );
}

export default App;
