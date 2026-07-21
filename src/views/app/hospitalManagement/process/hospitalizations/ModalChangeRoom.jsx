import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { useChangeRoom } from './useChangeRoom'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'

const ModalChangeRoom = ({ data, setOpen }) => {
  const { currentItem, setLoading, listRooms, fnGetData } = data;

  const { formState, formValidation, sendForm, onInputChange, fnSaveDocument } = useChangeRoom({ currentItem, setLoading, fnGetData, setOpen });

  const { roomId } = formState;
  const { roomIdValid } = formValidation;

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
                <Colxx xxs={12} xs={12} md={8} xl={7}>
                  <InputField
                    name="namePatient"
                    label="input.name"
                    value={currentItem?.hospExpedient?.name || ''}
                    disabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12}>
            <ContainerWithLabel label="label.title.changeRoom">
              <Row>
                <Colxx xxs={12} sm={6}>
                  <InputField
                    name="currentRoom"
                    label="input.currentRoom"
                    value={currentItem?.hospRoom?.name || ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} sm={6}>
                  <SearchSelect
                    name="roomId"
                    inputValue={roomId}
                    onChange={onInputChange}
                    options={listRooms}
                    label="select.roomId"
                    invalid={sendForm && !!roomIdValid}
                    feedbackText={sendForm && (roomIdValid || null)}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveDocument}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalChangeRoom
