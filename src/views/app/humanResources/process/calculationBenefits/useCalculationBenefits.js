import { useEffect, useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';
import { request } from '@Helpers/core';

export const useCalculationBenefits = ({ setLoading, adminControl }) => {
  const [totalBenefits, setTotalBenefits] = useState(0);
  const [listEmployees, setListEmployees] = useState([]);
  const [listTypes, setListTypes] = useState([]);
  const [dataBenefits, setDataBenefits] = useState([]);
  const [otherPayments, setOtherPayments] = useState([]);
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.005")?.active || false;

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/employees/findSL?status=1', (resp) => {
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

    setListTypes([
      {value: 1, label: "Despido"},
      {value: 2, label: "Renuncia"}
    ])

  }, []);

  const propsToHeader = {
    listEmployees,
    listTypes,
    setLoading,
    enableGenerateReport,
    otherPayments,
    totalBenefits,
    setDataBenefits
  }

  return (
    {
      dataBenefits,
      totalBenefits,
      setOtherPayments,
      setTotalBenefits,
      propsToHeader
    }
  )
}
