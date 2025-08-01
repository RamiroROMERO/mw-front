import { validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react'

export const useSalesReport = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [listBillers, setListBillers] = useState([]);
  const [listSellers, setlistSellers] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [showCustomer, setShowCustomer] = useState("none");
  const [showBiller, setShowBiller] = useState("none");
  const [showSeller, setShowSeller] = useState("none");
  const [openModalOtherReports, setOpenModalOtherReports] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    dateStart: '',
    dateEnd: '',
    typeReport: 0,
    exportToXls: 0,
    customerId: 0,
    billerId: 0,
    sellerId: 0,
  });

  const onTypeChange = e => {
    const type = e.target.value;

    if (validInt(type) === 5) {
      setShowCustomer("block");
      setShowBiller("none");
      setShowSeller("none");
    } else if (validInt(type) === 6) {
      setShowCustomer("none");
      setShowBiller("block");
      setShowSeller("none");
    } else if (validInt(type) === 7) {
      setShowCustomer("none");
      setShowBiller("none");
      setShowSeller("block");
    } else {
      setShowCustomer("none");
      setShowBiller("none");
      setShowSeller("none");
    }

    onBulkForm({ typeReport: type });
  }

  const fnPrintReport = () => { }

  const fnOtherReport = () => {
    setOpenModalOtherReports(true);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('facCustomers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/users?status=1', (resp) => {
      const users = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.id,
          code: item.sellerCode,
          isSeller: item.isSeller,
          isCashier: item.isCashier,
          name: item.name
        }
      });
      const sellers = users.filter((item) => {
        return item.isSeller === 1
      });
      const billers = users.filter((item) => {
        return item.isCashier === 1
      });
      setlistSellers(sellers);
      setListBillers(billers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStores(stores);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET(`inventory/process/stoks/getStoks`, (resp) => {
      const data = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProducts(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    {
      formState,
      onInputChange,
      listCustomers,
      listBillers,
      listSellers,
      listStores,
      listProducts,
      fnPrintReport,
      fnOtherReport,
      onTypeChange,
      showCustomer,
      showBiller,
      showSeller,
      openModalOtherReports,
      setOpenModalOtherReports
    }
  )
}
