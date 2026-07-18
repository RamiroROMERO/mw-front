import React from "react";
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { InputLabel } from "@Components/inputLabel";

const pad = (n) => String(n).padStart(2, '0');

// Antes esto se armaba con react-datetime + moment; se unifica sobre
// react-datepicker (ya la librería dominante para fechas en el resto de la
// app, ver src/components/dateCalendar) agregando showTimeSelect. El formato
// de salida ("YYYY-MM-DD HH:mm:ss") se mantiene igual para no romper a los
// consumidores que guardan ese string tal cual.
const DateTimeCalendar = (props) => {
  const { value, label = "calendar.input.title", onChange, disabled = false, name = "date", feedbackText = undefined } = props;

  const selected = value ? new Date(value) : null;

  const onDateTimeChange = (date) => {
    if (!date) {
      onChange({ target: { name, value: '' } });
      return;
    }
    const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    onChange({ target: { name, value: formatted } });
  };

  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <ReactDatePicker
        selected={selected}
        onChange={onDateTimeChange}
        disabled={disabled}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={5}
        dateFormat="dd/MM/yyyy HH:mm"
        isClearable
      />
    </InputLabel>
  );
}

export default DateTimeCalendar;
