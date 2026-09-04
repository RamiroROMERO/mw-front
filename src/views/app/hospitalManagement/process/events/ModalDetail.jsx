import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { formatNumber, IntlMessages, validFloat } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useModalDetail } from './useModalDetail';
import ModalAddProduct from './ModalAddProduct';
import ModalEditProduct from './ModalEditProduct';
import ModalEditService from './ModalEditService';

const ModalDetail = ({data, setOpen}) => {
  const {currentItem, setLoading, listAreas, listStores} = data;

  const {
    table, fnAddProduct, fnAddService, fnPrintDocument, openModalAddProduct, setOpenModalAddProduct,
    openModalAddService, setOpenModalAddService, openModalEditProduct, setOpenModalEditProduct,
    openModalEditService, setOpenModalEditService,
    currentDetailItem, fnSaveEditProduct, propsToMsgDelete, fnGetDataDetail
  } = useModalDetail({setLoading, currentItem});

  const totalGeneral = table.data.reduce((sum, item) => sum + validFloat(item.total), 0);

  const propsToModalAddProduct = {
    ModalContent: ModalAddProduct,
    title: "page.events.modalAddProduct.title",
    open: openModalAddProduct,
    setOpen: setOpenModalAddProduct,
    maxWidth: 'lg',
    data: {
      setLoading,
      listAreas,
      listStores,
      currentItem,
      fnGetDataDetail,
      type: 1
    }
  }

  const propsToModalAddService = {
    ModalContent: ModalAddProduct,
    title: "page.events.modalAddService.title",
    open: openModalAddService,
    setOpen: setOpenModalAddService,
    maxWidth: 'lg',
    data: {
      setLoading,
      listAreas,
      listStores,
      currentItem,
      fnGetDataDetail,
      type: 2
    }
  }

  const propsToModalEditProduct = {
    ModalContent: ModalEditProduct,
    title: "page.events.modalEditProduct.title",
    open: openModalEditProduct,
    setOpen: setOpenModalEditProduct,
    maxWidth: 'sm',
    data: {
      currentItem: currentDetailItem,
      fnSave: fnSaveEditProduct
    }
  }

  const propsToModalEditService = {
    ModalContent: ModalEditService,
    title: "page.events.modalEditService.title",
    open: openModalEditService,
    setOpen: setOpenModalEditService,
    maxWidth: 'lg',
    data: {
      currentItem: currentDetailItem,
      setLoading
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="label.title.patient">
              <Row>
                <Colxx xxs={12} xs={5} md={4} xl={2}>
                  <InputField
                    name="codeFilePhysic"
                    label="input.codePhysic"
                    value={currentItem?.hospExpedient?.code || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} xs={7} md={8} xl={3}>
                  <InputField
                    name="dni"
                    label="input.dni"
                    value={currentItem?.hospExpedient?.dni || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} xs={12} md={8} xl={5}>
                  <InputField
                    name="namePatient"
                    label="input.name"
                    value={currentItem?.hospExpedient?.name || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} xs={5} md={4} xl={2}>
                  <InputField
                    name="id"
                    label="input.noEvent"
                    value={currentItem?.id || 0}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row className="mb-3">
          <Colxx xxs={12} className="div-action-button-container">
            <Button color="primary" onClick={fnAddProduct}>
              <i className="bi bi-bag-plus"/> {IntlMessages("button.addProduct")}
            </Button>
            <Button color="info" onClick={fnAddService}>
              <i className="bi bi-clipboard-plus"/> {IntlMessages("button.addService")}
            </Button>
            <Button color="secondary" onClick={fnPrintDocument}>
              <i className="iconsminds-printer"/> {IntlMessages("button.print")}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ReactTable {...table}/>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <h5 className="text-end">{`${IntlMessages("table.column.total")}: ${formatNumber(totalGeneral, '', 2)}`}</h5>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>{`${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalAddProduct}/>
      <Modal {...propsToModalAddService}/>
      <Modal {...propsToModalEditProduct}/>
      <Modal {...propsToModalEditService}/>
      <Confirmation {...propsToMsgDelete}/>
    </>
  )
}

export default ModalDetail