import { Row, Card, CardBody, CardHeader, Table, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import { SimpleSelect } from '@Components/simpleSelect';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useRegister } from './useRegister';
import { ModalViewRegister } from './ModalViewRegister';
import { ModalChangeLine } from './ModalChangeLine';
import { ModalDepreciation } from './ModalDepreciation';

const ACTIVE_OPTIONS = [{ value: 1, label: 'page.fixedAssets.select.active' }, { value: 2, label: 'page.fixedAssets.select.inactive' }];

const Content = ({ setLoading }) => {
  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, typeList, conditionOptions, formValidationIndex,
    sendForm, lines, fnGenerateCode, fnOpenAddChange, fnOpenEditChange, openModalChange, setOpenModalChange,
    editingLine, fnSaveChangeLine, openModalView, setOpenModalView, dataList, fnViewRegister,
    openModalDepreciation, setOpenModalDepreciation, assetId
  } = useRegister({ setLoading });

  const {
    typeId, code, name, condition, trademark, model, serial1, serial2, dateBuy, dateIn, providerName,
    invoiceNumber, valueBuy, valueIn, description, notes, isActive
  } = formStateIndex;

  const { typeIdValid, conditionValid, codeValid, nameValid, dateInValid } = formValidationIndex;

  const propsToModalView = {
    ModalContent: ModalViewRegister,
    title: 'page.fixedAssets.modal.title.search',
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewRegister }
  }

  const propsToModalChange = {
    ModalContent: ModalChangeLine,
    title: 'page.fixedAssets.modal.title.change',
    open: openModalChange,
    setOpen: setOpenModalChange,
    maxWidth: 'md',
    data: { editingLine, fnSaveChangeLine }
  }

  const propsToModalDepreciation = {
    ModalContent: ModalDepreciation,
    title: 'page.fixedAssets.modal.title.depreciation',
    open: openModalDepreciation,
    setOpen: setOpenModalDepreciation,
    maxWidth: 'xl',
    data: { assetId, setLoading }
  }

  return (
    <>
      <Row>
        <Colxx xs={12}>
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <hr />
              <Row>
                <Colxx xxs={12} md={4}>
                  <SimpleSelect
                    name="typeId"
                    label="page.fixedAssets.select.type"
                    value={typeId}
                    onChange={onInputChangeIndex}
                    options={typeList}
                    getOptionValue={(o) => o.value}
                    getOptionLabel={(o) => o.label}
                    invalid={sendForm && !!typeIdValid}
                    feedbackText={sendForm && (typeIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs={12} md={4}>
                  <Row>
                    <Colxx xxs={8}>
                      <InputField name="code" label="page.fixedAssets.input.code" value={code} disabled
                        invalid={sendForm && !!codeValid} feedbackText={sendForm && (codeValid || null)} />
                    </Colxx>
                    <Colxx xxs={4} className="d-flex align-items-end">
                      <Button color="primary" size="sm" className="mb-3" onClick={fnGenerateCode}>
                        <i className="bi bi-magic" />
                      </Button>
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs={12} md={4}>
                  <SimpleSelect
                    name="isActive"
                    label="page.fixedAssets.select.isActive"
                    value={isActive}
                    onChange={onInputChangeIndex}
                    options={ACTIVE_OPTIONS}
                    getOptionValue={(o) => o.value}
                    getOptionLabel={(o) => IntlMessages(o.label)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12}>
                  <InputField
                    name="name"
                    label="input.name"
                    value={name}
                    onChange={onInputChangeIndex}
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12} md={3}>
                  <SimpleSelect
                    name="condition"
                    label="page.fixedAssets.select.condition"
                    value={condition}
                    onChange={onInputChangeIndex}
                    options={conditionOptions}
                    getOptionValue={(o) => o.value}
                    getOptionLabel={(o) => o.label}
                    invalid={sendForm && !!conditionValid}
                    feedbackText={sendForm && (conditionValid || null)}
                  />
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <InputField name="trademark" label="page.fixedAssets.input.trademark" value={trademark} onChange={onInputChangeIndex} />
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <InputField name="model" label="page.fixedAssets.input.model" value={model} onChange={onInputChangeIndex} />
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <InputField name="serial1" label="page.fixedAssets.input.serial1" value={serial1} onChange={onInputChangeIndex} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12} md={3}>
                  <InputField name="serial2" label="page.fixedAssets.input.serial2" value={serial2} onChange={onInputChangeIndex} />
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <DateCalendar name="dateBuy" label="page.fixedAssets.input.dateBuy" value={dateBuy} onChange={onInputChangeIndex} />
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <DateCalendar name="dateIn" label="page.fixedAssets.input.dateIn" value={dateIn} onChange={onInputChangeIndex}
                    invalid={sendForm && !!dateInValid} feedbackText={sendForm && (dateInValid || null)} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12} md={6}>
                  <InputField name="providerName" label="page.fixedAssets.input.providerName" value={providerName} onChange={onInputChangeIndex} />
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <InputField name="invoiceNumber" label="page.fixedAssets.input.invoiceNumber" value={invoiceNumber} onChange={onInputChangeIndex} />
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <InputField name="valueBuy" label="page.fixedAssets.input.valueBuy" type="text" value={valueBuy} onChange={onInputChangeIndex} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12} md={3} className="ms-auto">
                  <InputField name="valueIn" label="page.fixedAssets.input.valueIn" type="text" value={valueIn} onChange={onInputChangeIndex} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={6}>
                  <InputField name="description" label="page.fixedAssets.input.description" value={description} onChange={onInputChangeIndex} type="textarea" />
                </Colxx>
                <Colxx xxs={6}>
                  <InputField name="notes" label="page.fixedAssets.input.notes" value={notes} onChange={onInputChangeIndex} type="textarea" />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{IntlMessages('page.fixedAssets.title.changesHistory')}</h4>
              <Button color="primary" size="sm" onClick={fnOpenAddChange} disabled={!assetId}>
                <i className="bi bi-plus" /> {IntlMessages('button.add')}
              </Button>
            </CardHeader>
            <CardBody>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>{IntlMessages('table.column.date')}</th>
                    <th>{IntlMessages('page.variousDeposits.input.description')}</th>
                    <th align="right">{IntlMessages('table.column.value')}</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} style={line.isEdit ? { cursor: 'pointer' } : undefined} onClick={() => fnOpenEditChange(line)}>
                      <td>{DateHelper.format(line.date)}</td>
                      <td>{line.description}</td>
                      <td align="right">{formatNumber(line.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalView} />
      <Modal {...propsToModalChange} />
      <Modal {...propsToModalDepreciation} />
    </>
  );
}
export default Content;
