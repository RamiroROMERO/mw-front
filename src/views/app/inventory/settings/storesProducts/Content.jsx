import { Card, CardBody, Button, Row, Form } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { SimpleSelect } from '@/components/simpleSelect';
import { Checkbox } from '@/components/checkbox';
import Modal from "@/components/modal";
import ReactTable from "@/components/reactTable";
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import Confirmation from '@/containers/ui/confirmationMsg';
import ModalAddLocations from './ModalAddLocations';
import ModalAddxLotes from './ModalAddxLotes';
import { useStoresProducts } from './useStoresProducts';

const StoresProducts = (props) => {
  const { setLoading } = props;

  const {formState, formValidation, sendForm, table, propsToMsgDelete, listLocations, listProducts, listWarehouse, openModalAddLocations, openModalAddxLotes, setListLocations, setOpenModalAddLocation, setOpenModalAddxLotes, onInputChange, fnClearInputs, fnSave} = useStoresProducts({setLoading});

  const { location, currentExistence, qtyMin, qtyMax, storeId, productId, status } = formState;

  const { storeIdValid, productIdValid, locationValid } = formValidation;

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
                      label="page.storesProducts.select.warehouse"
                      invalid={sendForm && !!storeIdValid}
                      feedbackText={sendForm && (storeIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="7" xl="5">
                    <SearchSelect
                      name="productId"
                      inputValue={productId}
                      onChange={onInputChange}
                      options={listProducts}
                      label="page.storesProducts.select.product"
                      invalid={sendForm && !!productIdValid}
                      feedbackText={sendForm && (productIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" md="6" lg="3" xl="3">
                    <SimpleSelect
                      name="location"
                      onChange={onInputChange}
                      value={location}
                      label="page.storesProducts.select.location"
                      options={listLocations}
                      invalid={sendForm && !!locationValid}
                      feedbackText={sendForm && (locationValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="4" md="3">
                    <InputField
                      value={currentExistence}
                      name="currentExistence"
                      onChange={onInputChange}
                      type="text"
                      label="page.storesProducts.input.currentExistence"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="4" md="3">
                    <InputField
                      value={qtyMin}
                      name="qtyMin"
                      onChange={onInputChange}
                      type="text"
                      label="page.storesProducts.input.qtyMin"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="4" md="3">
                    <InputField
                      value={qtyMax}
                      name="qtyMax"
                      onChange={onInputChange}
                      type="text"
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
                    <Button color="info" onClick={() => setOpenModalAddxLotes(true)}><i className="bi bi-card-checklist" /> {IntlMessages("button.lots")}</Button>
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
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default StoresProducts;