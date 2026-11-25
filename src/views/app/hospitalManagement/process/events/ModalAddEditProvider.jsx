import { useEffect, useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import createNotification from '@Containers/ui/Notifications'
import { splitProvider, isValidQuantity } from './eventDetailRules';

// SPEC v2-152-sr: un proveedor del servicio con cantidad, precio y el valor que se queda el hospital; lo del proveedor es el resto (hospital + proveedor = total al centavo).
// La fila vuelve a la pantalla del servicio y se guarda con todas juntas.
const ModalAddEditProvider = ({ data, setOpen }) => {
  const { currentItem, fnSaveProvider } = data;

  const [listProviders, setListProviders] = useState([]);

  const { formState, onInputChange, onBulkForm } = useForm({ ...currentItem });
  const { providerId, quantity, price, hospValue } = formState;
  const split = splitProvider({ quantity, price, hospValue });

  useEffect(() => {
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      setListProviders(resp.data);
    }, () => { });
  }, []);

  const providerOptions = listProviders.map((item) => ({ value: item.id, label: `${item.dni} | ${item.name}` }));

  const fnSelectProvider = ({ target }) => {
    const provider = listProviders.find((item) => item.id === target.value);
    onBulkForm({ providerId: target.value, providerName: provider?.name || '' });
  }

  const fnSave = () => {
    if (!(Number(providerId) > 0)) {
      createNotification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    if (!isValidQuantity(quantity) || Number(price) < 0 || split.hospValue < 0 || split.provValue < 0) {
      createNotification('warning', 'page.events.msg.providerSplitInvalid', 'alert.warning.title');
      return;
    }
    fnSaveProvider({ ...formState, hospValue: split.hospValue });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <SearchSelect name="providerId" label="select.providerId" inputValue={providerId} options={providerOptions} onChange={fnSelectProvider} />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField label="table.column.qty" name="quantity" value={quantity} onChange={onInputChange} />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField label="table.column.price" name="price" value={price} onChange={onInputChange} />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField label="input.hospValue" name="hospValue" value={hospValue} onChange={onInputChange} />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField label="input.provValue" name="provValue" value={split.provValue} disabled />
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12}>
            <h5 className="text-end">{`${IntlMessages("table.column.total")}: ${formatNumber(split.total, '', 2)}`}</h5>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}>
          <i className="bi bi-floppy" /> {IntlMessages('button.save')}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddEditProvider
