import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import { IntlMessages } from '@/helpers/Utils'
import { useMailOptionsModal } from './useMailOptionsModal'
import { Checkbox } from '@/components/checkbox'

export const MailOptionsModal = ({ data, setOpen }) => {

  const { formState, onInputChange, fnSaveIntOptions } = useMailOptionsModal({ setOpen, data });

  const { mailServer, mailPort, mailSsl, mailEmail, mailUser, mailPass, mailCopy1, mailCopy2, mailCopy3, sendMailGenInvoice, sendMailGenOC, sendMailGenProvPayment } = formState;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} md={6}>
            <ContainerWithLabel label="page.companyInformation.modal.mailOptions.mailSettings">
              <Row>
                <Colxx xxs={12}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.mailServer"
                    name="mailServer"
                    type="url"
                    value={mailServer}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.email"
                    name="mailEmail"
                    type="email"
                    value={mailEmail}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.user"
                    name="mailUser"
                    type="text"
                    value={mailUser}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.password"
                    name="mailPass"
                    type="password"
                    value={mailPass}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={6}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.port"
                    name="mailPort"
                    type="text"
                    value={mailPort}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={6}>
                  <Checkbox
                    label="page.companyInformation.modal.mailOptions.hasSSL"
                    name="mailSsl"
                    value={mailSsl}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} md={6}>
            <ContainerWithLabel label="page.companyInformation.modal.mailOptions.mailCopy">
              <Row>
                <Colxx xxs={12}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.mailCopy1"
                    name="mailCopy1"
                    type="mailCopy1"
                    value={mailCopy1}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.mailCopy2"
                    name="mailCopy2"
                    type="mailCopy2"
                    value={mailCopy2}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    label="page.companyInformation.modal.mailOptions.mailCopy3"
                    name="mailCopy3"
                    type="mailCopy3"
                    value={mailCopy3}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12}>
            <ContainerWithLabel label="page.companyInformation.modal.mailOptions.notiff">
              <Row>
                <Colxx xxs={12} md={6} lg={4}>
                  <Checkbox
                    label="page.companyInformation.modal.mailOptions.notiff.generateInvoice"
                    name="sendMailGenInvoice"
                    value={sendMailGenInvoice}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6} lg={4}>
                  <Checkbox
                    label="page.companyInformation.modal.mailOptions.notiff.generateOC"
                    name="sendMailGenOC"
                    value={sendMailGenOC}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6} lg={4}>
                  <Checkbox
                    label="page.companyInformation.modal.mailOptions.notiff.providerPayment"
                    name="sendMailGenProvPayment"
                    value={sendMailGenProvPayment}
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
