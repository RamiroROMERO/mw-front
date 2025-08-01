import moment from "moment";
import React, { useEffect, useState } from "react";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { IntlMessages } from "@Helpers/Utils";
import { InputLabel } from "@Components/inputLabel";

const DateTimeCalendar = (props) => {
  const { value, label = "calendar.input.title", onChange, disabled = false, name = "date", feedbackText = undefined } = props;

  const [controlDateTime, setControlDateTime] = useState(moment(value));

  useEffect(() => {
    console.log(controlDateTime.format("YYYY-MM-DD HH:mm:ss"))
    onChange({ target: { name, value: controlDateTime.format("YYYY-MM-DD HH:mm:ss") } })
  }, [controlDateTime])

  useEffect(() => {
    setControlDateTime(moment(value))
  }, [value])

  return (
    <InputLabel label={label}>
      <Datetime
        value={controlDateTime}
        onChange={(e) => setControlDateTime(e)}
        disabled={disabled}
        dateFormat={"DD/MM/YYYY"}
      />
      {feedbackText ?
        <div className="invalid-feedback d-block">{IntlMessages(feedbackText)}</div> : null
      }
    </InputLabel>
  );
}

export default DateTimeCalendar;