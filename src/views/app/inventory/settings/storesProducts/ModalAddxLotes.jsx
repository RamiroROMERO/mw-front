import React, { useEffect, useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages, validInt } from '@/helpers/Utils'
import { request } from '@/helpers/core'
import { SimpleSelect } from '@/components/simpleSelect'

const ModalAddxLotes = ({ setOpen, data }) => {
  const { setLoading, listWarehouse } = data;

  const [listProductType, setListProductType] = useState([]);
  const [warehouseId, setWarehouseId] = useState('0');
  const [productTypeId, setProductTypeId] = useState('');

  const fnSaveLocation = () => {
    if (validInt(warehouseId) === 0) {
      return;
    }

    if (validInt(productTypeId) === 0) {
      return;
    }

    const typeProductName = listProductType.find(elem => validInt(elem.id) === validInt(productTypeId)).name;
    const data = { warehouseId, productTypeId, typeProductName };
    setLoading(true);
    setLoading(true);
    request.POST('inventory/settings/productsStore/addxLots', data, (resp) => {
      setLoading(false);
      setOpen(false);
    }, (err) => {
      setLoading(false);
      setOpen(false);
    });
  }

  useEffect(() => {
    request.GET('inventory/settings/productsClassifications', (resp) => {
      const { data } = resp;
      data.push({ id: -1, name: 'Todos' });
      setListProductType(data);
      setLoading(false);
    }, err => {
      setLoading(false);
    })
  }, []);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SimpleSelect
              label="page.productsCatalog.modal.newProduct.stock.store"
              name="warehouseId"
              id="warehouseId"
              value={warehouseId}
              options={listWarehouse}
              onChange={({ target }) => setWarehouseId(target.value)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <SimpleSelect
              label="page.productsCatalog.modal.newProduct.title.type"
              name="productTypeId"
              id="productTypeId"
              value={productTypeId}
              options={listProductType}
              onChange={({ target }) => setProductTypeId(target.value)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveLocation}>
          <i className="bi bi-send" /> {IntlMessages("button.process")}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddxLotes