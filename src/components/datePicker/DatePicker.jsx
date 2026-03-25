import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';

export const DatePicker = ({ label, name, value, onChange }) => {
  const [myDate, setMyDate] = useState(new Date());

  useEffect(() => {
  }, [value])

  const onChangeMyDate = (selectDate) => {
    setMyDate(selectDate);
    onChange(selectDate);
  }

  return (
    <ReactDatePicker
      selected={myDate}
      onChange={onChangeMyDate}
      timeFormat="HH:mm"
      dateFormat="dd/MM/yyyy HH:mm"
      showTimeInput
      timeInputLabel="Hora:"
      style={{ resize: "none", boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)" }}
    />
  )
}
