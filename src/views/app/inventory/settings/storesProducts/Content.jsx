import { Card, CardBody, Button, Row, Form } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';
import { Checkbox } from '@Components/checkbox';
import Modal from "@Components/modal";
import ReactTable from "@Components/reactTable";
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalAddLocations from './ModalAddLocations';
import ModalAddxLotes from './ModalAddxLotes';
import ModalSearchProduct from './ModalSearchProduct';
import { useStoresProducts } from './useStoresProducts';

const StoresProducts = (props) => {
  const { setLoading } = props;

  const {formState, errors, isEditing, sendForm, table, propsToMsgDelete, listLocations, listProducts, listWarehouse, openModalAddLocations, openModalAddxLotes, openModalSearchProduct, setListLocations, setOpenModalAddLocation, setOpenModalAddxLotes, setOpenModalSearchProduct, fnOpenSearchProduct, fnSelectProduct, onInputChange, onProductSearch, fnClearInputs, fnGetData, fnSave, fnRefreshStock} = useStoresProducts({setLoading});

  const { locationId, stock, qtyMin, qtyMax, storeId, productCode, status } = formState;

  const showError = (field) => (sendForm && errors[field]) || null;

  const propsToModalAddLocations = {
    ModalContent: ModalAddLocations,
    title: "page.storesProducts.modal.location",
    open: openModalAddLocations,
    setOpen: setOpenModalAddLocation,
    maxWidth: 'sm',
    data: {
      setLoading,
      setListLocations
    }
  }

  const propsToModalAddxLotes = {
    ModalContent: ModalAddxLotes,
    title: "page.storesProducts.modal.addxLotes",
    open: openModalAddxLotes,
    setOpen: setOpenModalAddxLotes,
    maxWidth: 'md',
    data: {
      setLoading,
      listWarehouse,
      onDone: fnGetData
    }
  }

  const propsToModalSearchProduct = {
    ModalContent: ModalSearchProduct,
    title: "page.storesProducts.modal.searchProduct",
    open: openModalSearchProduct,
    setOpen: setOpenModalSearchProduct,
    maxWidth: 'lg',
    data: { fnSelectItem: fnSelectProduct }
  }

  // F1 en el campo de producto abre la búsqueda (como el legacy) y evita la ayuda del navegador.
  const onProductKeyDown = (event) => {
    if (event.key === 'F1') {
      event.preventDefault();
      fnOpenSearchProduct();
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" md="6" lg="5" xl="4">
                    <SearchSelect
                      name="storeId"
                      inputValue={storeId}
                      onChange={onInputChange}
                      options={listWarehouse}
                      isDisabled={isEditing}
                      label="page.storesProducts.select.warehouse"
                      invalid={sendForm && !!errors.storeId}
                      feedbackText={showError('storeId')}
                    />
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="7" xl="5" onKeyDown={onProductKeyDown}>
                    <SearchSelect
                      name="productCode"
                      inputValue={productCode}
                      onChange={onInputChange}
                      onInputChange={onProductSearch}
                      filterOption={null}
                      options={listProducts}
                      isDisabled={isEditing}
                      label="page.storesProducts.select.product"
                      invalid={sendForm && !!errors.productCode}
                      feedbackText={showError('productCode')}
                    />
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="3" xl="3">
                    <SimpleSelect
                      name="locationId"
                      onChange={onInputChange}
                      value={locationId}
                      label="page.storesProducts.select.location"
                      options={listLocations}
                      invalid={sendForm && !!errors.locationId}
                      feedbackText={showError('locationId')}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="4" md="3">
                    <InputField
                      value={stock}
                      name="stock"
                      onChange={onInputChange}
                      type="text"
                      disabled
                      label="page.storesProducts.input.currentExistence"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="4" md="3">
                    <InputField
                      value={qtyMin}
                      name="qtyMin"
                      onChange={onInputChange}
                      type="text"
                      maxLength={15}
                      invalid={sendForm && !!errors.qtyMin}
                      feedbackText={showError('qtyMin')}
                      label="page.storesProducts.input.qtyMin"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="4" md="3">
                    <InputField
                      value={qtyMax}
                      name="qtyMax"
                      onChange={onInputChange}
                      type="text"
                      maxLength={15}
                      invalid={sendForm && !!errors.qtyMax}
                      feedbackText={showError('qtyMax')}
                      label="page.storesProducts.input.qtyMax"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" xl="3">
                    <Checkbox
                      onChange={onInputChange}
                      name="status"
                      value={status}
                      label="page.storesProducts.check.status"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" sm={6}>
                    <Button style={{ marginRight: '5px' }} color="primary" onClick={() => setOpenModalAddLocation(true)}><i className="bi bi-compass" /> {IntlMessages("button.locations")}</Button>
                    <Button style={{ marginRight: '5px' }} color="success" onClick={fnOpenSearchProduct} disabled={isEditing} title="F1"><i className="bi bi-search" /> {IntlMessages("button.search")}</Button>
                    <Button style={{ marginRight: '5px' }} color="info" onClick={() => setOpenModalAddxLotes(true)}><i className="bi bi-card-checklist" /> {IntlMessages("button.lots")}</Button>
                    <Button color="secondary" onClick={fnRefreshStock}><i className="bi bi-arrow-clockwise" /> {IntlMessages("button.refreshStock")}</Button>
                  </Colxx>
                  <Colxx xxs="12" sm={6} className="div-action-button-container">
                    <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                    <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                  </Colxx>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToModalAddLocations} />
      <Modal {...propsToModalAddxLotes} />
      <Modal {...propsToModalSearchProduct} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default StoresProducts;