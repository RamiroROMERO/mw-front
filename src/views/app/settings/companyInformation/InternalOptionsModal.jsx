import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Checkbox } from '@Components/checkbox'
import { InputField } from '@Components/inputFields'
import { RadioGroup } from '@Components/radioGroup'
import { SimpleSelect } from '@Components/simpleSelect'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { useInternalOptions } from './useInternalOptions'

const dateFormatOptions = [
  { id: 'DMY', name: 'DD/MM/YYYY' },
  { id: 'AMERICAN', name: 'MM/DD/YYYY' },
  { id: 'YMD', name: 'YYYY/MM/DD' },
  { id: 'GERMAN', name: 'DD.MM.YYYY' }
];

export const InternalOptionsModal = ({ data, setOpen }) => {
  const { companyId, setLoading } = data;

  const {formState, onInputChange, fnSaveIntOptions} = useInternalOptions({companyId, setLoading, setOpen});

  const { laboratoryControl, hospitalControl, closeControl, sellerMenu, inventoryMenu, accountingMenu, bankMenu, taxesMenu, fixedAssetsMenu, rrhhMenu, hospitalMenu, laboratoryMenu,
    coffeeControl, farmsConrol, activitiesControl, containerControl, flourControl,
    exportControl, comercialControl, posControl, payrollSeatControl, hotelMenu, percentSAR, exchangeType, formatDate } = formState;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} md={6}>
            <ContainerWithLabel label="page.companyInformation.modal.availableMenus">
              <Row>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.sellerMenu"
                    name="sellerMenu"
                    value={sellerMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.inventoryMenu"
                    name="inventoryMenu"
                    value={inventoryMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.accMenu"
                    name="accountingMenu"
                    value={accountingMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.bankMenu"
                    name="bankMenu"
                    value={bankMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.taxesMenu"
                    name="taxesMenu"
                    value={taxesMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.fixedAssetsMenu"
                    name="fixedAssetsMenu"
                    value={fixedAssetsMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.rrhhMenu"
                    name="rrhhMenu"
                    value={rrhhMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.hospitalMenu"
                    name="hospitalMenu"
                    value={hospitalMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.laboratoryMenu"
                    name="laboratoryMenu"
                    value={laboratoryMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.hotelMenu"
                    name="hotelMenu"
                    value={hotelMenu}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} md={6}>
            <ContainerWithLabel label="page.companyInformation.modal.otherOptions">
              <Row>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.closeControl"
                    name="closeControl"
                    value={closeControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.hospitalControl"
                    name="hospitalControl"
                    value={hospitalControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.laboratoryControl"
                    name="laboratoryControl"
                    value={laboratoryControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.coffeeControl"
                    name="coffeeControl"
                    value={coffeeControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.farmsConrol"
                    name="farmsConrol"
                    value={farmsConrol}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.activitiesControl"
                    name="activitiesControl"
                    value={activitiesControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.containerControl"
                    name="containerControl"
                    value={containerControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.flourControl"
                    name="flourControl"
                    value={flourControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.exportControl"
                    name="exportControl"
                    value={exportControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.comercialControl"
                    name="comercialControl"
                    value={comercialControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.posControl"
                    name="posControl"
                    value={posControl}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <Checkbox
                    label="page.companyInformation.check.payrollSeatControl"
                    name="payrollSeatControl"
                    value={payrollSeatControl}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs={12} md={4}>
            <InputField
              name="percentSAR"
              value={percentSAR}
              label="page.companyInformation.input.percentSAR"
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} md={4}>
            <RadioGroup
              label="page.companyInformation.radio.exchangeType"
              name="exchangeType"
              value={exchangeType}
              onChange={onInputChange}
              options={[
                { id: 1, label: "page.companyInformation.radio.purchase" },
                { id: 2, label: "page.companyInformation.radio.sale" }
              ]}
            />
          </Colxx>
          <Colxx xxs={12} md={4}>
            <SimpleSelect
              name="formatDate"
              value={formatDate}
              label="page.companyInformation.select.formatDate"
              onChange={onInputChange}
              options={dateFormatOptions}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button onClick={fnSaveIntOptions} color='primary'><i className="iconsminds-save" />
          {IntlMessages("button.save")}
        </Button>
      </ModalFooter>
    </>
  )
}
