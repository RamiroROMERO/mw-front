import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import { adminRoot } from '@Constants/defaultValues';
import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages, validInt } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { request } from '@Helpers/core';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { useForm } from '@Hooks';
import Confirmation from '@Containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DataTable from "@Components/reactTable";
import { PATH_FILES } from '/src/helpers/pathFiles';
import envs from '@Helpers/envs';

// Iniciales del nombre: la primera letra de las dos primeras palabras ("Ana Pérez" -> "AP"); con una sola palabra, sus dos primeras letras.
const getInitials = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[1][0]}`;
  return letters.toUpperCase();
};

// Foto del usuario; sin foto (o si no carga) muestra un círculo con sus iniciales en lugar del nombre completo.
const UserAvatar = ({ name, src }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center font-weight-bold align-self-center"
        style={{ width: 40, height: 40, fontSize: '0.9rem' }}
        title={name}
      >
        {getInitials(name)}
      </span>
    );
  }
  return (
    <img
      alt=""
      src={src}
      onError={() => setFailed(true)}
      className="img-thumbnail border-0 rounded-circle list-thumbnail align-self-center small"
    />
  );
};

const Users = (props) => {
  const { setLoading } = props;
  const history = useNavigate();
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [listUserType, setListUserType] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const urlGetProfiles = `${envs.URL_API}${PATH_FILES.GET.PROFILES}`;

  const usersValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    email: [(val) => val !== "", "msg.required.input.email"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.userType"],
    pass: [(val) => val === "" || val.length >= 6, "msg.required.input.password"],
    userName: [(val) => val !== "", "msg.required.input.userName"]
  }

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    name: '',
    email: '',
    typeId: 0,
    pass: '',
    userName: '',
    status: true
  }, usersValid);

  const { id, name, email, typeId, pass, userName, status } = formState;

  const { nameValid, emailValid, typeIdValid, userNameValid, passValid } = formValidation;

  const fnEditItem = (item) => {
    setCurrentItem(item);
    delete item.statusIcon;
    delete item.imgUser;
    item.status = status;
    item.listUserType = listUserType;
    history(
      `${adminRoot}/settings/userAccounts/users/userProfile`,
      { replace: true, state: item }
    );
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.users.table.title"),
    columns: [
      {
        text: IntlMessages("page.users.table.img"), dataField: "imgUser", headerStyle: { 'width': '15%' },
        cell: ({ row }) => {
          return (
            <UserAvatar
              name={row.original.name}
              src={row.original.img ? `${urlGetProfiles}${row.original.img}` : ''}
            />
          );
        }
      },
      { text: IntlMessages("page.users.table.name"), dataField: "name", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.users.table.email"), dataField: "email", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.users.table.typeUser"), dataField: "typeUser", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.modules.table.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' } }
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
        onClick: fnEditItem,
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteItem,
      }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/users', (resp) => {
      const data = resp.data.map((item) => {
        item.typeUser = item.adminUsersType ? item.adminUsersType.name : ""
        item.statusIcon = item.status === true ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  };

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    // La contraseña es obligatoria solo al crear; al editar se deja vacía (SPEC v2-163-sr: se cambia con su propia opción).
    if (id === 0 && pass === '') return;
    const data = {
      name,
      userName,
      email,
      ...(id === 0 ? { password: pass } : {}),
      typeId,
      status,
      img: "usuario.png"
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`admin/users/${id}`, data, (resp) => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/users', data, (resp) => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fnGetData();

    request.GET('admin/userTypes', (resp) => {
      const listUserTypes = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListUserType(listUserTypes);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }, []);

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`admin/users/${currentItem.id}`, (resp) => {
      fnGetData();
      setCurrentItem({});
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItem }

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="12" xl="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" xs="12" sm="12" md="6" lg="6" xl="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.users.input.name"
                      invalid={sendForm && !!nameValid}
                      feedbackText={sendForm && (nameValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="12" sm="12" md="6" lg="6" xl="12">
                    <InputField
                      value={userName}
                      name="userName"
                      onChange={onInputChange}
                      type="text"
                      label="page.users.input.userName"
                      invalid={sendForm && !!userNameValid}
                      feedbackText={sendForm && (userNameValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="12" sm="12" md="6" lg="6" xl="12">
                    <InputField
                      value={email}
                      name="email"
                      onChange={onInputChange}
                      type="text"
                      label="page.users.input.email"
                      invalid={sendForm && !!emailValid}
                      feedbackText={sendForm && (emailValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="12" sm="12" md="6" lg="6" xl="12">
                    <InputField
                      value={pass}
                      name="pass"
                      onChange={onInputChange}
                      type="password"
                      label="page.users.input.password"
                      invalid={sendForm && (!!passValid || (id === 0 && pass === ''))}
                      feedbackText={sendForm && (passValid || (id === 0 && pass === '' ? 'msg.required.input.password' : null))}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="12" sm="12" md="6" lg="6" xl="12">
                    <SearchSelect
                      inputValue={typeId}
                      name="typeId"
                      onChange={onInputChange}
                      options={listUserType}
                      label="page.users.input.userType"
                      invalid={sendForm && !!typeIdValid}
                      feedbackText={sendForm && (typeIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="12" sm="12" md="6" lg="6" xl="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="status"
                      value={status}
                      label="page.users.check.status"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" className="div-action-button-container">
                    <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                    <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                  </Colxx>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="12" xl="8">
          <DataTable
            {...table}
          />
        </Colxx>
        <Confirmation {...propsToMsgDelete} />
      </Row>
    </>
  );
}
export default Users;