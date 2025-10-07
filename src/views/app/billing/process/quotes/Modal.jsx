import React from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";

const Modal = (props) => {
  const { data, setOpen } = props;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">

          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
      <Button color="primary" onClick={()=>{}}>
        <i className="iconsminds-save" /> {IntlMessages("button.save")}
      </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default Modal;