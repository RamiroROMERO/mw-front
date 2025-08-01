import { validInt } from '@/helpers/Utils';

export const useFormCredit = ({ onBulkForm, setShowDetail1, setShowDetail2, setCreditNotesDetail, setCreditNotesDetail2, listProviders, setShowSpecify }) => {

  const onConceptChange = e => {
    const conceptType = e.target.value;

    if (validInt(conceptType) === 4) {
      setShowSpecify("block");
    } else {
      setShowSpecify("none");
    }

    if (validInt(conceptType) === 3) {
      setCreditNotesDetail([]);
      setShowDetail1("none");
      setShowDetail2("flex");

      onBulkForm({
        concept: conceptType,
        percentDiscount: 0,
        accountId: 0,
        invoiceNum: '',
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0
      });
    } else {
      setCreditNotesDetail2([]);
      setShowDetail1("flex");
      setShowDetail2("none");

      onBulkForm({
        concept: conceptType
      });
    }
  }

  const onProviderChange = e => {
    const provider = e.target.value;

    const filterProv = listProviders.find(item => item.value === validInt(provider));

    onBulkForm({
      providerId: provider,
      providerCode: filterProv ? filterProv.value : 0,
      providerRtn: filterProv ? filterProv.dni : '',
      providerName: filterProv ? filterProv.label : ''
    });
  }

  return (
    {
      onConceptChange,
      onProviderChange
    }
  )
}
