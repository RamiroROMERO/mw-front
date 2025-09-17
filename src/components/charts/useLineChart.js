import { useEffect, useState } from 'react';
import { colorsChart } from './config';
import { IntlMessages } from '@/helpers/Utils';

export const useLineChart = ({ title, labels, dataChart, type = 'x' }) => {
  const [data, setData] = useState({ datasets: [] });

  const options = {
    indexAxis: type,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        display: false
      },
      title: {
        display: true,
        text: IntlMessages(title),
      },
    },
  };

  useEffect(() => {
    const newData = dataChart.map((item) => {
      const numColor = Math.floor(Math.random() * 20);
      item.borderColor = colorsChart[numColor].borderColor,
        item.backgroundColor = colorsChart[numColor].backgroundColor
      return item
    });

    setData({
      labels,
      datasets: newData
    });

  }, [dataChart]);

  return (
    {
      options,
      data
    }
  )
}
