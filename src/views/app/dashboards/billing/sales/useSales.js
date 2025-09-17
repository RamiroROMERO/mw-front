import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportId, setReportId] = useState('1');
  const [noYear, setNoYear] = useState(new Date().getFullYear());

  // const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
  //   startDate: '2025-01-01',
  //   endDate: '2025-08-31'
  // });

  const fnSetDates = () => {
    let currStartDate = '', currEndDate = ''
    if (validInt(reportId) == 1) {
      currStartDate = `${noYear}-01-01`;
      currEndDate = `${noYear}-12-31`;
    }
    if (validInt(reportId) == 2) {
      let d = new Date();
      currEndDate = d.toJSON().substring(0, 10);
      d.setDate(d.getDate() - 365);
      currStartDate = d.toJSON().substring(0, 8) + "01"
    }
    if (validInt(reportId) == 3) {
      let d = new Date();
      currEndDate = d.toJSON().substring(0, 10);
      d.setDate(d.getDate() - 180)
      currStartDate = d.toJSON().substring(0, 8) + "01";
    }
    setStartDate(currStartDate);
    setEndDate(currEndDate);
  }

  useEffect(() => {
    fnSetDates();
  }, [reportId, noYear])

  useEffect(fnSetDates, [])

  const fnSearchDash = () => {
    setLoading(true);
    request.POST('dashboard/sales', { startDate, endDate }, resp => {
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
    reportId,
    setReportId,
    noYear,
    setNoYear,
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
