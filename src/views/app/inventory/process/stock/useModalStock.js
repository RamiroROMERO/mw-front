import { validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useState } from 'react';

export const useModalStock = ({ listProducts }) => {
  const [productsByStore, setProductsByStore] = useState([]);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    storeId: 0,
    productId: 0,
    dateStart: '',
    dateEnd: '',
    inputUnit: '',
    outputUnit: '',
    typeValues: 0,
    exportToXls: 0,
    typeReport: 0
  });

  const onStoreChange = e => {
    const store = e.target.value;

    const filterProducts = listProducts.filter(item => { return item.storeId === validInt(store) });
    if (filterProducts.lenght > 0) {
      setProductsByStore(filterProducts);
    } else {
      setProductsByStore(listProducts);
    }

    onBulkForm({ storeId: store });
  }

  const onProductChange = e => {
    const product = e.target.value;

    const findProduct = listProducts.find(item => { return item.id === validInt(product) });

    onBulkForm({ productId: product, inputUnit: findProduct.inputUnit, outputUnit: findProduct.outputUnit });
  }

  const fnPrintReport = () => { }

  return (
    {
      formState,
      productsByStore,
      onInputChange,
      onStoreChange,
      onProductChange,
      fnPrintReport
    }
  )
}
