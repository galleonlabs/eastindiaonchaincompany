import React from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface YieldChartProps {
  labels: string[];
  data: number[];
  label: string;
  borderColor: string;
  backgroundColor: string;
}

const YieldChart: React.FC<YieldChartProps> = ({ labels, data, label, borderColor, backgroundColor }) => {
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

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label,
            data,
            borderColor,
            backgroundColor,
          },
        ],
      }}
      options={chartOptions}
    />
  );
};

export default YieldChart;
