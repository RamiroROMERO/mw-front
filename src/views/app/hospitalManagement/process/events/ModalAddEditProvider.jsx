import { useEffect, useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { formatNumber, IntlMessages, validFloat } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import createNotification from '@Containers/ui/Notifications'

const ModalAddEditProvider = ({ data, setOpen }) => {
  const { currentItem, setLoading, fnGetProviders } = data;

  const [listProviders, setListProviders] = useState([]);

  const { formState, onInputChange, onBulkForm } = useForm({ ...currentItem });
  const { id, fatherId, providerId, quantity, price, subtotal, discPercent, discount, taxPercent, taxValue, hospPercent, provPercent, hospValue, provValue, total } = formState;

  useEffect(() => {
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      setListProviders(resp.data);
    }, (err) => { });
  }, []);

  const providerOptions = listProviders.map((item) => ({
    value: item.id,
    label: `${item.dni} | ${item.name}`
  }));

  const fnSelectProvider = ({ target }) => {
    const newProviderId = target.value;
    const provider = listProviders.find((item) => item.id === newProviderId);
    onBulkForm({
      providerId: newProviderId,
      hospPercent: validFloat(provider?.percHosp),
      provPercent: validFloat(provider?.percProv)
    });
  }

  useEffect(() => {
    const newSubtotal = validFloat(quantity) * validFloat(price);
    const newDiscount = validFloat(newSubtotal * (validFloat(discPercent) / 100), 2);
    const newTax = validFloat((newSubtotal - newDiscount) * (validFloat(taxPercent) / 100), 2);
    const newTotal = newSubtotal - newDiscount + newTax;

    onBulkForm({ subtotal: newSubtotal, discount: newDiscount, taxValue: newTax, total: newTotal });
  }, [quantity, price, discPercent, taxPercent]);

  useEffect(() => {
    const newHospValue = validFloat(total * (validFloat(hospPercent) / 100), 2);
    const newProvValue = validFloat(total * (validFloat(provPercent) / 100), 2);

    onBulkForm({ hospValue: newHospValue, provValue: newProvValue });
  }, [total, hospPercent, provPercent]);

  const fnSave = () => {
    if (validFloat(providerId) === 0) {
      createNotification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }

    const newData = {
      fatherId, providerId, quantity, price, discPercent, discount, taxPercent, taxValue,
      hospPercent, provPercent, hospValue, provValue, total
    };

    setLoading(true);
    if (validFloat(id) === 0) {
      request.POST('hospital/process/eventDetailsProviders', newData, (resp) => {
        setLoading(false);
        setOpen(false);
        fnGetProviders();
      }, (err) => {
        setLoading(false);
      });
    } else {
      request.PUT(`hospital/process/eventDetailsProviders/${id}`, newData, (resp) => {
        setLoading(false);
        setOpen(false);
        fnGetProviders();
      }, (err) => {
        setLoading(false);
      });
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <SearchSelect
              name="providerId"
              label="select.providerId"
              inputValue={providerId}
              options={providerOptions}
              onChange={fnSelectProvider}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField
              label="table.column.qty"
              name="quantity"
              value={quantity}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <InputField
              label="table.column.price"
              name="price"
              value={price}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12}>
            <InputField
              label="input.subtotal"
              name="subtotal"
              value={subtotal}
              disabled
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <ContainerWithLabel label="input.discount">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.percent"
                    name="discPercent"
                    value={discPercent}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.discount"
                    name="discount"
                    value={discount}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <ContainerWithLabel label="input.tax">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.percent"
                    name="taxPercent"
                    value={taxPercent}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.tax"
                    name="taxValue"
                    value={taxValue}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <ContainerWithLabel label="input.hospValue">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.percent"
                    name="hospPercent"
                    value={hospPercent}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.hospValue"
                    name="hospValue"
                    value={hospValue}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <ContainerWithLabel label="input.provValue">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.percent"
                    name="provPercent"
                    value={provPercent}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    label="input.provValue"
                    name="provValue"
                    value={provValue}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12}>
            <h5 className="text-end">{`${IntlMessages("table.column.total")}: ${formatNumber(total, '', 2)}`}</h5>
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
