import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { useHospitalization } from './useHospitalization'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'

const ModalHospitalization = ({data, setOpen}) => {
  const {currentItem, setLoading, listDoctors, listReasons, listRooms, fnGetData} = data;

  const {formState, formValidation, sendForm, onInputChange, fnSaveDocument} = useHospitalization({currentItem, setLoading, fnGetData, setOpen});

  const {admissionSpecialistId, responsibleSpecialistId, reasonId, roomId} = formState

  const {admissionSpecialistIdValid, responsibleSpecialistIdValid} = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="label.title.patient">
              <Row>
                <Colxx xxs={12} xs={5} md={4} xl={2}>
                  <InputField
                    name="codeFilePhysic"
                    label="input.codePhysic"
                    value={currentItem?.hospExpedient?.code || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} xs={7} md={8} xl={3}>
                  <InputField
                    name="dni"
                    label="input.dni"
                    value={currentItem?.hospExpedient?.dni || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} xs={12} md={8} xl={5}>
                  <InputField
                    name="namePatient"
                    label="input.name"
                    value={currentItem?.hospExpedient?.name || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} xs={5} md={4} xl={2}>
                  <InputField
                    name="id"
                    label="input.noEvent"
                    value={currentItem?.id || 0}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12}>
            <ContainerWithLabel label="label.title.hospitalization.detail">
              <Row>
                <Colxx xxs={12} xs={6} xl={4}>
                  <DateCalendar
                    name="date"
                    value={currentItem.date}
                    label='input.date'
                    onChange={onInputChange}
                    disabled
                  />
                </Colxx>
                <Colxx xss={12} sm={6}>
                  <SearchSelect
                    name="admissionSpecialistId"
                    inputValue={admissionSpecialistId}
                    onChange={onInputChange}
                    options={listDoctors}
                    label="select.doctorAdmissionId"
                    invalid={sendForm && !!admissionSpecialistIdValid}
                    feedbackText={sendForm && (admissionSpecialistIdValid || null)}
                  />
                </Colxx>
                <Colxx xss={12} sm={6}>
                  <SearchSelect
                    name="responsibleSpecialistId"
                    inputValue={responsibleSpecialistId}
                    onChange={onInputChange}
                    options={listDoctors}
                    label="select.doctorResponsibleId"
                    invalid={sendForm && !!responsibleSpecialistIdValid}
                    feedbackText={sendForm && (responsibleSpecialistIdValid || null)}
                  />
                </Colxx>
                <Colxx xss={12} sm={6}>
                  <SearchSelect
                    name="reasonId"
                    inputValue={reasonId}
                    onChange={onInputChange}
                    options={listReasons}
                    label="select.reasonId"
                  />
                </Colxx>
                <Colxx xss={12} sm={6}>
                  <SearchSelect
                    name="roomId"
                    inputValue={roomId}
                    onChange={onInputChange}
                    options={listRooms}
                    label="select.roomId"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveDocument}>
          <i className="iconsminds-save"/>{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalHospitalization