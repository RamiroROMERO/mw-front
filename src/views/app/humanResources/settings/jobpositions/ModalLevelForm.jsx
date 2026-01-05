import React from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { InputField } from "@Components/inputFields";
import { Checkbox } from "@Components/checkbox";
import { useForm } from "@Hooks/useForms";

const LevelForm = (props) => {
  const { data, setOpen } = props;
  const { setLoading, fnLevels, fnCreate } = data;
  const { onInputChange, onResetForm, formState } = useForm({
    id: 0,
    name: '',
    status: true
  })

  const { id, name, status } = formState;

  const fnSave = () => {
    if (name === "") {
      notification('warning', 'msg.required.input.name', 'alert.warning.title');
      return;
    }
    const newdata = {
      id,
      name,
      status
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`rrhh/settings/jobPositionLevels/${id}`, newdata, () => {
        setOpen(false);
        onResetForm();
        fnLevels();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/settings/jobPositionLevels', newdata, () => {
        setOpen(false);
        onResetForm();
        fnLevels();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xss="12">
            <InputField
              name="name"
              onChange={onInputChange}
              value={name}
              label="page.jobPositions.input.description"
              type="text"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx>
            <Checkbox
              name="status"
              onChange={onInputChange}
              value={status}
              label="check.status"
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
  );
}
export default LevelForm;