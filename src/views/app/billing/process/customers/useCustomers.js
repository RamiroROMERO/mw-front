import { useEffect, useState } from "react";
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import notification from '@/containers/ui/Notifications';
import { validInt } from "@/helpers/Utils";

export const useCustomers = ({ setLoading }) => {

  const [openModalViewCust, setOpenModalViewCust] = useState(false);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [listTypeCustomers, setListTypeCustomers] = useState([]);
  const [dataCustomers, setDataCustomers] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [isFarmControl, setIsFarmControl] = useState(false);
  const [isHospital, setIsHospital] = useState(false);
  const [listDepartments, setListDepartments] = useState([]);
  const [listMunicipalities, setListMunicipalities] = useState([]);


  const customersValid = {
    idTypeCont: [(val) => validInt(val) > 0, "msg.required.input.typeCustomer"],
    rtn: [(val) => val !== "", "msg.required.input.dni"],
    nomcli: [(val) => val !== "", "msg.required.input.name"],
    fechai: [(val) => val !== "", "msg.required.input.date"],
    solcredi: [(val) => validInt(val) > 0, "msg.required.radio.creditRequest"],
    numccxc: [(val) => val !== "", "msg.required.select.receivable"],
    numcdes: [(val) => val !== "", "msg.required.select.discountAccount"],
    numcimp: [(val) => val !== "", "msg.required.select.taxAccount"],
    deptoCode: [(val) => val !== "", "msg.required.select.department"],
    municCode: [(val) => val !== "", "msg.required.select.municipality"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    idTypeCont: 0,
    tipocli: 0,
    rtn: '',
    nomcli: '',
    fechai: '',
    tel: '',
    email: '',
    direcc: '',
    solcredi: 0,
    diascre: 0,
    limcred: 0,
    payter: '',
    isInter: false,
    isPartner: false,
    pagaiva: false,
    defaPos: false,
    nombrec: '',
    cargoc: '',
    telec: '',
    celuc: '',
    correoc: '',
    nombrep: '',
    cargop: '',
    telep: '',
    celup: '',
    correop: '',
    numccxc: '',
    numcdes: '',
    numcimp: '',
    numcfle: '',
    numcbon: '',
    exoneratedNumber: '',
    persem: false,
    permen: false,
    perqui: false,
    pertri: false,
    status: true,
    productor: false,
    prod_cert: false,
    defaHosp: false,
    type: 1,
    billOuts: false,
    deptoCode: '',
    municCode: ''

  }, customersValid);

  const fnViewCustomer = (item) => {
    if (!item.payter) item.payter = '';
    onMunicRefresh(item.deptoCode);
    setBulkForm(item);
    setOpenModalViewCust(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('billing/settings/customers/', (resp) => {
      const data = resp.data.map((item) => {
        item.typeCustomer = item.customerTypeData ? item.customerTypeData.name : ""
        // item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
        //   <i className="medium-icon bi bi-square" />
        // item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnViewCustomer(item)} />
        return item;
      });
      setDataCustomers(data);
      setOpenModalViewCust(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListLedgerAccounts(listAccounts);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    request.GET('admin/locateDeptos/getSL', resp => {
      const listDeptos = resp.data.map(item => {
        return {
          name: item.name,
          id: item.code
        }
      });
      setListDepartments(listDeptos);
    }, err => { })

    request.GET('admin/customerTypes', (resp) => {
      const listCustomersTypes = resp.data;
      setListTypeCustomers(listCustomersTypes);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    const companyData = JSON.parse(localStorage.getItem("mw_current_company"));
    if (companyData) {
      setIsFarmControl(companyData.isFarmControl);
      setIsHospital(companyData.isHospital);
    }

  }, []);

  const fnNewCustomer = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSearchCustomer = () => {
    fnGetData();
  }

  const fnSaveCustomer = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (validInt(solcredi) === 1) {
      if (validInt(diascre) === 0) {
        notification('warning', 'msg.required.input.creditDays', 'alert.warning.title');
        return;
      }
      if (validInt(limcred) === 0) {
        notification('warning', 'msg.required.input.creditLimit', 'alert.warning.title');
        return;
      }
    }

    const newData = {
      fechai,
      rtn,
      nomcli,
      idTypeCont,
      tel,
      direcc,
      email,
      nombrec,
      cargoc,
      telec,
      celuc,
      correoc,
      nombrep,
      cargop,
      telep,
      celup,
      correop,
      solcredi,
      persem,
      perqui,
      permen,
      pertri,
      diascre,
      limcred,
      tipocli,
      defaPos,
      isPartner,
      isInter,
      pagaiva,
      numccli: numccxc,
      numccxc,
      numcdes,
      numcimp,
      numcfle,
      numcbon,
      payter,
      status,
      productor,
      prod_cert,
      exoneratedNumber,
      defaHosp,
      type,
      billOuts,
      deptoCode,
      municCode
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`billing/settings/customers/${id}`, newData, (resp) => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('billing/settings/customers/', newData, (resp) => {
        setSendForm(false);
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnPrintCustomer = () => { }

  const fnDeleteCustomer = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`billing/settings/customers/${id}`, (resp) => {
      fnNewCustomer();
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnLedgerAccounts = () => {
    const selectFilter = listTypeCustomers.filter(item => {
      return item.id === validInt(idTypeCont);
    });
    if (selectFilter.length > 0) {
      const accounts = {
        numccli: selectFilter[0].idCtaCxp,
        numccxc: selectFilter[0].idCtaCxp,
        numcdes: selectFilter[0].idCtaDesc,
        numcimp: selectFilter[0].idCtaIva,
        numcfle: selectFilter[0].idCtaFlete,
        numcbon: selectFilter[0].idCtaBon
      }
      setBulkForm(accounts);
    } else {
      notification('warning', 'msg.required.input.typeCustomer', 'alert.warning.title');
    }
  }

  const onDeptoChange = ({ target }) => {
    setListMunicipalities([]);
    const { value } = target;
    onInputChange({ target: { name: 'deptoCode', value } });
    onMunicRefresh(value, '');
  }

  const onMunicRefresh = (deptoCode) => {
    request.GET(`admin/locateMunic/getSL?codeDepto=${deptoCode}`, resp => {
      const listMunic = resp.data.map(item => {
        return {
          id: item.code,
          name: item.name
        }
      });
      setListMunicipalities(listMunic);
      // if (municCode) {
      //   onInputChange({ target: { name: 'municCode', value: municCode } });
      // }
    }, err => console.error(err))

  }

  const fnExportToExcel = () => { }

  const propsToControlPanel = {
    fnNew: fnNewCustomer,
    fnSearch: fnSearchCustomer,
    fnSave: fnSaveCustomer,
    fnPrint: fnPrintCustomer,
    fnDelete: fnDeleteCustomer,
    buttonsHome: [
      {
        title: "button.ledgerAccounts",
        icon: "bi bi-journal-text",
        onClick: fnLedgerAccounts
      },
      {
        title: "button.export",
        icon: "bi bi-file-earmark-excel",
        onClick: fnExportToExcel
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return {
    formState,
    formValidation,
    openModalViewCust,
    listLedgerAccounts,
    listTypeCustomers,
    dataCustomers,
    sendForm,
    fnSearchCustomer,
    fnNewCustomer,
    propsToControlPanel,
    isFarmControl,
    isHospital,
    fnDelete,
    fnViewCustomer,
    onInputChange,
    listDepartments,
    listMunicipalities,
    onDeptoChange,
    setOpenModalViewCust
  }
}
