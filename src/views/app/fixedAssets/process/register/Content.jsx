import React from 'react';
import { Row, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import { useRegister } from './useRegister';
import { SimpleSelect } from '@/components/simpleSelect';
import DateCalendar from '@/components/dateCalendar';
import { InputField } from '@/components/inputFields';
import { IntlMessages } from '@/helpers/Utils';

const Content = (props) => {

  const { setLoading } = props;
  const { propsToControlPanel, formState, onInputChange, formValidation, sendForm, lists, openSearch, setOpenSearch } = useRegister({ setLoading })

  const { companyId, areaId, typeId, statusId, dateBuy, dateIn, valueBuy, valueIn, name, trademark, model, serialNumber1, serialNumber2, nameProv, invoiceNumber, description, notes, status } = formState;
  const { companyList, areaList, typeList, statusList } = lists;

  const { companyIdValid, areaIdValid, typeIdValid, statusIdValid, dateBuyValid, dateInValid, valueInValid, valueBuyValid, nameValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xs={12}>
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <hr />
              <Row>
                <Colxx xxs={12} md={9}>
                  <Row>
                    <Colxx xxs={12}>
                      <SimpleSelect
                        name="companyId"
                        label="pages.select.companyId"
                        value={companyId}
                        onChange={onInputChange}
                        options={companyList}
                        invalid={sendForm && !!companyIdValid}
                        feedbackText={sendForm && (companyIdValid || null)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} md={6}>
                      <SimpleSelect
                        name="areaId"
                        label="pages.select.areaId"
                        value={areaId}
                        onChange={onInputChange}
                        options={areaList}
                        invalid={sendForm && !!areaIdValid}
                        feedbackText={sendForm && (areaIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6}>
                      <SimpleSelect
                        name="typeId"
                        label="select.typeId"
                        value={typeId}
                        onChange={onInputChange}
                        options={typeList}
                        invalid={sendForm && !!typeIdValid}
                        feedbackText={sendForm && (typeIdValid || null)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12}>
                      <InputField
                        name="name"
                        label="input.name"
                        value={name}
                        onChange={onInputChange}
                        invalid={sendForm && !!nameValid}
                        feedbackText={sendForm && (nameValid || null)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} md={6}>
                      <InputField
                        name="trademark"
                        label="pages.fixedAssets.input.trademark"
                        value={trademark}
                        onChange={onInputChange}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6}>
                      <InputField
                        name="model"
                        label="pages.fixedAssets.input.model"
                        value={model}
                        onChange={onInputChange}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12} md={6}>
                      <InputField
                        name="serialNumber1"
                        label="pages.fixedAssets.input.serial"
                        value={serialNumber1}
                        onChange={onInputChange}
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6}>
                      <InputField
                        name="serialNumber2"
                        label="pages.fixedAssets.input.serial"
                        value={serialNumber2}
                        onChange={onInputChange}
                      />
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs={12} md={3}>
                  <Row>
                    <Colxx xxs={12}>
                      <SimpleSelect
                        name="statusId"
                        label="select.status"
                        value={statusId}
                        onChange={onInputChange}
                        options={statusList}
                        invalid={sendForm && !!statusIdValid}
                        feedbackText={sendForm && (statusIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12}>
                      <DateCalendar
                        name="dateBuy"
                        label="pages.fixedAssets.input.dateBuy"
                        value={dateBuy}
                        onChange={onInputChange}
                        invalid={sendForm && !!dateBuyValid}
                        feedbackText={sendForm && (dateBuyValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12}>
                      <DateCalendar
                        name="dateIn"
                        label="pages.fixedAssets.input.dateIn"
                        value={dateIn}
                        onChange={onInputChange}
                        invalid={sendForm && !!dateInValid}
                        feedbackText={sendForm && (dateInValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12}>
                      <InputField
                        name="valueBuy"
                        label="pages.fixedAssets.input.valueBuy"
                        value={valueBuy}
                        onChange={onInputChange}
                        type="number"
                        invalid={sendForm && !!valueBuyValid}
                        feedbackText={sendForm && (valueBuyValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs={12}>
                      <InputField
                        name="valueIn"
                        label="pages.fixedAssets.input.valueIn"
                        value={valueIn}
                        onChange={onInputChange}
                        type="number"
                        invalid={sendForm && !!valueInValid}
                        feedbackText={sendForm && (valueInValid || null)}
                      />
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
              <Row>
                <Colxx xx={12} md={8}>
                  <InputField
                    name="nameProv"
                    label="pages.fixedAssets.input.providerName"
                    value={nameProv}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xx={12} md={4}>
                  <InputField
                    name="inviceNumber"
                    label="pages.fixedAssets.input.invoiceNumber"
                    value={invoiceNumber}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={6}>
                  <InputField
                    name="description"
                    label="pages.fixedAssets.input.description"
                    value={description}
                    onChange={onInputChange}
                    type="textarea"
                  />
                </Colxx>
                <Colxx xxs={6}>
                  <InputField
                    name="notes"
                    label="pages.fixedAssets.input.notes"
                    value={notes}
                    onChange={onInputChange}
                    type="textarea"
                  />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h4> {IntlMessages("pages.fixedAssets.editionDetails")} </h4>
            </CardHeader>
            <CardBody>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </Table>

            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default Content;