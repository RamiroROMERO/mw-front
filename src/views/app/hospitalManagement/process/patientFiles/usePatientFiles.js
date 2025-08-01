import { useEffect, useState } from 'react'
import { IntlMessages, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { formatDate } from '@Helpers/Utils';

export const usePatientFiles = ({ setLoading }) => {
  const [listNationalities, setListNationalities] = useState([]);
  const [listGenders, setListGenders] = useState([]);
  const [listCivilStatus, setListCivilStatus] = useState([]);
  const [listStates, setListStates] = useState([]);
  const [listCities, setListCities] = useState([]);
  const [listAreas, setListAreas] = useState([]);
  const [listDoctors, setListDoctors] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalSearch, setOpenModalSearch] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openModalEvents, setOpenModalEvents] = useState(false);

  const validation = {
    dateIn: [(val) => val !== "", IntlMessages("msg.required.input.date")],
    dni: [(val) => val.length > 12 && val.length <= 16, IntlMessages("msg.required.input.dni")],
    firstName: [(val) => val.length > 5, IntlMessages("msg.required.input.firstName")],
    lastName: [(val) => val.length > 5, IntlMessages("msg.required.input.lastName")],
    birthDay: [(val) => val !== "", IntlMessages("msg.required.input.birthDay")],
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    dateIn: '',
    dni: '',
    name: '',
    code: '',
    firstName: '',
    secondName: '',
    lastName: '',
    secondLastName: '',
    birthDay: '',
    natinalityId: 0,
    genderId: 0,
    civilStatusId: 0,
    phone: '',
    phone2: '',
    email: '',
    address: '',
    contactName1: '',
    contactPhone1: '',
    contactName2: '',
    contactPhone2: '',
    estateCode: '',
    cityCode: '',
    status: true
  }, validation);

  const { id, code, dni, firstName, secondName, lastName, secondLastName } = formState;

  const [tableEvents, setTableEvents] = useState({
    title: IntlMessages("table.title.eventsHeld"),
    columns: [
      {
        text: IntlMessages("input.date"), dataField: "date", headerStyle: { 'width': '20%' },
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      { text: IntlMessages("table.column.type"), dataField: "typeName", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.principalDoctor"), dataField: "principalDoctor", headerStyle: { 'width': '45%' } },
      {
        text: IntlMessages("table.column.noInvoice"), dataField: "invoiceNumber", headerStyle: { 'width': '20%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: []
  });

  const onStateChange = e => {
    const state = e.target.value;

    setLoading(true);
    request.GET(`admin/locateMunic?codeDepto=${state}`, (resp) => {
      const munic = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: item.name,
          codeDepto: item.codeDepto
        }
      });
      setListCities(munic);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    onBulkForm({ estateCode: state });
  }

  const fnNewDocument = () => {
    onResetForm();
    setTableEvents({ ...tableEvents, data: [] });
    setSendForm(false);
  }

  const fnSearchDocument = () => {
    setOpenModalSearch(true);
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    formState.name = `${firstName} ${secondName} ${lastName} ${secondLastName}`;

    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('hospital/process/expedients', formState, (resp) => {
        setLoading(false);
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`hospital/process/expedients/${id}`, formState, (resp) => {
        setLoading(false);
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    }
  }

  const fnPrintDocument = () => { }

  const fnDeleteDocument = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnOkDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(id) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`hospital/process/expedients/${id}`, (resp) => {
      setLoading(false);
      fnNewDocument();
    }, (err) => {
      setLoading(false);
    });
  }

  const fnNewEvent = () => {
    if (validInt(id) === 0) {
      return;
    }
    setOpenModalEvents(true);
  }

  const fnGetEvents = (idFather) => {
    setLoading(true);
    request.GET(`hospital/process/events?fatherId=${idFather}`, (resp) => {
      const data = resp.data.map((item) => {
        item.principalDoctor = item.specialist1?.name || ''
        item.typeName = item.typeId === 1 ? 'Evento' : 'Hospitalización'
        return item
      });
      setTableEvents({ ...tableEvents, data });
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

  const fnGenerateId = () => {
    let generic1 = 0, generic2 = 0, generic3 = 0;

    do {
      generic1 = Math.round(Math.random() * 10000);
    } while (generic1 < 1830)

    do {
      generic2 = Math.round(Math.random() * 10000);
    } while (generic2 < 2100)

    do {
      generic3 = Math.round(Math.random() * 100000);
    } while (generic3 < 10000)

    onInputChange({ target: { name: 'dni', value: `${generic1}-${generic2}-${generic3}`, type: 'text' } });
  }



  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/settings/nationalities', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListNationalities(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/genders', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListGenders(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/civilStatuses', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListCivilStatus(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/locateDeptos', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.code
        item.label = item.name
        return item;
      });
      setListStates(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/areas', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListAreas(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });

    setLoading(true);
    request.GET('hospital/settings/specialists', (resp) => {
      const data = resp.data.map((item) => {
        item.value = item.id
        item.label = item.name
        return item;
      });
      setListDoctors(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: fnDeleteDocument,
    buttonsHome: [
      {
        title: "button.genericId",
        icon: "bi bi-shuffle",
        onClick: fnGenerateId
      },
      {
        title: "button.event",
        icon: "bi bi-plus-lg",
        onClick: fnNewEvent
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetail = {
    formState,
    onInputChange,
    onStateChange,
    formValidation,
    sendForm,
    listNationalities,
    listGenders,
    listCivilStatus,
    listStates,
    listCities,
    tableEvents
  }

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDelete
  };

  const dataModalEvents = {
    setLoading,
    idPatientFile: id,
    codeFile: code,
    dni,
    namePatient: `${firstName} ${secondName} ${lastName} ${secondLastName}`,
    listAreas,
    listDoctors,
    fnGetEvents
  }

  return (
    {
      propsToControlPanel,
      propsToDetail,
      openModalSearch,
      setOpenModalSearch,
      onBulkForm,
      setListCities,
      propsToMsgDelete,
      openModalEvents,
      setOpenModalEvents,
      dataModalEvents,
      fnGetEvents
    }
  )
}
