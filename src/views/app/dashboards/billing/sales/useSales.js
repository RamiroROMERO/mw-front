import { request } from '@Helpers/core';
import { formatNumber, validFloat, validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { useEffect, useState } from 'react'

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
  const [dataResumeCards, setDataResumeCards] = useState([]);
  const [topVendorCard, setTopVendorCard] = useState(null);
  const [dataMonthDetail, setDataMonthDetail] = useState([]);
  const [listYears, setListYears] = useState([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportId, setReportId] = useState('1');
  const [noYear, setNoYear] = useState(new Date().getFullYear());

  // Combobox_hw2 del legacy arma sus opciones desde los años reales con facturas
  // y selecciona el más reciente por defecto (Go top tras ORDER BY year DESC) —
  // en vez de asumir el año del reloj del sistema, que puede no tener datos.
  useEffect(() => {
    request.GET('dashboard/sales/years', (resp) => {
      setListYears(resp.data);
      if (resp.data.length > 0) setNoYear(resp.data[0]);
    }, () => { });
  }, []);

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
      // El backend ya ordena por total DESC (igual que el legacy "Go Top" tras el
      // ORDER BY) — el primero de la lista es el vendedor con más ventas.
      setTopVendorCard(salesforSeller.length > 0
        ? { title: 'Máximo Vendedor', value: `${salesforSeller[0].label} - ${formatNumber(salesforSeller[0].total, 'L. ', 2)}` }
        : { title: 'Máximo Vendedor', value: 'L. 0.00' });
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
      setLoading(false);
    }, false);

    setLoading(true);
    request.POST('dashboard/sales/dashResumeCards', { startDate, endDate }, resp => {
      let { monthDetails, totalSales, mediaSales, totalItems } = resp.data;

      const totals = [
        {
          title: 'Ventas Totales',
          value: formatNumber(totalSales, "L. ", 2)
        },
        {
          title: 'Promedio Mensual',
          value: formatNumber(mediaSales, "L. ", 2)
        },
        {
          title: 'Total Items Vendidos',
          value: formatNumber(totalItems, "", 0)
        },
      ]

      setDataResumeCards(totals);
      setDataMonthDetail(monthDetails);
      setLoading(false);
    }, err => {
      setLoading(false);
    }, false);
  }

  // "Máximo Vendedor" viene de una llamada separada (dashboard/sales) — se agrega
  // aquí en vez de en dashResumeCards para no acoplar las dos respuestas del backend.
  const dataTotals = topVendorCard ? [...dataResumeCards, topVendorCard] : dataResumeCards;

  const propsToHeaderReport = {
    reportId,
    setReportId,
    noYear,
    setNoYear,
    listYears,
    fnSearchDash
  }

  return (
    {
      dataAllSales,
      dataTotals,
      dataMonthDetail,
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
