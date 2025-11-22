import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { useModalNewRooms } from './useModalNewRooms';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { InputField } from '@/components/inputFields';
import UploadImages from '@/components/uploadImages/UploadImages';
import Confirmation from '@Containers/ui/confirmationMsg';

const ModalNewRooms = ({data, setOpen}) => {
  const {currentItem, listLevels, listTypes, listServices, listStatus, listMealPlan, dataRoomServices, dataRoomImages, setLoading, fnGetData, fnGetRoomImages} = data;

  const {formState, formValidation, sendForm, listRoomServices, propsToMsgDelete, setDataImages, onInputChange, onServicesChange, fnSave, fnDeleteImage} = useModalNewRooms({setLoading, currentItem, listServices, dataRoomServices, fnGetData, setOpen, fnGetRoomImages});

  const {name, typeId, levelId, bedNumber, rate, rateCorp, notes, capacity, statusId, mealPlanId} = formState;

  const {typeIdValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12} sm={7} md={8}>
          <Row>
            <Colxx xxs="12">
              <ContainerWithLabel label="page.hotel.modal.addRooms.label.detailRoom">
                <Row>
                  <Colxx xxs={12} md={6}>
                    <InputField
                      name='name'
                      label='input.name'
                      value={name}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12} md={6}>
                    <SearchSelect
                      label='select.typeId'
                      name='typeId'
                      inputValue={typeId}
                      options={listTypes}
                      onChange={onInputChange}
                      invalid={sendForm && !!typeIdValid}
                      feedbackText={sendForm && (typeIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs={12} md={6}>
                    <SearchSelect
                      label='select.levelId'
                      name='levelId'
                      inputValue={levelId}
                      options={listLevels}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12} md={6}>
                    <SearchSelect
                      label='select.mealPlanId'
                      name='mealPlanId'
                      inputValue={mealPlanId}
                      options={listMealPlan}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs={12} md={6}>
                    <InputField
                      name='bedNumber'
                      label='input.bedNumber'
                      value={bedNumber}
                      onChange={onInputChange}
                      type='text'
                    />
                  </Colxx>
                  <Colxx xxs={12} md={6}>
                    <InputField
                      name='rate'
                      label='input.rateStandar'
                      value={rate}
                      onChange={onInputChange}
                      type='text'
                    />
                  </Colxx>
                  <Colxx xxs={12} md={6}>
                    <InputField
                      name='rateCorp'
                      label='input.rateCorp'
                      value={rateCorp}
                      onChange={onInputChange}
                      type='text'
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <InputField
                      name='notes'
                      label='input.notes'
                      value={notes}
                      onChange={onInputChange}
                      type='textarea'
                      style={{resize:'none'}}
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <InputField
                      name='capacity'
                      label='input.capacity'
                      value={capacity}
                      onChange={onInputChange}
                      type='text'
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <SearchSelect
                      label='select.status'
                      name='statusId'
                      inputValue={statusId}
                      options={listStatus}
                      onChange={onInputChange}
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs={12} sm={5} md={4}>
          <Row>
            <Colxx xxs={12}>
              <ContainerWithLabel label="page.hotel.modal.addRooms.label.services">
                <Row>
                  {listRoomServices.map((item) => {
                    return (
                      <Colxx xxs={12} key={item.id}>
                        <div className="form-check custom-checkbox custom-control">
                          <input
                            className="form-check-input custom-control-input"
                            type="checkbox"
                            id={item.id}
                            name={item.id}
                            onChange={onServicesChange}
                            defaultChecked={item.checked}
                          />
                          <label className="form-check-label custom-control-label" htmlFor={item.id}>
                            {item.name}
                          </label>
                        </div>
                      </Colxx>
                    )
                  })}
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12}>
          <UploadImages title='Galeria' setDataImages={setDataImages} imagesSaved={dataRoomImages} fnDeleteImages={fnDeleteImage}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
      <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
    </ModalFooter>
    <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ModalNewRooms