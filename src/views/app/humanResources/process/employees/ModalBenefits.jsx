import React, { useState, useEffect } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { IntlMessages, validFloat } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { Checkbox } from '@Components/checkbox'
import { request } from '@Helpers/core'
import ReactTable from '@Components/reactTable'
import Confirmation from '@Containers/ui/confirmationMsg';

const ModalBenefits = ({ data, setOpen }) => {
  const { employeeId, setLoading } = data;
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const benefitsValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    value: 0,
    description: '',
    status: 1
  }, benefitsValid);

  const { id, name, value, description, status } = formState;

  const { nameValid, valueValid } = formValidation;

  const fnEditBenefit = (item) => {
    setBulkForm(item);
  }

  const fnDeleteBenefit = (item) => {
    setBulkForm({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.benefits.title"),
    columns: [
      {
        text: IntlMessages("table.column.name"),
        dataField: "name",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: { width: "10%" }
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditBenefit
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteBenefit,
      }
    ]
  });

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET(`rrhh/process/employeeBenefits?employeeId=${employeeId}`, (resp) => {
      const benefits = resp.data.map((item) => {
        item.statusIcon = (item.status === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: benefits
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      employeeId,
      name,
      value: validFloat(value),
      description,
      status
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/employeeBenefits', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/employeeBenefits/${id}`, newData, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/employeeBenefits/${id}`, (resp) => {
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="8">
            <InputField
              name='name'
              label='input.name'
              value={name}
              onChange={onInputChange}
              type='text'
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="4">
            <InputField
              name='value'
              label='input.value'
              value={value}
              onChange={onInputChange}
              type='text'
              invalid={sendForm && !!valueValid}
              feedbackText={sendForm && (valueValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name='description'
              label='input.description'
              value={description}
              onChange={onInputChange}
              type='textarea'
              style={{ resize: 'none' }}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Checkbox
              label="check.status"
              name="status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xxs="12" align="right">
            <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
            <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ModalBenefits