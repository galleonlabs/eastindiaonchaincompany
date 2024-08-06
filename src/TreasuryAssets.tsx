// TreasuryAssets.tsx
import React from 'react';

interface TreasuryAsset {
  href: string;
  imgSrc: string;
  id: string;
  symbol: string;
  quantity: number;
  usdValue?: number;
}

interface TreasuryAssetsProps {
  assets: TreasuryAsset[];
}

const TreasuryAssets: React.FC<TreasuryAssetsProps> = ({ assets }) => (
  <div className="mx-auto border-l border-t border-r border-theme-pan-navy bg-theme-pan-champagne rounded-t-md  pt-6 pb-4 mt-6">
    <h1 className="text-xl pl-6 font-bold text-left">Treasury Yield Assets</h1>
    <div className="mx-8 rounded-sm pt-4 flex flex-wrap">
      {assets.map((link, index) => (
        <a key={index} href={link.href} target="_blank" rel="noreferrer">
          <img
            alt="project logo"
            src={link.imgSrc}
            className="inline-block h-12 w-12 rounded-full border-theme-pan-navy bg-white border p-0.5 mx-2 hover:opacity-80 grayscale-[30%]"
          />
        </a>
      ))}
    </div>
  </div>
);

export default TreasuryAssets;
