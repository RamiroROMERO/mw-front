import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useModalEditService } from './useModalEditService';
import ModalAddEditProvider from './ModalAddEditProvider';

const ModalEditService = ({ data, setOpen }) => {
  const { currentItem, setLoading } = data;

  const { table, openModalProvider, setOpenModalProvider, currentProviderItem, propsToMsgDelete, fnGetProviders } = useModalEditService({ setLoading, currentItem });

  const propsToModalAddEditProvider = {
    ModalContent: ModalAddEditProvider,
    title: "page.events.modalAddEditProvider.title",
    open: openModalProvider,
    setOpen: setOpenModalProvider,
    maxWidth: 'md',
    data: {
      currentItem: currentProviderItem,
      setLoading,
      fnGetProviders
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="table.column.description">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    name="description"
                    label="table.column.description"
                    value={currentItem?.invProduct?.name || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={3}>
                  <InputField
                    name="quantity"
                    label="table.column.qty"
                    value={currentItem?.quantity || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={6} sm={3}>
                  <InputField
                    name="total"
                    label="table.column.total"
                    value={currentItem?.total || ''}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs={12}>
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalAddEditProvider} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ModalEditService
