import React, { useEffect, useState } from 'react'
import { colorsChart } from './config';
import { IntlMessages } from '@/helpers/Utils';

export const usePieChart = ({ title, labels, dataChart }) => {
  const [data, setData] = useState({ datasets: [] });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        display: true
      },
      title: {
        display: true,
        text: IntlMessages(title),
      },
    },
  };

  useEffect(() => {
    const newData = dataChart.map((item) => {
      const dataBorderColor = [], dataBackgroundColor = [];
      for (let i = 0; i < item.data.length; i++) {
        const numColor = Math.floor(Math.random() * 20);
        const color1 = colorsChart[numColor].borderColor;
        const color2 = colorsChart[numColor].backgroundColor;
        dataBorderColor.push(color1);
        dataBackgroundColor.push(color2);
      }
      item.borderColor = dataBorderColor
      item.backgroundColor = dataBackgroundColor
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
