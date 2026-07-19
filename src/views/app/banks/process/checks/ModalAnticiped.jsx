import { useState, useEffect } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import notification from '@Containers/ui/Notifications';
import { useForm } from "@Hooks";
import { InputField } from "@Components/inputFields";
import SearchSelect from "@Components/SearchSelect/SearchSelect";
import DateCalendar from '@Components/dateCalendar';

export const ModalAnticiped = (props) => {
  const { data, setOpen, } = props;
  const { dataExpenses, listProvider } = data;

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    document: '',
    proveedorId: '',
    date: '',
    value: 0,
    description: ''
  })

  const { document, proveedorId, date, value, description } = formState;

  const fnSave = () => { }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="dacument"
              value={document}
              onChange={onInputChange}
              type="text"
              label="page.checks.modalAnticiped.input.document"
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              name="providerId"
              inputValue={proveedorId}
              onChange={onInputChange}
              label="select.providerId"
              options={listProvider} />
          </Colxx>
          <Colxx>
            <DateCalendar
              name="date"
              value={date}
              onChange={onInputChange}
              label="select.date"
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="value"
              value={value}
              onChange={onInputChange}
              type="text"
              label="input.value"
            />
          </Colxx>
          <Colxx>
            <InputField
              name="description"
              onChange={onInputChange}
              value={description}
              type="textarea"
              label="input.description"
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}>
          <i className="iconsminds-save" /> {IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}
