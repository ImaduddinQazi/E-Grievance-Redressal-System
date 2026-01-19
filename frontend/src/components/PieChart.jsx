import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-muted">No data available</div>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data).map(dept => dept.total),
        backgroundColor: Object.values(data).map(dept => dept.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%',
  };

  return (
    <div style={{ position: 'relative', height: '300px' }}>
      <Doughnut data={chartData} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#6c757d'
      }}>
        Total
        <br />
        {Object.values(data).reduce((sum, dept) => sum + dept.total, 0)}
      </div>
    </div>
  );
};

export default PieChart;