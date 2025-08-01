import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Card, CardBody } from "reactstrap";

import { ContainerWithLabel } from '@/components/containerWithLabel';
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";
import { useForm } from "@/hooks";
import { InputField } from "@/components/inputFields";
import DateCalendar from '@/components/dateCalendar';


const ModalChecksPayroll = (props) => {
  const { data, setOpen } = props;
  const [sendForm, setSendForm] = useState(false);

  const checksPayrollValid = {
    since: [(val) => val !== "", "msg.required.select.dateStart"],
    until: [(val) => val !== "", "msg.required.select.dateEnd"]
  }

  const { formState, setBulkForm, onInputChange, onResetForm, formValidation, isFormValid, } = useForm({
    id: 0,
    since: '',
    until: '',
    date: '',
    concept: '',
    solicitedBy: '',
    totalRequest: 0,
    totalPayment: 0
  }, checksPayrollValid);

  const { id, since, until, date, concept, solicitedBy, totalRequest, totalPayment } = formState;
  const { sinceValid, untilValid } = formValidation;


  const fnGenerateDetail = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
  }
  const fnPrintDetail = () => { }

  const [table, setTable] = useState({
    title: "",
    columns: [
      { text: IntlMessages("table.column.beneficiary"), dataField: "idBeneficiary", headerStyle: { 'width': "15%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.thursday"), dataField: "thursday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.friday"), dataField: "friday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.saturday"), dataField: "saturday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.sunday"), dataField: "sunday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.monday"), dataField: "monday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.tuesday"), dataField: "tuesday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.wednesday"), dataField: "wednesday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.checkrequest.modal.checksPayroll.table.seventhDay"), dataField: "seventhday", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { 'width': "15%" } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { "width": "15%" }, align: "right" }
    ],
    data: [],
    actions: []
  });

  const fnSaveCheckPayroll = () => {
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xss="12">
            <Card>
              <CardBody>
                <Row >
                  <Colxx xxs="12" md="9">
                    <Row>
                      <Colxx xxs="12" xs="4" md="4" lg="3">
                        <DateCalendar
                          name="since"
                          value={since}
                          label="input.since"
                          onChange={onInputChange}
                          invalid={sendForm && !!sinceValid}
                          feedbackText={sendForm && (sinceValid || null)}
                        />
                      </Colxx>
                      <Colxx xxs="12" xs="4" md="4" lg="3">
                        <DateCalendar
                          name="until"
                          value={until}
                          label="input.until"
                          onChange={onInputChange}
                          invalid={sendForm && !!untilValid}
                          feedbackText={sendForm && (untilValid || null)}
                        />
                      </Colxx>
                      <Colxx xss="12" xs="4" md="4" lg="3">
                        <Button color="info" onClick={fnGenerateDetail}>
                          <i className="bi bi-arrow-clockwise" /> {IntlMessages("button.generate")}
                        </Button>
                      </Colxx>
                    </Row>
                  </Colxx>
                </Row>
                <Row className="mt-3">
                  <Colxx xss="12" className="div-action-button-container">
                    <Button color="secondary" onClick={fnGenerateDetail}>
                      <i className="iconsminds-book" />{IntlMessages("button.seventhDay")}
                    </Button>
                    <Button color="warning">
                      <i className="iconsminds-book" />{IntlMessages("button.deduction")}
                    </Button>
                    <Button color="success">
                      <i className="iconsminds-financial" />{IntlMessages("button.degloseEfective")}
                    </Button>
                    <Button color="info" onClick={fnPrintDetail}>
                      <i className="iconsminds-printer" />{IntlMessages("button.print")}
                    </Button>
                  </Colxx>
                </Row>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
        <Row className="mt-4">
          <Colxx xs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xs="12">
            <Card>
              <CardBody>

                <Row>
                  <Colxx xss="12" xs="8">
                    <Row>
                      <Colxx xs="8">
                        <DateCalendar
                          name="date"
                          value={date}
                          label="select.date"
                          onChange={onInputChange}
                        />
                      </Colxx>
                      <Colxx xs="8">
                        <InputField
                          name="concept"
                          value={concept}
                          onChange={onInputChange}
                          label="input.concept"
                          type="text"
                        />
                      </Colxx>
                      <Colxx xs="8">
                        <InputField
                          name="solicitedBy"
                          value={solicitedBy}
                          onChange={onInputChange}
                          label="input.requestorId"
                          type="text"
                        />
                      </Colxx>
                    </Row>
                  </Colxx>
                  <Colxx xss="12" xs="4">
                    <Row>
                      <Colxx xs="12">
                        <InputField
                          name="totalRequest"
                          value={totalRequest}
                          onChange={onInputChange}
                          label="input.totalRequest"
                          type="text"
                          disabled
                        />
                      </Colxx>
                      <Colxx xs="12">
                        <InputField
                          name="totalPayment"
                          value={totalPayment}
                          onChange={onInputChange}
                          label="input.totalPayment"
                          type="text"
                          disabled
                        />
                      </Colxx>
                    </Row>
                  </Colxx>
                </Row>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveCheckPayroll}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalChecksPayroll;