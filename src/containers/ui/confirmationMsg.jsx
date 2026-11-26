import { Alert, Row, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";

// Ancho de la modal: por defecto 480px (CSS); `size` 'lg' (680px) o 'xl' (860px) para preguntas con textos largos. Nunca pasa del ancho de la ventana.
const SIZES = { lg: '680px', xl: '860px' };

const Confirmation = (props) => {
  const { open, setOpen, fnOnOk, title = "alert.question.title", textLegend = '', setCurrentItem, fnOnNo, size = '' } = props;

  const onDismiss = () => {
    if (setCurrentItem) {
      setCurrentItem({});
    }
    if (fnOnNo) {
      fnOnNo();
    }
    setOpen(false);
  };
  return (
    <>
    {/* Atenúa el resto de la pantalla para que el usuario se enfoque en la pregunta; no cierra al hacer clic (evita descartar la acción sin querer). */}
    {open && <div className="confirmation-backdrop" />}
    <div className="confirmation-container lg" style={SIZES[size] ? { width: SIZES[size] } : undefined}>
      <Alert className="notification-primary" isOpen={open}>
        <Row>
          <Colxx xxs="2">
            <i className="notification-icon bi bi-question-circle" />
          </Colxx>
          <Colxx xxs="10">
            <h4 className="alert-heading">{IntlMessages(title)}</h4>
            <br />
          </Colxx>
        </Row>
        {(textLegend !== '' && textLegend !== '') && <Row><Colxx xxs={12}><p>{textLegend}</p></Colxx></Row>}
        <hr className="my-3" />
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button outline color="danger" onClick={fnOnOk}><i className="bi bi-check-lg" /> {IntlMessages("alert.question.yes")}</Button>
            {/* </Colxx>
          <Colxx xxs="6" align="right"> */}
            <Button outline color="primary" onClick={onDismiss}><i className="bi bi-x-lg" /> {IntlMessages("alert.question.no")}</Button>
          </Colxx>
        </Row>
      </Alert>
    </div>
    </>
  );
};

export default Confirmation;
