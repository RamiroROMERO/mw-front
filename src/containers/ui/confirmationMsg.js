import React from 'react';
import { Alert, Row, Button } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";

const Confirmation = (props) => {
  const { open, setOpen, fnOnOk, title = "alert.question.title", textLegend = '', setCurrentItem, fnOnNo } = props;

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
    <div className="confirmation-container lg">
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
  );
};

export default Confirmation;
