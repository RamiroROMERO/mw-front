import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import { Checkbox } from '@/components/checkbox'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { useInternalOptions } from './useInternalOptions'

export const InternalOptionsModal = ({ data, setOpen }) => {
  const { companyId, setLoading } = data;

  const {formState, onInputChange, fnSaveIntOptions} = useInternalOptions({companyId, setLoading, setOpen});

  const { laboratoryControl, hospitalControl, closeControl, sellerMenu, inventoryMenu, accountingMenu, bankMenu, taxesMenu, fixedAssetsMenu, rrhhMenu, hospitalMenu, laboratoryMenu } = formState;

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
              </Row>
            </ContainerWithLabel>
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
