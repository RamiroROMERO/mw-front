import React, { useEffect, useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages, validFloat } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { request } from '@Helpers/core'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import createNotification from '@Containers/ui/Notifications'

const ModalEditDetail = ({ setOpen, data }) => {
  const { date, id, idFather, employeeId, value, notes, listEmployees, onInputChange, setLoading, fnGetDetail } = data;

  const [disableEmployee, setDisableEmployee] = useState(false);

  const fnSave = () => {
    if (validFloat(value) === 0) {
      createNotification('warning', 'msg.required.input.value', 'alert.warning.title');
      return;
    }

    const newData = {
      fatherId: idFather,
      date,
      employeeId,
      value,
      notes
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/payrollSevenDayDetails', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnGetDetail(idFather);
        setOpen(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/payrollSevenDayDetails/${id}`, newData, (resp) => {
        fnGetDetail(idFather);
        setLoading(false);
        setOpen(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  useEffect(() => {
    if (id > 0) {
      setDisableEmployee(true)
    } else setDisableEmployee(false);
  }, []);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label='select.employee'
              name='employeeId'
              inputValue={employeeId}
              options={listEmployees}
              onChange={onInputChange}
              isDisabled={disableEmployee}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="value"
              label='input.value'
              value={value}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="notes"
              label='input.notes'
              value={notes}
              onChange={onInputChange}
              type="textarea"
              style={{ resize: 'none' }}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}>
          <i className="iconsminds-save" /> {IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalEditDetail