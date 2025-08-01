import { validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const useBoxesReport = ({ setLoading }) => {
  const [listCashiers, setListCashiers] = useState([]);
  const [listPaymentMethods, setListPaymentMethods] = useState([]);
  const [showCashier, setShowCashier] = useState("none");
  const [showPaymentMethod, setShowPaymentMethod] = useState("none");

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    dateStart: '',
    dateEnd: '',
    typeReport: 0,
    cashierId: 0,
    paymentMethodId: 0
  });

  const onTypeChange = e => {
    const type = e.target.value;

    if (validInt(type) === 2) {
      setShowCashier("block");
      setShowPaymentMethod("none");
    } else if (validInt(type) === 3) {
      setShowCashier("none");
      setShowPaymentMethod("block");
    } else {
      setShowCashier("none");
      setShowPaymentMethod("none");
    }

    onBulkForm({ typeReport: type });
  }

  const fnExportToExcel = () => { }

  const fnPrintReport = () => { }

  useEffect(() => {
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
      const cashiers = users.filter((item) => {
        return item.isCashier === 1
      });
      setListCashiers(cashiers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/paymentTypes', (resp) => {
      const paymentMethod = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListPaymentMethods(paymentMethod);
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
      onTypeChange,
      listCashiers,
      listPaymentMethods,
      showCashier,
      showPaymentMethod,
      fnExportToExcel,
      fnPrintReport
    }
  )
}