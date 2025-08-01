import { validFloat } from "@/helpers/Utils";

export const useRetentionForm = ({ setBulkFormIndex, listDocto }) => {

  const onCodeChange = e => {
    const codDoc = e.target.value
    const filter = listDocto.filter((item) => {
      return item.value === codDoc
    });

    let caiValue = '';
    let numberFac = '';
    let rangeValue = '';
    let limitValue = '';
    const docId = filter.length > 0 ? (validFloat(filter[0].documentId) + 1) : "";

    if (filter.length > 0) {
      const ndoc4 = filter[0].setTaxDocument ? validFloat(filter[0].setTaxDocument.ndoc4) + 1 : '';

      caiValue = filter[0].setTaxDocument ? `${filter[0].setTaxDocument.cai1}-${filter[0].setTaxDocument.cai2}-${filter[0].setTaxDocument.cai3}-${filter[0].setTaxDocument.cai4}-${filter[0].setTaxDocument.cai5}-${filter[0].setTaxDocument.cai6}` : '';

      numberFac = filter[0].setTaxDocument ? `${filter[0].setTaxDocument.ndoc1}-${filter[0].setTaxDocument.ndoc2}-${filter[0].setTaxDocument.ndoc3}-${(ndoc4 + '').padStart(8, '0')}` : '';

      rangeValue = filter[0].setTaxDocument ? filter[0].setTaxDocument.noRange : '';

      limitValue = filter[0].setTaxDocument ? filter[0].setTaxDocument.limitDate : '';
    } else {
      caiValue = '';
      numberFac = '';
      rangeValue = '';
      limitValue = '';
    }

    setBulkFormIndex({ documentCode: codDoc, documentId: docId, cai: caiValue, numberCAI: numberFac, rangeCAI: rangeValue, limitDate: limitValue })
  }

  return (
    {
      onCodeChange
    }
  )
}