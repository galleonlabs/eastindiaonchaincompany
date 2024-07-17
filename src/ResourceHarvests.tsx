// ResourceHarvests.tsx
import React from 'react';

interface HarvestAsset {
  date: string;
  symbols: string;
}

interface ResourceHarvestsProps {
  harvestAssets: HarvestAsset[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
}

const ResourceHarvests: React.FC<ResourceHarvestsProps> = ({ harvestAssets, currentPage, totalPages, setCurrentPage, itemsPerPage }) => (
  <div className="mx-auto border-b border-l border-r border-theme-pan-navy bg-theme-pan-champagne pb-4">
    <div className="mx-8 rounded-sm pb-3 ">
      <table className="min-w-full divide-y divide-theme-pan-navy">
        <thead className="bg-theme-pan-champagne">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-theme-pan-navy uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-theme-pan-navy uppercase tracking-wider">Crypto Resources Harvested</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-theme-pan-navy">
          {harvestAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((entry, index) => (
            <tr key={index}>
              
              <td className="px-6 py-2 text-md whitespace-nowrap">{entry.date}</td>
              <td className="px-6 py-2 text-md whitespace-nowrap font-semibold">{entry.symbols}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-theme-pan-champagne text-md text-theme-pan-navy rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-theme-pan-navy text-md">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-theme-pan-champagne text-md text-theme-pan-navy rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
);

export default ResourceHarvests;
