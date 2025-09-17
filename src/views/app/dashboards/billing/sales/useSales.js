import { request } from '@/helpers/core';
import { validFloat } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import React, { useEffect, useState } from 'react'

export const useSales = ({ setLoading }) => {
  const [dataAllSales, setDataAllSales] = useState([]);
  const [labelSales, setLabelSales] = useState([]);
  const [dataProductsBest, setDataProductsBest] = useState([]);
  const [labelProductsBest, setLabelProductsBest] = useState([]);
  const [dataSalesForSeller, setDataSalesForSeller] = useState([]);
  const [labelSalesForSeller, setLabelSalesForSeller] = useState([]);
  const [dataSalesForClassif, setDataSalesForClassif] = useState([]);
  const [labelSalesForClassif, setLabelSalesForClassif] = useState([]);
  const [dataSalesForDepto, setDataSalesForDepto] = useState([]);
  const [labelSalesForDepto, setLabelSalesForDepto] = useState([]);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    startDate: '2025-01-01',
    endDate: '2025-08-31'
  });

  const fnSearchDash = () => {
    setLoading(true);
    request.POST('dashboard/sales', { ...formState }, resp => {
      let { allSales, bestSellingProducts, salesforSeller, salesForClassification, salesForDepto } = resp.data;

      // todas las ventas
      const labelAllSales = [], totalsAllSales = [];
      allSales.forEach(item => {
        labelAllSales.push(item.label);
        totalsAllSales.push(validFloat(item.total));
      });
      setLabelSales(labelAllSales);
      setDataAllSales([
        {
          label: 'Ventas por Mes',
          data: totalsAllSales
        }
      ]);

      //productos mas vendidos
      const labelBestSellingProducts = [], totalsBestSellingProducts = [];
      bestSellingProducts.forEach(item => {
        labelBestSellingProducts.push(item.label);
        totalsBestSellingProducts.push(validFloat(item.value));
      });
      setDataProductsBest([
        {
          label: '',
          data: totalsBestSellingProducts
        }
      ]);
      setLabelProductsBest(labelBestSellingProducts);

      //ventas por vendedor
      const labelSalesforSeller = [''];
      salesforSeller = salesforSeller.map((item) => {
        item.data = [validFloat(item.total)]
        return item
      });
      setLabelSalesForSeller(labelSalesforSeller);
      setDataSalesForSeller(salesforSeller);

      //ventas por clasificacion
      const lblSalesForClassif = [''];
      salesForClassification = salesForClassification.map((item) => {
        item.data = [validFloat(item.total)]
        return item
      });
      setLabelSalesForClassif(lblSalesForClassif);
      setDataSalesForClassif(salesForClassification);

      //ventas por ubicacion
      const labelSalesByDepto = [], totalsSalesByDepto = [];
      salesForDepto.forEach(item => {
        labelSalesByDepto.push(item.label);
        totalsSalesByDepto.push(validFloat(item.value));
      });
      setDataSalesForDepto([
        {
          label: '',
          data: totalsSalesByDepto
        }
      ]);
      setLabelSalesForDepto(labelSalesByDepto);

      setLoading(false);
    }, err => {
      console.log(err);
      setLoading(false);
    }, false);
  }

  const propsToHeaderReport = {
    formState,
    onInputChange,
    fnSearchDash
  }

  return (
    {
      dataAllSales,
      labelSales,
      dataProductsBest,
      labelProductsBest,
      dataSalesForSeller,
      labelSalesForSeller,
      dataSalesForClassif,
      labelSalesForClassif,
      dataSalesForDepto,
      labelSalesForDepto,
      propsToHeaderReport
    }
  )
}
