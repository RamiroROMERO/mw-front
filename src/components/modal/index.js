import React from "react";
import { Modal, ModalBody } from "reactstrap";
import Header from './Header';

const ModalMW = (props)=>{
  const {title, ModalContent, open, setOpen, maxWidth, data }= props;
  return (
  <>
    <Modal
      isOpen={open}
      toggle={() => setOpen(!open)}
      fullscreen="md"
      size={maxWidth}
      backdrop="static"
      scrollable
    >
      <Header title={title} fnClose={setOpen} />
      <ModalContent data={data} setOpen={setOpen} />
    </Modal>
  </>
  )
}

export default ModalMW;