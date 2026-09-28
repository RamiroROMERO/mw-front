import { Row, Card, CardBody, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import { useAssign } from './useAssign';
import { ModalSelectAsset } from './ModalSelectAsset';
import { ModalViewAssign } from './ModalViewAssign';
import { ModalFinishAssign } from './ModalFinishAssign';

const Content = ({ setLoading }) => {
  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, responsibleList, areaList, formValidationIndex,
    sendForm, isLocked, fnOpenAssetPicker, openModalAsset, setOpenModalAsset, assetList, fnSelectAsset,
    openModalView, setOpenModalView, dataList, fnViewAssign, openModalFinish, setOpenModalFinish,
    fnFinishAssign, propsToMsgDelete
  } = useAssign({ setLoading });

  const {
    date, assetCode, assetName, trademark, model, serial1, assetValue, responsibleId, areaId, others, notes,
    dateEnd, notesEnd
  } = formStateIndex;

  const { dateValid, assetIdValid, assetValueValid, responsibleIdValid, areaIdValid } = formValidationIndex;

  const propsToModalAsset = {
    ModalContent: ModalSelectAsset,
    title: 'page.fixedAssets.modal.title.selectAsset',
    open: openModalAsset,
    setOpen: setOpenModalAsset,
    maxWidth: 'lg',
    data: { assetList, fnSelectAsset }
  }

  const propsToModalView = {
    ModalContent: ModalViewAssign,
    title: 'page.fixedAssets.modal.title.search',
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewAssign }
  }

  const propsToModalFinish = {
    ModalContent: ModalFinishAssign,
    title: 'page.fixedAssets.modal.title.finish',
    open: openModalFinish,
    setOpen: setOpenModalFinish,
    maxWidth: 'md',
    data: { fnFinishAssign }
  }

  return (
    <>
      <Row>
        <Colxx xs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <hr />
              <Row>
                <Colxx xxs="12" md="3">
                  <DateCalendar name="date" label="select.date" value={date} onChange={onInputChangeIndex}
                    invalid={sendForm && !!dateValid} feedbackText={sendForm && (dateValid || null)} disabled={isLocked} />
                </Colxx>
                <Colxx xxs="12" md="7">
                  <InputField name="assetName" label="page.fixedAssets.title.asset" value={assetName} disabled
                    invalid={sendForm && !!assetIdValid} feedbackText={sendForm && (assetIdValid || null)} />
                </Colxx>
                <Colxx xxs="12" md="2" className="d-flex align-items-end">
                  <Button color="primary" size="sm" className="mb-3" onClick={fnOpenAssetPicker} disabled={isLocked}>
                    <i className="bi bi-search" /> {IntlMessages('button.search')}
                  </Button>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" md="3">
                  <InputField name="assetCode" label="page.fixedAssets.input.code" value={assetCode} disabled />
                </Colxx>
                <Colxx xxs="12" md="3">
                  <InputField name="trademark" label="page.fixedAssets.input.trademark" value={trademark} disabled />
                </Colxx>
                <Colxx xxs="12" md="3">
                  <InputField name="model" label="page.fixedAssets.input.model" value={model} disabled />
                </Colxx>
                <Colxx xxs="12" md="3">
                  <InputField name="serial1" label="page.fixedAssets.input.serial1" value={serial1} disabled />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" md="4">
                  <InputField name="assetValue" label="page.fixedAssets.title.valueAtAssign" type="text" value={assetValue}
                    onChange={onInputChangeIndex} invalid={sendForm && !!assetValueValid} feedbackText={sendForm && (assetValueValid || null)} disabled={isLocked} />
                </Colxx>
                <Colxx xxs="12" md="4">
                  <SearchSelect name="responsibleId" label="page.fixedAssets.select.responsible" inputValue={responsibleId}
                    onChange={onInputChangeIndex} options={responsibleList} isDisabled={isLocked}
                    invalid={sendForm && !!responsibleIdValid} feedbackText={sendForm && (responsibleIdValid || null)} />
                </Colxx>
                <Colxx xxs="12" md="4">
                  <SearchSelect name="areaId" label="page.fixedAssets.select.area" inputValue={areaId}
                    onChange={onInputChangeIndex} options={areaList} isDisabled={isLocked}
                    invalid={sendForm && !!areaIdValid} feedbackText={sendForm && (areaIdValid || null)} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" md="6">
                  <InputField name="others" label="page.fixedAssets.input.othersAdded" type="textarea" value={others} onChange={onInputChangeIndex} disabled={isLocked} />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField name="notes" label="page.fixedAssets.input.notes" type="textarea" value={notes} onChange={onInputChangeIndex} disabled={isLocked} />
                </Colxx>
              </Row>
              {dateEnd && (
                <Row className="mt-2">
                  <Colxx xxs="12" md="3">
                    <InputField name="dateEnd" label="page.fixedAssets.input.dateEnd" value={dateEnd} disabled />
                  </Colxx>
                  <Colxx xxs="12" md="9">
                    <InputField name="notesEnd" label="page.fixedAssets.input.notesEnd" type="textarea" value={notesEnd} disabled />
                  </Colxx>
                </Row>
              )}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAsset} />
      <Modal {...propsToModalView} />
      <Modal {...propsToModalFinish} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Content;
