import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { InputField } from '@/components/inputFields';
import ReactTable from '@/components/reactTable';
import Modal from '@/components/modal';
import { useModalDetail } from './useModalDetail';
import ModalAddProduct from './ModalAddProduct';

const ModalDetail = ({data, setOpen}) => {
  const {currentItem, setLoading, listAreas, listStores} = data;

  const {table, fnAddProduct, fnAddService, openModalAddProduct, setOpenModalAddProduct, fnGetDataDetail} = useModalDetail({setLoading, currentItem});

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
      fnGetDataDetail
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
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ReactTable {...table}/>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>{`${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalAddProduct}/>
    </>
  )
}

export default ModalDetail