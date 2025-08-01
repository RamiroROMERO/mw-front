import { validInt } from '@/helpers/Utils';
import { useEffect, useState } from 'react'

export const useOrderDetail = ({ onBulkForm, listProducts, listCars }) => {
  const [listFilterProducts, setListFilterProducts] = useState([]);

  const onStoreChange = e => {
    const store = e.target.value;

    let filterProd = [];
    if (validInt(store) === 0) {
      filterProd = listProducts;
    } else {
      filterProd = listProducts.filter(item => { return item.storeId === validInt(store) });
    }

    setListFilterProducts(filterProd);
    onBulkForm({ storeId: store });
  }

  const onMachineChange = e => {
    const machine = e.target.value;

    const filterMachine = listCars.find(item => item.value === machine);

    onBulkForm({ machineId: machine, plate: filterMachine.code });
  }

  useEffect(() => {
    setListFilterProducts(listProducts);
  }, [listProducts]);

  return (
    {
      listFilterProducts,
      onStoreChange,
      onMachineChange
    }
  )
}
