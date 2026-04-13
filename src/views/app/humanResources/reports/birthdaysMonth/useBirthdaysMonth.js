import { request } from '@/helpers/core';
import { fnGetRandomColor } from '@/helpers/Utils';
import { useEffect, useRef, useState } from 'react'

export const useBirthdaysMonth = ({ setLoading }) => {
  const [dataBirthdays, setDataBirthdays] = useState([]);
  const currentYear = new Date().getFullYear();

  const contentRef = useRef();

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/employees?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        const numColor = Math.floor(Math.random() * 39);
        const colorCode = fnGetRandomColor(numColor);
        const birthday = new Date(`${item.birthday}T12:00:00Z`);
        let month = birthday.getMonth() + 1;
        let day = birthday.getDate();

        if (day < 10) {
          day = `0${day}`;
        }
        if (month < 10) {
          month = `0${month}`;
        }

        return {
          idWorkSheduling: item.id,
          title: `${item.firstName}  ${item.secondName}  ${item.lastName}  ${item.secondLastName}`,
          start: `${currentYear}-${month}-${day}`,
          end: `${currentYear}-${month}-${day}`,
          color: colorCode}
      });
      setDataBirthdays(employees);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(()=>{
    fnGetData();
  },[]);

  return (
    {
      dataBirthdays,
      contentRef
    }
  )
}
