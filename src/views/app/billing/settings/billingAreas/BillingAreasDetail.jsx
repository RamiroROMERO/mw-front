import { Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx } from '@Components/common/CustomBootstrap';
import { RadioGroup } from '@Components/radioGroup';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { MAX_NAME } from './billingAreaRules';

// Formulario de Áreas de facturación (fac_areas.sc2). Obligatorios con `*` (nombre, bodega, documento, precios y, con Contabilidad activa, la cuenta de ingreso);
// `feedbackText` recibe la CLAVE de traducción (el componente la traduce). Los campos con buscador F1 del legacy (las cuentas) se conservan como combos con búsqueda.
const BillingAreasDetail = ({ formState, listDocument, listLedgerAccount, listStores, onInputChange, sendForm, errors, accountingActive, isHospitalControl }) => {

  const { name, incomeCtaCode, discountCtaCode, taxCtaCode, receivableCtaCode, shortageCtaCode, storeId, codeDocument, localPriceType, outsiderPriceType, isDefault, useBilling, useRrhh,
    useFixedAsset, isHospital, fourteenthCtaCode, noticeCtaCode, severanceCtaCode, thirteenthCtaCode, vacationCtaCode, depreciationCostCtaCode, depreciationCtaCode, status } = formState;

  const intl = useIntl();
  const error = (field) => (sendForm ? errors[field] : undefined);
  // RadioGroup solo marca el borde: el texto del error se muestra aquí (un solo useIntl, nunca IntlMessages dentro de una condición).
  const radioError = (field) => (error(field) ? <div className="invalid-feedback d-block">{intl.formatMessage({ id: error(field) })}</div> : null);
  const account = (label, field, value) => (
    <Colxx xxs="12">
      <SearchSelect label={label} name={field} inputValue={value} options={listLedgerAccount} onChange={onInputChange} invalid={!!error(field)} feedbackText={error(field)} />
    </Colxx>
  );

  return (
    <>
      <Row>
        <Colxx xxs={12} md={12} lg={6}>
          <InputField
            value={name}
            name="name"
            onChange={onInputChange}
            type="text"
            maxLength={MAX_NAME}
            label="page.billingAreas.input.descriptionRequired"
            invalid={!!error('name')}
            feedbackText={error('name')}
          />
        </Colxx>
        <Colxx xxs={12} md={12} lg={6}>
          <Row>
            <Colxx xxs={12}>
              <ContainerWithLabel label="page.billingAreas.containerWithLabel.usage">
                <Row>
                  <Colxx md={4}>
                    <Checkbox label="check.useIn.billing" name="useBilling" value={useBilling} onChange={onInputChange} />
                  </Colxx>
                  <Colxx md={4}>
                    <Checkbox label="check.useIn.humanResource" name="useRrhh" value={useRrhh} onChange={onInputChange} />
                  </Colxx>
                  <Colxx md={4}>
                    <Checkbox label="check.useIn.fixedAssets" name="useFixedAsset" value={useFixedAsset} onChange={onInputChange} />
                  </Colxx>
                  {isHospitalControl && (
                    <Colxx xxs={12}>
                      <Checkbox label="check.isHospitalArea" name="isHospital" value={isHospital} onChange={onInputChange} />
                    </Colxx>
                  )}
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12} sm={6}>
          <ContainerWithLabel label='page.billingAreas.ctLabel.billingCtas'>
            <Row>
              {account(accountingActive ? 'page.billingAreas.select.incomeAccountRequired' : 'page.billingAreas.select.idCtaIng', 'incomeCtaCode', incomeCtaCode)}
              {account('page.billingAreas.select.discountaccount', 'discountCtaCode', discountCtaCode)}
              {account('page.billingAreas.select.idCtaTax', 'taxCtaCode', taxCtaCode)}
              {account('page.billingAreas.select.idCtaCxc', 'receivableCtaCode', receivableCtaCode)}
              {account('page.billingAreas.select.idCtaShortage', 'shortageCtaCode', shortageCtaCode)}
            </Row>
            <hr />
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  label="page.billingAreas.select.idStoreRequired"
                  name="storeId"
                  inputValue={storeId}
                  options={listStores}
                  onChange={onInputChange}
                  invalid={!!error('storeId')}
                  feedbackText={error('storeId')}
                />
              </Colxx>
              <Colxx xxs="12">
                <SearchSelect
                  label="page.billingAreas.select.documentRequired"
                  name="codeDocument"
                  inputValue={codeDocument}
                  options={listDocument}
                  onChange={onInputChange}
                  invalid={!!error('codeDocument')}
                  feedbackText={error('codeDocument')}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.billingAreas.title.salePrice">
                  <Row className="mb-2" >
                    <Colxx xxs="12">
                      <RadioGroup
                        label="page.billingAreas.title.localPriceTypeRequired"
                        name="localPriceType"
                        value={localPriceType}
                        onChange={onInputChange}
                        display="flex"
                        options={[
                          { id: 1, label: 'page.billingAreas.radio.localPriceType.minimum' },
                          { id: 2, label: 'page.billingAreas.radio.localPriceType.medium' },
                          { id: 3, label: 'page.billingAreas.radio.localPriceType.maximum' }
                        ]}
                        invalid={!!error('localPriceType')}
                        feedbackText={error('localPriceType')}
                      />
                      {radioError('localPriceType')}
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12">
                      <RadioGroup
                        label="page.billingAreas.title.foreignClientsRequired"
                        name="outsiderPriceType"
                        value={outsiderPriceType}
                        onChange={onInputChange}
                        display="flex"
                        options={[
                          { id: 1, label: 'page.billingAreas.radio.foreignClients.minimum' },
                          { id: 2, label: 'page.billingAreas.radio.foreignClients.medium' },
                          { id: 3, label: 'page.billingAreas.radio.foreignClients.maximum' }
                        ]}
                        invalid={!!error('outsiderPriceType')}
                        feedbackText={error('outsiderPriceType')}
                      />
                      {radioError('outsiderPriceType')}
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs={12} sm={6}>
          <Row>
            <Colxx xxs={12}>
              <ContainerWithLabel label='page.billingAreas.containerWithLabel.useHumanResources'>
                <Row>
                  {account('page.areas.select.idCtaRrhhSeverance', 'severanceCtaCode', severanceCtaCode)}
                  {account('page.areas.select.idCtaRrhhNotice', 'noticeCtaCode', noticeCtaCode)}
                  {account('page.areas.select.idCtaRrhhVacation', 'vacationCtaCode', vacationCtaCode)}
                  {account('page.areas.select.idCtaRrhhThirteenth', 'thirteenthCtaCode', thirteenthCtaCode)}
                  {account('page.areas.select.idCtaRrhhFourteenth', 'fourteenthCtaCode', fourteenthCtaCode)}
                </Row>
              </ContainerWithLabel>
            </Colxx>
            <Colxx xxs={12}>
              <ContainerWithLabel label="page.billingAreas.containerWithLabel.useFixedAssets">
                <Row>
                  {account('page.fixedAssets.input.accDeprecation', 'depreciationCtaCode', depreciationCtaCode)}
                  {account('page.fixedAssets.input.accCost', 'depreciationCostCtaCode', depreciationCostCtaCode)}
                </Row>
              </ContainerWithLabel>
            </Colxx>
            <Colxx xxs={12} sm={6} lg={4}>
              <Checkbox label="page.billingAreas.check.active" name="status" value={status} onChange={onInputChange} />
            </Colxx>
            <Colxx xxs={12} sm={6} lg={4}>
              <Checkbox label="check.isDefault" name="isDefault" value={isDefault} onChange={onInputChange} />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </>
  )
}

export default BillingAreasDetail
