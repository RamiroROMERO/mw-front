import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, validInt } from '@Helpers/Utils'
import { request, notifyError } from '@Helpers/core'
import { SimpleSelect } from '@Components/simpleSelect'
import notification from '@Containers/ui/Notifications';

const ModalAddxLotes = ({ setOpen, data }) => {
  const { setLoading, listWarehouse, onDone } = data;
  const intl = useIntl();

  const [listProductType, setListProductType] = useState([]);
  const [warehouseId, setWarehouseId] = useState('0');
  const [productTypeId, setProductTypeId] = useState('');

  // Almacén y tipo son obligatorios ("Todos" es -1); el back valida el resto.
  const canProcess = validInt(warehouseId) > 0 && validInt(productTypeId) !== 0;

  const fnSaveLocation = () => {
    if (!canProcess) return;

    setLoading(true);
    // showMessage en false: el éxito lleva los conteos reales y el error lo muestra notifyError (mensaje del back).
    request.POST('inventory/settings/productsStore/addxLots', { warehouseId, productTypeId }, (resp) => {
      const { created = 0, skipped = 0 } = resp?.data || {};
      notification('success', { text: intl.formatMessage({ id: 'page.storesProducts.modal.addxLotes.result' }, { created, skipped }) }, 'alert.success.title');
      setLoading(false);
      setOpen(false);
      if (onDone) onDone();
    }, (err) => {
      notifyError(err, 'msg.save.record.error');
      setLoading(false);
    }, false);
  }

  useEffect(() => {
    request.GET('inventory/settings/productsClassifications', (resp) => {
      const { data } = resp;
      data.push({ id: -1, name: 'Todos' });
      setListProductType(data);
      setLoading(false);
    }, () => {
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
        <Button color="primary" onClick={fnSaveLocation} disabled={!canProcess}>
          <i className="bi bi-send" /> {IntlMessages("button.process")}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddxLotes