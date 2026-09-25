import { useState, useEffect } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { validFloat } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

const emptyLine = {
  idCtaCont: '',
  accountName: '',
  valueDebit: 0,
  valueCredit: 0,
  description: '',
  referenceCode: '',
  customerId: '',
  providerId: ''
}

export const useChecksDetail = ({ setLoading, lines, setLines, editingLineIndex, setEditingLineIndex }) => {
  const [listAccount, setListLedgerAccount] = useState([]);
  const [sendFormDetail, setSendFormDetail] = useState(false);

  const validCheckDtail = {
    idCtaCont: [(val) => val !== '', "msg.required.select.ctaCount"]
  }

  const { onInputChange: onInputChangeDetail, setBulkForm: setBulkFormDetail, formState: formStateDetail, onResetForm: onResetFormDetail, isFormValid: isFormValidDetail, formValidation: formValidationDetail } = useForm(emptyLine, validCheckDtail)

  const fnAddItem = () => {
    setSendFormDetail(true);
    if (!isFormValidDetail) return;
    if (!(validFloat(formStateDetail.valueDebit) > 0) && !(validFloat(formStateDetail.valueCredit) > 0)) {
      notification('warning', 'msg.checks.line.valueRequired', 'alert.warning.title');
      return;
    }

    const accountOption = listAccount.find((a) => a.value === formStateDetail.idCtaCont);
    const newLine = { ...formStateDetail, accountName: accountOption?.label || formStateDetail.accountName };

    if (editingLineIndex !== null) {
      setLines((prev) => prev.map((line, i) => (i === editingLineIndex ? newLine : line)));
      setEditingLineIndex(null);
    } else {
      setLines((prev) => [...prev, newLine]);
    }

    onResetFormDetail();
    setSendFormDetail(false);
  }

  const fnEditLine = (index) => {
    setEditingLineIndex(index);
    setBulkFormDetail(lines[index]);
    setSendFormDetail(false);
  }

  const fnRemoveLine = (index) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
    if (editingLineIndex === index) {
      setEditingLineIndex(null);
      onResetFormDetail();
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccount(listAccounts);
      setLoading(false);
    }, () => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    {
      onInputChangeDetail,
      onResetFormDetail,
      formStateDetail,
      listAccount,
      isFormValidDetail,
      sendFormDetail,
      setSendFormDetail,
      formValidationDetail,
      fnAddItem,
      fnEditLine,
      fnRemoveLine
    }
  )
}
