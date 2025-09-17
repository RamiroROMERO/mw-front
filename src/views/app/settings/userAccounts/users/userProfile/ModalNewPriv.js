import React, { useState, useEffect } from "react";
import { Button, ModalBody, ModalFooter, Row, Card, CardBody, CardTitle, } from "reactstrap";
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { Colxx } from '@Components/common/CustomBootstrap';
import notification from '@Containers/ui/Notifications';
import { Checkbox } from "@Components/checkbox";

const ModalNewPriv = (props) => {
  const { data, setOpen } = props;
  const { moduleName, listModulesDetail, userData, activeTabPriv, setLoading, fnGetData } = data;
  const [listModulesFilter, setModulesFilter] = useState([]);
  const [listPrivSelected, setListPrivSelected] = useState([]);
  const [optCreate, setOptCreate] = useState(false);
  const [optUpdate, setOptUpdate] = useState(false);
  const [optDelete, setOptDelete] = useState(false);
  const [showOptions, setShowOptions] = useState('block');
  const [colPrivileges, setColPrivileges] = useState('8');

  const mapSetValue = {
    optCreate: { setValue: setOptCreate },
    optUpdate: { setValue: setOptUpdate },
    optDelete: { setValue: setOptDelete }
  }

  const fnChangePrivilegesSel = (list) => {
    const filterCheked = list.filter(item => item.checked === true);
    setListPrivSelected(filterCheked);
  }

  const handlePrivilegesChange = e => {
    const list = listModulesFilter.map((item) => {
      if (parseInt(e.target.id, 10) === item.id) {
        item.checked = !item.checked;
      }
      return item;
    });
    fnChangePrivilegesSel(list);
  }

  const handleInputChange = e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    mapSetValue[e.target.name].setValue(!value)
  }

  const fnAssignPrivileges = () => {
    let fnCreate = 0; let fnUpdate = 0; let fnDelete = 0;
    if (optCreate === true) { fnCreate = 1 } else { fnCreate = 0 };
    if (optUpdate === true) { fnUpdate = 1 } else { fnUpdate = 0 };
    if (optDelete === true) { fnDelete = 1 } else { fnDelete = 0 };

    if (listPrivSelected.length === 0) {
      notification('warning', 'msg.required.list.privileges', 'alert.warning.title');
      return;
    }

    if (activeTabPriv === "1") {
      if (fnCreate === 0 && fnUpdate === 0 && fnDelete === 0) {
        notification('warning', 'msg.required.select', 'alert.warning.title');
        return;
      }
    }

    const newData = [];

    listPrivSelected.forEach((item) => {
      newData.push({
        userId: userData.id,
        moduleId: item.moduleId,
        code: item.code,
        fnCreate,
        fnUpdate,
        fnDelete,
        active: 1
      });
    });

    setLoading(true);
    request.POST('admin/userModules/createMany', newData, (resp) => {
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
      setColPrivileges('8');
    } else {
      setShowOptions('none');
      setColPrivileges('12');
    }
    const filterModule = listModulesDetail.filter((item) => {
      return item.typeId === parseInt(activeTabPriv, 10);
    });
    setModulesFilter(filterModule);
    fnChangePrivilegesSel(filterModule);
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
          <Colxx xxs={colPrivileges}>
            <Card className="mb-3">
              <CardBody style={{ padding: "15px" }}>
                <CardTitle>{IntlMessages("page.users.privileges.modal.addPrivileges.privileges.title")}</CardTitle>
                <Row>
                  {listModulesFilter.map((item) => {
                    return (
                      <Colxx xxs="6" key={item.id}>
                        <div className="form-check custom-checkbox custom-control">
                          <input
                            className="form-check-input custom-control-input"
                            type="checkbox"
                            id={item.id}
                            name={item.id}
                            onChange={handlePrivilegesChange}
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
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="4" style={{ display: showOptions }}>
            <Card className="mb-3">
              <CardBody style={{ padding: "15px" }}>
                <CardTitle>{IntlMessages("page.users.privileges.modal.addPrivileges.options.title")}</CardTitle>
                <Row>
                  <Colxx xxs="12">
                    <Checkbox
                      name="optCreate"
                      value={optCreate}
                      onChange={({ target }) => setOptCreate(target.checked)}
                      label="page.users.privileges.modal.addPrivileges.check.optCreate"
                    />
                  </Colxx>
                  <Colxx xxs="12">
                    <Checkbox
                      name="optUpdate"
                      value={optUpdate}
                      onChange={({ target }) => setOptUpdate(target.checked)}
                      label="page.users.privileges.modal.addPrivileges.check.optUpdate"
                    />
                  </Colxx>
                  <Colxx xxs="12">
                    <Checkbox
                      name="optDelete"
                      value={optDelete}
                      onChange={({ target }) => setOptDelete(target.checked)}
                      label="page.users.privileges.modal.addPrivileges.check.optDelete"
                    />
                  </Colxx>
                </Row>
              </CardBody>
            </Card>
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

export default ModalNewPriv;