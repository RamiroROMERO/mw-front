import { createPortal } from 'react-dom';
import ReactDatePicker from 'react-datepicker';
import { InputLabel } from "@Components/inputLabel";
import 'react-datepicker/dist/react-datepicker.css';

// El popup se dibuja en `document.body`: dentro de su tarjeta quedaba en el contexto de apilamiento de ésta y la tarjeta siguiente (la tabla)
// lo tapaba. Con el portal ningún contenedor lo recorta ni lo cubre (también dentro de modales).
const renderInBody = ({ children }) => createPortal(children, document.body);

const DateCalendar = (props) => {
  const { value, label = "calendar.input.title", onChange, disabled = false, name = "date", feedbackText = undefined, maxDate = undefined } = props;

  const onDateChange = (e) => {
    const eSet = e ? e.toJSON().slice(0, 10) : '';
    onChange({ target: { name, value: eSet } });
  }

  return (
    <InputLabel label={label} feedbackText={feedbackText}>
      <ReactDatePicker
        selected={value !== "" ? new Date(`${value.slice(0, 10)}T12:00:00Z`) : ""}
        onChange={onDateChange}
        disabled={disabled}
        dateFormat="dd/MM/yyyy"
        maxDate={maxDate}
        zone="00:00"
        isClearable
        popperContainer={renderInBody}
      />
    </InputLabel>
  );
}

export default DateCalendar;