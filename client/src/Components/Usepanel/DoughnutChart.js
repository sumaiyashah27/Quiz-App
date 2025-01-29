import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; // Import necessary Chart.js modules

// Register required elements
ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 1,  // Keeps the aspect ratio square
};

const DoughnutChart = ({ goodScore, poorScore }) => {
  const data = {
    labels: ['Good Score', 'Poor Score'],
    datasets: [
      {
        data: [goodScore, poorScore],
        backgroundColor: ['#100b5c', '#C80D18'],
      },
    ],
  };

  return (
    <div className="doughnut-chart-container">
      <div className="doughnut-chart">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};
export default DoughnutChart;
