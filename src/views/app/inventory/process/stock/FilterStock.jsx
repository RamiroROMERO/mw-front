import React, { useState } from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { validInt } from '@/helpers/Utils'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'

const FilterStock = ({storeId, productId, dateStart, dateEnd, inputUnit, outputUnit, listStores, listProducts, onInputChange, onBulkForm}) => {

  const [productsByStore, setProductsByStore] = useState([]);

  const onStoreChange = e =>{
    const store = e.target.value;

    const filterProducts = listProducts.filter(item=>{return item.storeId === validInt(store)});
    if(filterProducts.lenght>0){
      setProductsByStore(filterProducts);
    }else{
      setProductsByStore(listProducts);
    }

    onBulkForm({storeId: store});
  }

  const onProductChange = e =>{
    const product = e.target.value;

    const findProduct = listProducts.find(item=>{return item.id === validInt(product)});

    onBulkForm({productId: product, inputUnit: findProduct.inputUnit, outputUnit: findProduct.outputUnit});
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6" xxl="5">
          <SearchSelect
            label='select.storeId'
            name='storeId'
            inputValue={storeId}
            options={listStores}
            onChange={onStoreChange}
          />
        </Colxx>
        <Colxx xxs="12" lg="6" xxl="5">
          <SearchSelect
            label='select.productId'
            name='productId'
            inputValue={productId}
            options={productsByStore}
            onChange={onProductChange}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" lg="4" xl="3" xxl="2">
          <InputField
            name="inputUnit"
            label='input.inputUnit'
            value={inputUnit}
            onChange={onInputChange}
            type="text"
            disabled
          />
        </Colxx>
        <Colxx xxs="12" xs="6" lg="4" xl="3" xxl="2">
          <InputField
            name="outputUnit"
            label='input.outputUnit'
            value={outputUnit}
            onChange={onInputChange}
            type="text"
            disabled
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="12" lg="4" xl="3">
          <DateCalendar
            name="dateStart"
            label="select.dateStart"
            value={dateStart}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="12" lg="4" xl="3">
          <DateCalendar
            name="dateEnd"
            label="select.dateEnd"
            value={dateEnd}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
    </>
  )
}

export default FilterStock