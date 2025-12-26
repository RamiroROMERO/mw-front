import React from "react";
import { Modal } from "reactstrap";
import Header from './Header';

const ModalMW = (props) => {
  const { title, valueTitle = "", ModalContent, open, setOpen, maxWidth, data, fullscreen = false } = props;
  // console.log({ title, fullscreen });
  return (
    <>
      <Modal
        isOpen={open}
        toggle={() => setOpen(!open)}
        size={maxWidth}
        fullscreen={fullscreen || "sm"}
        backdrop={true}
        fade={true}
      // scrollable
      >
        <Header title={title} valueTitle={valueTitle} fnClose={setOpen} />
        <ModalContent data={data} setOpen={setOpen} />
      </Modal>
    </>
  )
}

export default ModalMW;