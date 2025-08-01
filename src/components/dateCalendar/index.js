import React from "react";
import ReactDatePicker from 'react-datepicker';
import { InputLabel } from "@Components/inputLabel";
import 'react-datepicker/dist/react-datepicker.css';

const DateCalendar = (props) => {
  const { value, label = "calendar.input.title", onChange, disabled = false, name = "date", feedbackText = undefined } = props;

  const onDateChange = (e) => {
    const eSet = e ? e.toJSON().slice(0, 10) : '';
    onChange({ target: { name, value: eSet } });
  }

  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <ReactDatePicker
        selected={value !== "" ? new Date(`${value}T12:00:00Z`) || '' : ""}
        onChange={onDateChange}
        disabled={disabled}
        dateFormat="dd/MM/yyyy"
        zone="00:00"
        isClearable
      />
    </InputLabel>
  );
}

export default DateCalendar;