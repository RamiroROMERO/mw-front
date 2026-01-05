import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { Card, CardBody, Row } from 'reactstrap';
import { request } from '@Helpers/core';
import { formatDate, formatNumber, validFloat, validInt } from '@Helpers/Utils';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import ModalTypeSheet from '@Components/modalTypeSheet';
import ModalViewPayroll from './ModalViewPayroll';
import HeaderPayroll from './HeaderPayroll';
import DetailTable from './DetailTable';
import createNotification from '@Containers/ui/Notifications';
import Confirmation from '@Containers/ui/confirmationMsg';

const BiweeklyPayroll = ({ setLoading }) => {
  const [listBiweeklies, setListBiweeklies] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [listJobPositions, setListJobPositions] = useState([]);
  const [listPaymentMethod, setListPaymentMethod] = useState([]);
  const [dataPayrolls, setDataPayrolls] = useState([]);
  const [dataDetailPayroll, setDataDetailPayroll] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalPayrolls, setOpenModalPayrolls] = useState(false);
  const [typeSheet, setTypeSheet] = useState(1);
  const [employeeId, setEmployeeId] = useState(0);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const biweeklyPayrollValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    biweekId: [(val) => validInt(val) > 0, "msg.required.select.biweekId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    biweekId: 0,
    notes: '',
    previousPayroll: 0
  }, biweeklyPayrollValid);

  const { id, date, biweekId, notes, previousPayroll } = formState;

  const fnNewPayroll = () => {
    onResetForm();
    setSendForm();
    setDataDetailPayroll([]);
  }

  const fnGeneratePayroll = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const findBiweek = listBiweeklies.find((item) => {
      return item.value === validInt(biweekId);
    });

    const newData = {
      date,
      biweekId,
      dateStart: findBiweek.dateIn,
      dateEnd: findBiweek.dateOut,
      notes,
      status: 1
    }

    if (id === 0) {
      if (previousPayroll === 0) {
        request.GET(`rrhh/process/payrollBiweeklies?biweekId=${biweekId}`, (resp) => {
          const payrollBiweekly = resp.data;
          if (payrollBiweekly.length === 0) {
            setLoading(true);
            request.POST('rrhh/process/payrollBiweeklies', newData, (resp2) => {
              onInputChange({ target: { name: 'id', value: resp2.data.id } });
              setLoading(false);
            }, (err) => {

              setLoading(false);
            });
          } else {
            createNotification('warning', 'msg.alert.payroll.generate', 'alert.warning.title');
            return;
          }
          setLoading(false);
        }, (err) => {

          setLoading(false);
        });
      }
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/payrollBiweeklies/${id}`, newData, () => {
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnGetPayrolls = () => {
    setLoading(true);
    request.GET(`rrhh/process/payrollBiweeklies`, (resp) => {
      const payrollBiweekly = resp.data.map((item) => {
        item.biweekly = `${formatDate(item.dateStart)} - ${formatDate(item.dateEnd)}`
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataPayrolls(payrollBiweekly);
      setOpenModalPayrolls(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnViewDetailPayroll = (idPayroll) => {
    setLoading(true);
    request.GET(`rrhh/process/payrollBiweeklyDetail?fatherId=${idPayroll}`, (resp) => {
      const payrollDeta = resp.data.map(item => {
        item.employee = `${item.rrhhEmployee?.firstName} ${item.rrhhEmployee?.secondName} ${item.rrhhEmployee?.lastName} ${item.rrhhEmployee?.secondLastName}` || ''
        item.jobPosition = item.rrhhJobPosition?.name || ''
        item.totalIncomesVal = formatNumber(validFloat(item.totalIncomes))
        item.totalDeductionsVal = formatNumber(validFloat(item.totalDeductions))
        item.totalPaymentVal = formatNumber(validFloat(item.totalPayment))
        return item;
      });
      setDataDetailPayroll(payrollDeta);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnPrintPayroll = async () => {
    setLoading(true);
    let data = {
      where: {
        id
      },
      fields: [
        { title: 'Empleado', field: 'employeeName', type: 'String', length: 120 },
        { title: 'Cargo', field: 'positionName', type: 'String', length: 70, isSum: false, curreny: false },
        { title: 'Forma de Pago', field: 'paymentMethod', type: 'String', length: 70, isSum: false, curreny: false },
        { title: 'Días Trabajados', field: 'daysWorked', type: 'decimal', length: 40, isSum: false, currency: false },
        { title: 'Pago Quincenal', field: 'incBiweekly', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Pago Extra', field: 'totalincOvertime', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Otros Ingresos', field: 'incOthers', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Total Ingresos', field: 'totalIncomes', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'ISR', field: 'deducIsr', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'IHSS', field: 'deducIhss', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'RAP', field: 'deducRap', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Deducciones Internas', field: 'internalDeductions', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Deducciones Externas', field: 'externalDeductions', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Total Deducciones', field: 'totalDeductions', type: 'decimal', length: 50, isSum: true, currency: true },
        { title: 'Total Payment', field: 'totalPayment', type: 'decimal', length: 50, isSum: true, currency: true }
      ],
      headerData: [],
      reportTitle: "Planilla Quincenal",
      nameXLSXFile: "BiweeklyPayroll.xlsx",
    };
    await request.fnExportToXLSX("rrhh/process/payrollBiweeklies/exportPayrollXLXS", data, "BiweeklyPayroll.xlsx");
    setLoading(false);
  }

  const fnCancelPayroll = () => {
    if (id > 0) {
      setOpenMsgQuestion(true)
    }
  }

  const fnOkCancelPayroll = () => {
    const dataCancel = {
      status: 0
    }
    setLoading(true);
    request.PUT(`rrhh/process/payrollBiweeklies/${id}`, dataCancel, (resp) => {
      setOpenMsgQuestion(false);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnPrintPaymentReceipt = () => {
    if (id > 0) {
      setEmployeeId(0);
      setOpenModalPrint(true);
    }
  }

  const fnPrintDocument = () => {
    const dataPrint = {
      id,
      typeSheet,
      employeeId
    }
    request.GETPdf('rrhh/process/payrollBiweeklies/exportPDFReceipt', dataPrint, 'Comprobante de Pago.pdf', (err) => {

      setLoading(false);
      setOpenModalPrint(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/employees/findForPayroll', (resp) => {
      const employees = resp.data.map((item) => {
        item.value = item.id
        item.label = `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        return item;
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/process/byweeklies', (resp) => {
      const biweekly = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${formatDate(item.dateIn)} al ${formatDate(item.dateOut)}`,
          dateIn: item.dateIn,
          dateOut: item.dateOut
        }
      });
      setListBiweeklies(biweekly);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/jobPositions', (resp) => {
      const positions = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      setListJobPositions(positions);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/paymentMethods', (resp) => {
      const paymentMethod = resp.data;
      setListPaymentMethod(paymentMethod);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewPayroll,
    fnSearch: fnGetPayrolls,
    fnSave: fnGeneratePayroll,
    fnPrint: fnPrintPayroll,
    fnCancel: fnCancelPayroll,
    buttonsHome: [
      {
        title: "button.printPaymentReceipt",
        icon: "bi bi-printer",
        onClick: fnPrintPaymentReceipt
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToHeaderPayroll = {
    date,
    biweekId,
    notes,
    previousPayroll,
    listBiweeklies,
    formValidation,
    sendForm,
    onInputChange,
    setBulkForm,
    setLoading
  }

  const propsToDetailTable = {
    idPayroll: id,
    date,
    biweekId,
    dataDetailPayroll,
    listEmployees,
    listBiweeklies,
    listJobPositions,
    listPaymentMethod,
    setLoading,
    fnViewDetailPayroll,
    setOpenModalPrint,
    setEmployeeId
  }

  const propsToModalPayrolls = {
    ModalContent: ModalViewPayroll,
    title: "page.biweeklyPayroll.modal.viewPayrolls.title",
    open: openModalPayrolls,
    setOpen: setOpenModalPayrolls,
    maxWidth: 'lg',
    data: {
      dataPayrolls,
      setBulkForm,
      fnViewDetailPayroll
    }
  }

  const propsToModalPrint = {
    ModalContent: ModalTypeSheet,
    title: "button.printPaymentReceipt",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: "sm",
    data: {
      typeSheet,
      setTypeSheet,
      disabledOpt: 3,
      fnPrintDocument
    }
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkCancelPayroll,
    title: "alert.question.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <HeaderPayroll {...propsToHeaderPayroll} />
              <DetailTable {...propsToDetailTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPayrolls} />
      <Modal {...propsToModalPrint} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default BiweeklyPayroll