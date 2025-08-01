import { Checkbox } from '@Components/checkbox'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import { RadioGroup } from '@Components/radioGroup'
import { SimpleSelect } from '@Components/simpleSelect'
import { IntlMessages } from '@Helpers/Utils'
import { Button, Card, CardBody, Row } from 'reactstrap'

const Detail = ({formState, listComp, listTaxDoc, onInputChange, formValidation, fnSave, fnClearInputs, sendForm}) => {

  const { code, name, type, title, codeInt, useTaxDocument, companyId, taxDocumentId, isReportBank, useBill, useAcc, useFixass, useInv, useTax, useBank, bankCheck, bankTransfer, bankDepo, bankNcd, bankExpense, status, notes1, notes2 } = formState;

  const { codeValid, nameValid, titleValid, companyIdValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12" sm="6" lg="3">
            <InputField
              value={code}
              name="code"
              onChange={onInputChange}
              type="text"
              label="page.itemsCodes.input.code"
              invalid={sendForm && !!codeValid}
              feedbackText={sendForm && (codeValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="5">
            <InputField
              value={name}
              name="name"
              onChange={onInputChange}
              type="text"
              label="page.itemsCodes.input.name"
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="4">
            <InputField
              value={title}
              name="title"
              onChange={onInputChange}
              type="text"
              label="page.itemsCodes.input.title"
              invalid={sendForm && !!titleValid}
              feedbackText={sendForm && (titleValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="3">
            <InputField
              value={codeInt}
              name="codeInt"
              onChange={onInputChange}
              type="text"
              label="page.itemsCodes.input.correlative"
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="5">
            <SimpleSelect
              value={companyId}
              name="companyId"
              onChange={onInputChange}
              label="page.itemsCodes.select.companyId"
              options={listComp}
              invalid={sendForm && !!companyIdValid}
              feedbackText={sendForm && (companyIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="4">
            <SimpleSelect
              value={taxDocumentId}
              name="taxDocumentId"
              onChange={onInputChange}
              label="page.itemsCodes.select.taxDocumentId"
              options={listTaxDoc}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.itemsCodes.title.areasofUse">
              <Row>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="useBill"
                    value={useBill}
                    label="page.itemsCodes.check.billing"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="useAcc"
                    value={useAcc}
                    label="page.itemsCodes.check.accounting"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="useFixass"
                    value={useFixass}
                    label="page.itemsCodes.check.fixedAssets"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="useInv"
                    value={useInv}
                    label="page.itemsCodes.check.inventories"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="useTax"
                    value={useTax}
                    label="page.itemsCodes.check.taxes"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="useBank"
                    value={useBank}
                    label="page.itemsCodes.check.banks"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.itemsCodes.title.banks">
              <Row>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="bankCheck"
                    value={bankCheck}
                    label="page.itemsCodes.check.checks"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="bankTransfer"
                    value={bankTransfer}
                    label="page.itemsCodes.check.transfers"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="2">
                  <Checkbox
                    onChange={onInputChange}
                    name="bankDepo"
                    value={bankDepo}
                    label="page.itemsCodes.check.deposits"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="3">
                  <Checkbox
                    onChange={onInputChange}
                    name="bankNcd"
                    value={bankNcd}
                    label="page.itemsCodes.check.debitNotes"
                  />
                </Colxx>
                <Colxx xxs="6" xs="6" sm="4" lg="4" xl="3">
                  <Checkbox
                    onChange={onInputChange}
                    name="bankExpense"
                    value={bankExpense}
                    label="page.itemsCodes.check.expenses"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="5" sm="3">
            <RadioGroup
              label="page.itemsCodes.title.type"
              name="type"
              value={type}
              onChange={onInputChange}
              options={
                [
                  { id: 1, label: "page.ItemsCodes.radio.type.must" },
                  { id: 2, label: "page.ItemsCodes.radio.type.have" }
                ]
              }
            />
          </Colxx>
          <Colxx xxs="12" xs="7" sm="9">
            <Row>
              <Colxx xxs="12" sm="6" lg="4">
                <Checkbox
                  onChange={onInputChange}
                  name="useTaxDocument"
                  value={useTaxDocument}
                  label="page.itemsCodes.check.useTaxDocument"
                />
              </Colxx>
              <Colxx xxs="12" sm="6" lg="5">
                <Checkbox
                  onChange={onInputChange}
                  name="isReportBank"
                  value={isReportBank}
                  label="page.itemsCodes.check.reconciliationBank"
                />
              </Colxx>
              <Colxx xxs="12" sm="6" lg="3">
                <Checkbox
                  onChange={onInputChange}
                  name="status"
                  value={status}
                  label="check.status"
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={notes1}
              name="notes1"
              onChange={onInputChange}
              type="text"
              label="page.itemsCodes.input.notes"
            />
          </Colxx>
          <Colxx xxs="12" className="div-content-right">
            <InputField
              value={notes2}
              name="notes2"
              onChange={onInputChange}
              type="text"
              label="page.itemsCodes.input.notes"
            />
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
            <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail