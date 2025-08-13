import React from "react";
import { Modal } from "reactstrap";
import Header from './Header';

const ModalMW = (props)=>{
  const {title, valueTitle="", ModalContent, open, setOpen, maxWidth, data }= props;
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
      <Header title={title} valueTitle={valueTitle} fnClose={setOpen} />
      <ModalContent data={data} setOpen={setOpen} />
    </Modal>
  </>
  )
}

export default ModalMW;