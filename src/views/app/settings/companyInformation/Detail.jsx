import { Checkbox } from '@Components/checkbox';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import { Button, Card, CardBody, Row } from 'reactstrap';
import DateCalendar from '@Components/dateCalendar';

const Detail = ({formState, onInputChange, formValidation, fnSave, fnClearInputs, sendForm, checkActive, checkChange, onViewInternalOptions, onViewMailOptions}) => {

  const {dni, name, name2, address1, address2, address3, phone, email, webSite, accountantName, managerName, seatAccForSales,seatAccForSalesCost, seatAccForPurchase, seatAccForInventory, seatAccForBanks, seatAccForDebitNotes, seatAccForCreditNotes, hasStoreControl, hasStockControl, hasDateOutControl, hasProductOneManyControl, hasSellerControl, isDefault, lastCloseDate, status, hasDualCurrency } = formState;

  const { dniValid, nameValid, address1Valid, phoneValid, emailValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12" sm="7" lg="5" xl="6">
            <Row>
              <Colxx xxs="12">
                <InputField
                  value={dni}
                  name="dni"
                  onChange={onInputChange}
                  type="text"
                  label="page.companyInformation.input.rtn"
                  invalid={sendForm && !!dniValid}
                  feedbackText={sendForm && (dniValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.companyInformation.input.name">
                  <InputField
                    value={name}
                    label="page.companyInformation.input.name1"
                    name="name"
                    onChange={onInputChange}
                    type="text"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                  <InputField
                    value={name2}
                    label="page.companyInformation.input.name2"
                    name="name2"
                    onChange={onInputChange}
                    type="text"
                  />
                </ContainerWithLabel>
              </Colxx>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.companyInformation.input.address">
                  <InputField
                    value={address1}
                    name="address1"
                    onChange={onInputChange}
                    type="text"
                    // label="page.companyInformation.input.address1"
                    invalid={sendForm && !!address1Valid}
                    feedbackText={sendForm && (address1Valid || null)}
                  />
                  <InputField
                    value={address2}
                    name="address2"
                    onChange={onInputChange}
                    type="text"
                  // label="page.companyInformation.input.address2"
                  />
                  <InputField
                    value={address3}
                    name="address3"
                    onChange={onInputChange}
                    type="text"
                  // label="page.companyInformation.input.address3"
                  />
                </ContainerWithLabel>
              </Colxx>
              <Colxx xxs="12" xl="6">
                <InputField
                  value={phone}
                  name="phone"
                  onChange={onInputChange}
                  type="text"
                  label="page.companyInformation.input.phones"
                  invalid={sendForm && !!phoneValid}
                  feedbackText={sendForm && (phoneValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xl="6">
                <InputField
                  value={email}
                  label="page.companyInformation.input.mail"
                  name="email"
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!emailValid}
                  feedbackText={sendForm && (emailValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xl="6">
                <InputField
                  value={webSite}
                  name="webSite"
                  onChange={onInputChange}
                  type="text"
                  label="page.companyInformation.input.webPage"
                />
              </Colxx>
              <Colxx xss="12" lg="6">
                <DateCalendar
                  name="lastCloseDate"
                  value={lastCloseDate}
                  label="page.companyInformation.input.date"
                  onChange={onInputChange}
                />
              </Colxx>
              <Colxx xxs="12" xl="6">
                <InputField
                  value={managerName}
                  name="managerName"
                  onChange={onInputChange}
                  type="text"
                  label="page.companyInformation.input.manager"
                />
              </Colxx>
              <Colxx xxs="12" xl="6">
                <InputField
                  value={accountantName}
                  name="accountantName"
                  onChange={onInputChange}
                  type="text"
                  label="page.companyInformation.input.counter"
                />
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" sm="5" lg="7" xl="6">
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.companyInformation.title.automaticItems">
                  <Row>
                    <Colxx xxs="12" lg="6">
                      <Checkbox
                        name="seatAccForPurchase"
                        value={seatAccForPurchase}
                        label="page.companyInformation.check.purchases"
                        onChange={onInputChange}
                      />
                    </Colxx>
                    <Colxx xxs="12" lg="6">
                      <Checkbox
                        onChange={onInputChange}
                        name="seatAccForInventory"
                        value={seatAccForInventory}
                        label="page.companyInformation.check.inventoryItems"
                      />
                    </Colxx>
                    <Colxx xxs="12" lg="6">
                      <Checkbox
                        onChange={onInputChange}
                        name="seatAccForSales"
                        value={seatAccForSales}
                        label="page.companyInformation.check.salesItems"
                      />
                    </Colxx>
                    <Colxx xxs="12" lg="6">
                      <Checkbox
                        onChange={onInputChange}
                        name="seatAccForBanks"
                        value={seatAccForBanks}
                        label="page.companyInformation.check.bankItems"
                      />
                    </Colxx>
                    <Colxx xxs="12" lg="6">
                      <Checkbox
                        onChange={onInputChange}
                        name="seatAccForDebitNotes"
                        value={seatAccForDebitNotes}
                        label="page.companyInformation.check.debitNotes"
                      />
                    </Colxx>
                    <Colxx xxs="12" lg="6">
                      <Checkbox
                        onChange={onInputChange}
                        name="seatAccForCreditNotes"
                        value={seatAccForCreditNotes}
                        label="page.companyInformation.check.creditNotes"
                      />
                    </Colxx>
                    <Colxx xxs="12" lg="6">
                      <Checkbox
                        onChange={onInputChange}
                        name="seatAccForSalesCost"
                        value={seatAccForSalesCost}
                        label="page.companyInformation.check.costSales"
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12" lg="6">
                <Checkbox
                  onChange={checkChange}
                  name="hasStoreControl"
                  value={hasStoreControl}
                  label="page.companyInformation.check.productStore"
                />
              </Colxx>
              <Colxx xxs="12" lg="6">
                <Checkbox
                  onChange={onInputChange}
                  name="hasStockControl"
                  checked={hasStockControl}
                  value={hasStockControl}
                  disabled={checkActive}
                  label="page.companyInformation.check.stockControl"
                />
              </Colxx>
              <Colxx xxs="12" lg="6">
                <Checkbox
                  onChange={onInputChange}
                  name="hasDateOutControl"
                  value={hasDateOutControl}
                  disabled={checkActive}
                  label="page.companyInformation.check.controlDates"
                />
              </Colxx>
              <Colxx xxs="12" lg="6">
                <Checkbox
                  onChange={onInputChange}
                  name="hasProductOneManyControl"
                  value={hasProductOneManyControl}
                  label="page.companyInformation.check.product"
                />
              </Colxx>
              <Colxx xxs="12" lg="6">
                <Checkbox
                  onChange={onInputChange}
                  name="hasSellerControl"
                  value={hasSellerControl}
                  label="page.companyInformation.check.sellersControl"
                />
              </Colxx>
              <Colxx xxs="12" lg="6">
                <Checkbox
                  onChange={onInputChange}
                  name="hasDualCurrency"
                  value={hasDualCurrency}
                  label="page.companyInformation.check.hasDualCurrency"
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12} lg={6}>
                <Button onClick={onViewInternalOptions} color='primary'> {IntlMessages("button.internalOptions")} </Button>
              </Colxx>
              <Colxx xxs={12} lg={6}>
                <Button onClick={onViewMailOptions} color='primary'> {IntlMessages("button.emailSettings")} </Button>
              </Colxx>
            </Row>
            <hr />
            <Row>
              <Colxx xxs="12" lg="6">
                <Checkbox
                  onChange={onInputChange}
                  name="isDefault"
                  value={isDefault}
                  label="page.companyInformation.check.defaultCompany"
                />
              </Colxx>
              <Colxx xxs="12" lg={6} align="right">
                <Checkbox
                  onChange={onInputChange}
                  name="status"
                  value={status}
                  label="page.companyInformation.check.status"
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row>
          <hr />
          <Colxx xxs="12" className="div-action-button-container">
            <Button
              color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail