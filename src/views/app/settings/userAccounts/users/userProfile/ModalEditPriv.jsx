import React, { useState, useEffect } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import notification from '@/containers/ui/Notifications';
import { Checkbox } from "@/components/checkbox";

const ModalEditPriv = (props) => {
  const { data, setOpen } = props;
  const { currentItemPriv, moduleName, activeTabPriv, setLoading, fnGetData } = data;
  const [optCreate, setOptCreate] = useState(currentItemPriv ? currentItemPriv.fnCreate : false);
  const [optUpdate, setOptUpdate] = useState(currentItemPriv ? currentItemPriv.fnUpdate : false);
  const [optDelete, setOptDelete] = useState(currentItemPriv ? currentItemPriv.fnDelete : false);
  const [status, setStatus] = useState(currentItemPriv.active ? (currentItemPriv.active === 1) : false);
  const [showOptions, setShowOptions] = useState('block');

  const mapSetValue = {
    optCreate: { setValue: setOptCreate },
    optUpdate: { setValue: setOptUpdate },
    optDelete: { setValue: setOptDelete },
    status: { setValue: setStatus }
  }

  const handleInputChange = e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    mapSetValue[e.target.name].setValue(value)
  }

  const fnAssignPrivileges = () => {
    if (activeTabPriv === "1") {
      if ((optCreate === false || optCreate === 0) && (optUpdate === false || optUpdate === 0) && (optDelete === false || optDelete === 0)) {
        notification('warning', 'msg.required.select', 'alert.warning.title');
        return;
      }
    }

    const newData = {
      fnCreate: optCreate,
      fnUpdate: optUpdate,
      fnDelete: optDelete,
      active: status
    };

    setLoading(true);
    request.PUT(`admin/userModules/${currentItemPriv.id}`, newData, (resp) => {
      console.log(resp);
      fnGetData();
      setOpen(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (activeTabPriv === "1") {
      setShowOptions('block');
    } else {
      setShowOptions('none');
    }
  }, []);

  return (
    <>
      <ModalBody>
        <Row className="mb-4">
          <Colxx xxs="12" xs="12" sm="5" md="5" lg="5">
            <span className="text-muted text-small d-block">
              {IntlMessages("page.users.privileges.modal.addPrivileges.input.moduleName")}
            </span>
            <h6 className="d-inline">
              {moduleName}
            </h6>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="3" style={{ display: showOptions }}>
            <Checkbox
              onChange={handleInputChange}
              name="optCreate"
              value={optCreate}
              label="page.users.privileges.modal.addPrivileges.check.optCreate"
            />
          </Colxx>
          <Colxx xxs="3" style={{ display: showOptions }}>
            <Checkbox
              onChange={handleInputChange}
              name="optUpdate"
              value={optUpdate}
              label="page.users.privileges.modal.addPrivileges.check.optUpdate"
            />
          </Colxx>
          <Colxx xxs="3" style={{ display: showOptions }}>
            <Checkbox
              onChange={handleInputChange}
              name="optDelete"
              value={optDelete}
              label="page.users.privileges.modal.addPrivileges.check.optDelete"
            />
          </Colxx>
          <Colxx xxs="3">
            <Checkbox
              onChange={handleInputChange}
              name="status"
              value={status}
              label="page.users.privileges.modal.addPrivileges.check.active"
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAssignPrivileges}><i className="iconsminds-save" />
          {` ${IntlMessages("button.save")}`}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalEditPriv;