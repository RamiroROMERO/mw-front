import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardTitle, Row, Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import classnames from 'classnames';
import { IntlMessages, validInt } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { adminRoot } from '@Constants/defaultValues';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import DataTable from "@Components/reactTable";
import notification from '@/containers/ui/Notifications';
import Confirmation from '@/containers/ui/confirmationMsg';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import Modal from "@/components/modal";
import ModalNewPriv from "./ModalNewPriv";
import ModalEditPriv from './ModalEditPriv';
import { RadioGroup } from '@Components/radioGroup';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import ProfileImage from '@Components/profileImage/ProfileImage';
import { PATH_FILES } from '/src/helpers/pathFiles';

const UserProfile = (props) => {
  const { setLoading } = props;
  const history = useNavigate();
  const userData = useLocation().state
  const [listUserType, setListUserType] = useState([]);
  const [activeFirstTab, setActiveFirstTab] = useState(1);
  const [activeTabPriv, setActiveTabPriv] = useState('1');
  const [activeTabConfig, setActiveTabConfig] = useState('1');
  const [listModules, setListModules] = useState([]);
  const [listModulesDetail, setListModulesDetail] = useState([]);
  const [listUserModules, setListUserModules] = useState([]);
  const [userModulesFilter, setUserModulesFilter] = useState([]);
  const [currentItemPriv, setCurrentItemPriv] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openNewPriv, setOpenNewPriv] = useState(false);
  const [openEditPriv, setOpenEditPriv] = useState(false);
  const [moduleName, setModuleName] = useState('');
  const [titleModalPrivileges, setTitleModalPrivileges] = useState('');
  const [imgUser, setImgUser] = useState();
  const [sendForm, setSendForm] = useState(false);
  const [sendFormPass, setSendFormPass] = useState(false);
  const [userId, setUserId] = useState(userData.id || 0);
  const hiddenFileInput = React.useRef(null);

  const [confSingIn, setConfSignIn] = useState(false);

  const userProfileValid = {
    typeId: [(val) => validInt(val) > 0, "msg.required.select.userType"]
  }

  const userPassValid = {
    oldPassword: [(val) => val !== "", "msg.required.input.oldPassword"],
    newPassword: [(val) => val !== "", "msg.required.input.newPassword"],
    validNewPassword: [(val) => val !== "", "msg.required.input.validNewPassword"]
  }

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
    typeId: userData.typeId ? userData.typeId : 0,
    status: userData.status ? userData.status : true
  }, userProfileValid);

  const { formState: formStatePass, formValidation: formValidationPass, isFormValid: isFormValidPass, setBulkForm: setBulkFormPass, onResetForm: onResetFormPass, onInputChange: onInputChangePass } = useForm({
    oldPassword: '',
    newPassword: '',
    validNewPassword: ''
  }, userPassValid);


  const { formState: formStateSettings, formValidation: formValidationSetting, isFormValid: isFormValidSetting, onBulkForm: onBulkFormSettings, onResetForm: onResetFormSettings, onInputChange: onInputChangeSettings } = useForm({
    isCashier: false,
    isSeller: false,
    isLogIn: false,
    cashierEditInvoice: false,
    cashierNullInvoice: false,
    cashierRePrintInvoice: false,
    cashierEditPrice: false,
    cashierType: 1,
    sellerIsSupervisor: false,
    sellerCode: "",
    sellerMinPercentCommiss: 0,
    sellerMedPercentCommiss: 0,
    sellerMaxPercentCommiss: 0,
  });

  const { isCashier, isSeller, isLogIn, cashierEditInvoice, cashierNullInvoice, cashierRePrintInvoice, cashierEditPrice, cashierType, sellerIsSupervisor, sellerCode, sellerMinPercentCommiss, sellerMedPercentCommiss, sellerMaxPercentCommiss, sellerApplyCommiss } = formStateSettings;

  const { typeId, status } = formState;

  const { oldPassword, newPassword, validNewPassword } = formStatePass;

  const { typeIdValid } = formValidation;

  const { oldPasswordValid, newPasswordValid, validNewPasswordValid } = formValidationPass;

  const fnGetProfileImage = async (nameImg) => {
    const name = nameImg !== "" ? `${nameImg}` : `usuario.png`
    const imageUrl = `${PATH_FILES.GET.PROFILES}${name}`;
    const imageObjectURL = await request.getFile(imageUrl);

    setImgUser(imageObjectURL);
  }

  const fnEditItem = (item) => {
    setCurrentItemPriv(item);
    setOpenEditPriv(true);
  };

  const fnDeleteItem = (item) => {
    setCurrentItemPriv(item);
    setOpenMsgQuestion(true);
  };

  const fnAddNewRecord = () => {
    setCurrentItemPriv({});
    setTitleModalPrivileges("page.users.privileges.modal.addPrivileges.generalPrivileges.title");
    setOpenNewPriv(true);
  };

  const fnAddNewRecordAdmin = () => {
    setCurrentItemPriv({});
    setTitleModalPrivileges("page.users.privileges.modal.addPrivileges.adminPrivileges.title");
    setOpenNewPriv(true);
  };

  const [tableGeneralPriv, setTableGeneralPriv] = useState({
    title: IntlMessages("page.users.privileges.table.title"),
    columns: [
      { text: IntlMessages("page.users.privileges.table.code"), dataField: "code", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.users.privileges.table.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      { text: IntlMessages("page.users.privileges.table.create"), dataField: "createIcon", isIcon: true, headerStyle: { 'width': '10%' } },
      { text: IntlMessages("page.users.privileges.table.update"), dataField: "updateIcon", isIcon: true, headerStyle: { 'width': '10%' } },
      { text: IntlMessages("page.users.privileges.table.delete"), dataField: "deleteIcon", isIcon: true, headerStyle: { 'width': '10%' } },
      { text: IntlMessages("page.users.privileges.table.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' } }
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
      },
      {
        color: "primary",
        icon: "plus",
        onClick: fnAddNewRecord,
        isFreeAction: true,
      }
    ]
  });

  const [tableAdminPriv, setTableAdminPriv] = useState({
    title: IntlMessages("page.users.privileges.table.title"),
    columns: [
      { text: IntlMessages("page.users.privileges.table.code"), dataField: "code", headerStyle: { 'width': '40%' } },
      { text: IntlMessages("page.users.privileges.table.name"), dataField: "name", headerStyle: { 'width': '50%' } },
      { text: IntlMessages("page.users.privileges.table.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' } }
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
      },
      {
        color: "primary",
        icon: "plus",
        onClick: fnAddNewRecordAdmin,
        isFreeAction: true,
      }
    ]
  });

  const fnFilterByType = (modulesFilter) => {
    // filtrar permisos generales asignados al usuario
    const generalPriv = modulesFilter.filter((item) => {
      return item?.adminModulesDetail?.typeId === 1
    });
    if (generalPriv && generalPriv.length > 0) {
      const dataGenPriv = generalPriv.map((item) => {
        item.code = item.code
        item.name = item?.adminModulesDetail?.name || ""
        item.createIcon = item.fnCreate === true ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        item.updateIcon = item.fnUpdate === true ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        item.deleteIcon = item.fnDelete === true ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        item.statusIcon = item.active === true ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...tableGeneralPriv, data: dataGenPriv
      }
      setTableGeneralPriv(tableData);
    } else {
      const tableData = {
        ...tableGeneralPriv, data: []
      }
      setTableGeneralPriv(tableData);
    }
    // filtrar permisos administrativos asignados al usuario
    const adminPriv = modulesFilter.filter((item) => {
      return item?.adminModulesDetail?.typeId === 2
    });
    if (adminPriv && adminPriv.length > 0) {
      const dataAdminPriv = adminPriv.map((item) => {
        item.code = item.code
        item.name = item?.adminModulesDetail?.name || ""
        item.statusIcon = item.active === true ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableDataAdmin = {
        ...tableAdminPriv, data: dataAdminPriv
      }
      setTableAdminPriv(tableDataAdmin);
    } else {
      const tableDataAdmin = {
        ...tableAdminPriv, data: []
      }
      setTableAdminPriv(tableDataAdmin);
    }
  }

  const fnFilterByModule = (id, modulesUser) => {
    setLoading(true);
    request.GET(`admin/moduleDetail?moduleId=${id}`, (resp) => {
      const modulesDetail = resp.data.map((item) => {
        item.checked = true
        return item;
      });
      const filterPriv = modulesDetail.filter((item) => {
        const filter = modulesUser.filter((item2) => {
          return item.code === item2.code
        });
        return filter.length === 0;
      });
      setListModulesDetail(filterPriv);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    const filterUserModule = modulesUser.filter(item => item.moduleId === id);
    setUserModulesFilter(filterUserModule);
    fnFilterByType(filterUserModule);
  }

  const fnUpdateUser = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const data = {
      typeId,
      status
    }

    setLoading(true);
    request.PUT(`admin/users/${userData.id}`, data, (resp) => {
      setSendForm(false);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGetData = () => {
    request.GET('admin/modules', (resp) => {
      const modules = resp.data;
      setListModules(modules);
      request.GET(`admin/userModules?userId=${userData.id}`, (resp2) => {
        const userModules = resp2.data.filter(elem => validInt(elem.moduleId) !== 0);
        setListUserModules(userModules);

        fnFilterByModule(activeFirstTab, userModules);
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
    request.GET(`admin/users/${userId}`, resp => {
      const { data } = resp;
      const { isCashier, isSeller, isLogIn, cashierEditInvoice, cashierNullInvoice, cashierRePrintInvoice, cashierEditPrice, cashierType, sellerIsSupervisor, sellerCode, sellerMinPercentCommiss, sellerMedPercentCommiss, sellerMaxPercentCommiss, sellerApplyCommiss } = data;
      onBulkFormSettings({
        isCashier, isSeller, isLogIn, cashierEditInvoice, cashierNullInvoice, cashierRePrintInvoice, cashierEditPrice, cashierType, sellerIsSupervisor, sellerCode, sellerMinPercentCommiss, sellerMedPercentCommiss, sellerMaxPercentCommiss, sellerApplyCommiss
      })
    }, err => { });
  }

  useEffect(() => {
    setLoading(true);
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
    fnGetData();

    fnGetProfileImage(userData.img);
  }, []);

  const propsToModalPrivileges = {
    ModalContent: ModalNewPriv,
    title: titleModalPrivileges,
    open: openNewPriv,
    setOpen: setOpenNewPriv,
    maxWidth: 'lg',
    data: {
      currentItemPriv,
      moduleName,
      listModulesDetail,
      activeTabPriv,
      userData,
      fnGetData,
      setLoading
    }
  }

  const propsToModalEditPrivileges = {
    ModalContent: ModalEditPriv,
    title: "page.users.privileges.modal.editPrivileges.title",
    open: openEditPriv,
    setOpen: setOpenEditPriv,
    maxWidth: 'md',
    data: {
      currentItemPriv,
      moduleName,
      listModulesDetail,
      activeTabPriv,
      userData,
      fnGetData,
      setLoading
    }
  }

  const fnUploadFiles = event => {
    const fileUploaded = event.target.files[0];
    const data = [{
      file: fileUploaded,
      name: fileUploaded.name
    }]

    request.uploadFiles(PATH_FILES.POST.PROFILES, data, resp => {
      const nameImg = `${resp.data[0].name}`;
      const dataImage = {
        img: nameImg
      }
      request.PUT(`admin/users/${userData.id}`, dataImage, (resp2) => {
        fnGetProfileImage(nameImg);

        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }, err => { });
  };

  const fnBack = () => {
    history(
      `${adminRoot}/settings/userAccounts/users`,
      { replace: true, state: {} }
    );
  }

  const fnChangePass = () => {
    setSendFormPass(true);
    if (!isFormValidPass) {
      return;
    }
    if (newPassword !== validNewPassword) {
      notification('warning', 'msg.required.input.validPasswords', 'alert.warning.title');
      return;
    }
    const dataPass = {
      currentPassword: oldPassword,
      newPassword,
      validNewPassword
    }
    request.PUT(`admin/users/changePassword/${userData.id}`, dataPass, (resp) => {
      setSendFormPass(false);
      onResetFormPass();
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`admin/userModules/${currentItemPriv.id}`, (resp) => {
      fnGetData();
      setCurrentItemPriv({});
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnSaveSettings = () => {
    if (validInt(userId) === 0) return;

    setLoading(true);
    request.PUT(`admin/users/${userId}`, formStateSettings, res => {
      setLoading(false);
    }, err => {
      setLoading(false);
    })

  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title", setCurrentItemPriv }

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="5">
          <Card className="mb-4">
            <CardBody>
              <Row>
                <Colxx xxs="12" xs="12" sm="12" md="12" lg="4" style={{ marginBottom: "16px" }}>
                  <ProfileImage initialImage={imgUser} onUploadFiles={fnUploadFiles} />
                </Colxx>
                <Colxx xxs="12" xs="12" sm="12" md="12" lg="8">
                  <Row>
                    <Colxx xxs="12">
                      <InputField
                        value={userData.name}
                        name="name"
                        disabled
                        type="text"
                        label="page.users.input.name"
                      />
                    </Colxx>
                    <Colxx xxs="12">
                      <InputField
                        value={userData.userName}
                        name="userName"
                        onChange={onInputChange}
                        type="text"
                        label="page.users.input.userName"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs="12">
                      <InputField
                        value={userData.email}
                        name="email"
                        disabled
                        type="text"
                        label="page.users.input.email"
                      />
                    </Colxx>
                    <Colxx xxs="12">
                      <SearchSelect
                        label="page.users.input.userType"
                        name="typeId"
                        inputValue={typeId}
                        onChange={onInputChange}
                        options={listUserType}
                        invalid={sendForm && !!typeIdValid}
                        feedbackText={sendForm && (typeIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12">
                      <Checkbox
                        onChange={onInputChange}
                        name="status"
                        value={status}
                        label="page.users.check.status"
                      />
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" align="right">
                  <Button color="primary" onClick={fnUpdateUser}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" xs="7">
          <Card className="mb-4">
            <CardBody>

              <Nav tabs className="separator-tabs ml-0 mb-2">
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTabConfig === '1',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTabConfig('1')}
                  >
                    {IntlMessages("page.users.profile.tab.config.changePass")}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTabConfig === '2',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTabConfig('2')}
                  >
                    {IntlMessages("page.users.profile.tab.config.options")}
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTabConfig}>
                <TabPane tabId="1">
                  <Row className='mt-4'>
                    <Colxx xxs="12">
                      <InputField
                        value={oldPassword}
                        name="oldPassword"
                        onChange={onInputChangePass}
                        type="password"
                        label="page.users.profile.input.oldPassword"
                        invalid={sendFormPass && !!oldPasswordValid}
                        feedbackText={sendFormPass && (oldPasswordValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12">
                      <InputField
                        value={newPassword}
                        name="newPassword"
                        onChange={onInputChangePass}
                        type="password"
                        label="page.users.profile.input.newPassword"
                        invalid={sendFormPass && !!newPasswordValid}
                        feedbackText={sendFormPass && (newPasswordValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12">
                      <InputField
                        value={validNewPassword}
                        name="validNewPassword"
                        onChange={onInputChangePass}
                        type="password"
                        label="page.users.profile.input.validNewPassword"
                        invalid={sendFormPass && !!validNewPasswordValid}
                        feedbackText={sendFormPass && (validNewPasswordValid || null)}
                      />
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs="12" align="right">
                      <Button color="primary" onClick={fnChangePass}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                    </Colxx>
                  </Row>
                </TabPane>
                <TabPane tabId="2">
                  <Row>
                    <Colxx xxs={12} sm={4}>
                      <Checkbox
                        label="page.users.profile.input.signIn"
                        name="isLogIn"
                        value={isLogIn}
                        onChange={onInputChangeSettings}
                      />
                      <Checkbox
                        label="page.users.profile.input.isCashier"
                        name="isCashier"
                        value={isCashier}
                        onChange={onInputChangeSettings}
                      />
                      <Checkbox
                        label="page.users.profile.input.isSeller"
                        name="isSeller"
                        value={isSeller}
                        onChange={onInputChangeSettings}
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={4}>
                      <RadioGroup
                        label="page.users.profile.input.chasierType"
                        name="cashierType"
                        value={cashierType}
                        onChange={onInputChangeSettings}
                        options={[
                          { id: 1, label: "page.users.profile.input.cahsierType.cashier" },
                          { id: 2, label: "page.users.profile.input.cahsierType.super" }
                        ]}
                      />
                      <Checkbox
                        label="page.users.profile.input.editInvoice"
                        name="cashierEditInvoice"
                        value={cashierEditInvoice}
                        onChange={onInputChangeSettings}
                      />
                      <Checkbox
                        label="page.users.profile.input.reprintInvoice"
                        name="cashierRePrintInvoice"
                        value={cashierRePrintInvoice}
                        onChange={onInputChangeSettings}
                      />
                      <Checkbox
                        label="page.users.profile.input.nullInvoice"
                        name="cashierNullInvoice"
                        value={cashierNullInvoice}
                        onChange={onInputChangeSettings}
                      />
                      <Checkbox
                        label="page.users.profile.input.editPriceInvoice"
                        name="cashierEditPrice"
                        value={cashierEditPrice}
                        onChange={onInputChangeSettings}
                      />

                      {/* <Checkbox
                        label="page.users.profile.input.editPriceInvoice"
                        name="cashierEditPrice"
                        value={cashierEditPrice}
                        onChange={onInputChangeSettings}
                      /> */}
                    </Colxx>
                    <Colxx xxs={12} sm={4}>
                      <Checkbox
                        label="page.users.profile.input.sellerIsSupervisor"
                        name="sellerIsSupervisor"
                        value={sellerIsSupervisor}
                        onChange={onInputChangeSettings}
                      />
                      <InputField
                        label="page.users.profile.input.sellerCode"
                        name="sellerCode"
                        value={sellerCode}
                        onChange={onInputChangeSettings}
                      />
                      <Colxx xxs={12}>
                        <ContainerWithLabel label="page.users.profile.sellerComissions">
                          <InputField
                            label="page.users.profile.input.seller.minComissionPercent"
                            name="sellerMinPercentCommiss"
                            value={sellerMinPercentCommiss}
                            onChange={onInputChangeSettings}
                          />
                          <InputField
                            label="page.users.profile.input.seller.medComissionPercent"
                            name="sellerMedPercentCommiss"
                            value={sellerMedPercentCommiss}
                            onChange={onInputChangeSettings}
                          />
                          <InputField
                            label="page.users.profile.input.seller.maxComissionPercent"
                            name="sellerMaxPercentCommiss"
                            value={sellerMaxPercentCommiss}
                            onChange={onInputChangeSettings}
                          />
                        </ContainerWithLabel>
                      </Colxx>
                      <Colxx xxs={12}>
                        <RadioGroup
                          label="page.users.profile.input.seller.applyCommiss"
                          name="sellerApplyCommiss"
                          value={sellerApplyCommiss}
                          onChange={onInputChangeSettings}
                          options={[
                            { id: 1, label: "page.users.profile.input.seller.applyCommiss.all" },
                            { id: 2, label: "page.users.profile.input.seller.applyCommiss.cash" },
                            { id: 3, label: "page.users.profile.input.seller.applyCommiss.credit" }
                          ]}
                        />
                      </Colxx>
                    </Colxx>
                  </Row>
                  <hr />
                  <Row>
                    <Colxx>
                      <Button color="primary" onClick={fnSaveSettings}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                    </Colxx>
                  </Row>
                </TabPane>
              </TabContent>

              {/* <CardTitle>{IntlMessages("page.users.profile.title.changePass")}</CardTitle> */}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card className="mb-4">
            <CardBody>
              <Row>
                <Colxx xxs="4" xs="4" sm="3" md="3" lg="3" xl="3" className="boder-div">
                  <CardTitle>
                    {IntlMessages("page.users.profile.title.modules")}
                  </CardTitle>
                  <div className="nav-vertical">
                    <PerfectScrollbar
                      options={{ suppressScrollX: true, wheelPropagation: false }}
                    >
                      <Nav vertical className="list-unstyled">
                        {listModules.map((item) => {
                          return (
                            <NavItem
                              key={item.id}
                              className={classnames({
                                active: activeFirstTab === item.id
                              })}>
                              <NavLink
                                onClick={() => {
                                  setActiveFirstTab(item.id);
                                  fnFilterByModule(item.id, listUserModules);
                                  setModuleName(item.name);
                                }}
                              >
                                <p className="font-weight-medium mt-2 ">{item.name}</p>
                              </NavLink>
                            </NavItem>
                          );
                        })}
                      </Nav>
                    </PerfectScrollbar>
                  </div>
                </Colxx>
                <Colxx xxs="8" xs="8" sm="9" md="9" lg="9" xl="9">
                  <CardTitle className='mb-3'>{`${IntlMessages("page.users.profile.title.privileges")} - ${moduleName}`}</CardTitle>
                  <Nav tabs className="separator-tabs ml-0 mb-2">
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: activeTabPriv === '1',
                          'nav-link': true,
                        })}
                        onClick={() => {
                          setActiveTabPriv('1');
                          fnFilterByType(userModulesFilter);
                        }}
                      >
                        {IntlMessages("page.users.profile.tab.privileges.general")}
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({
                          active: activeTabPriv === '2',
                          'nav-link': true,
                        })}
                        onClick={() => {
                          setActiveTabPriv('2');
                          fnFilterByType(userModulesFilter);
                        }}
                      >
                        {IntlMessages("page.users.profile.tab.privileges.admin")}
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={activeTabPriv}>
                    <TabPane tabId="1">
                      <Row>
                        <Colxx xxs="12">
                          <DataTable
                            {...tableGeneralPriv}
                          />
                        </Colxx>
                      </Row>
                    </TabPane>
                    <TabPane tabId="2">
                      <Row>
                        <Colxx xxs="12">
                          <DataTable
                            {...tableAdminPriv}
                          />
                        </Colxx>
                      </Row>
                    </TabPane>
                  </TabContent>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPrivileges} />
      <Modal {...propsToModalEditPrivileges} />
      <Confirmation {...propsToMsgDelete} />
      <Button color="secondary" title={IntlMessages("button.back")} className="btn-float" onClick={fnBack}><i className="simple-icon-action-undo" /></Button>
    </>
  );
}
export default UserProfile;