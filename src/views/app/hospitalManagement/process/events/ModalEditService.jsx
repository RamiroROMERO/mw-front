import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import { useModalEditService } from './useModalEditService';
import ModalAddEditProvider from './ModalAddEditProvider';
import { isClosed } from './eventDetailRules';

const ModalEditService = ({ data, setOpen }) => {
  const { currentItem, event, setLoading, fnGetDataDetail } = data;

  const { table, openModalProvider, setOpenModalProvider, currentProviderItem, fnSaveProvider, fnSave } = useModalEditService({ setLoading, currentItem, event, fnGetDataDetail });
  const closed = isClosed(event);

  const propsToModalAddEditProvider = {
    ModalContent: ModalAddEditProvider,
    title: "page.events.modalAddEditProvider.title",
    open: openModalProvider,
    setOpen: setOpenModalProvider,
    maxWidth: 'md',
    data: { currentItem: currentProviderItem, fnSaveProvider }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="table.column.description">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField name="description" label="table.column.description" value={currentItem?.description || ''} disabled />
                </Colxx>
                <Colxx xxs={6} sm={3}>
                  <InputField name="quantity" label="table.column.qty" value={currentItem?.quantity || ''} disabled />
                </Colxx>
                <Colxx xxs={6} sm={3}>
                  <InputField name="total" label="table.column.total" value={currentItem?.total || ''} disabled />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs={12}>
            <ReactTable {...table} actions={closed ? [] : table.actions} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        {!closed && (
          <Button color="primary" onClick={fnSave}>
            <i className="bi bi-floppy" /> {IntlMessages('button.save')}
          </Button>
        )}
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalAddEditProvider} />
    </>
  )
}

export default ModalEditService
