import { useState } from 'react'
import { ModalBody, ModalFooter, Button } from 'reactstrap'
import Modal from '@Components/modal'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'

const SeekTextContent = ({ data, setOpen }) => {
  const { onConfirm } = data
  const [value, setValue] = useState('')

  const handleConfirm = () => {
    onConfirm(value)
    setOpen(false)
  }

  return (
    <>
      <ModalBody>
        <InputField
          name="seekTextValue"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleConfirm}>
          <i className="bi bi-check2" /> {IntlMessages('button.accept')}
        </Button>
      </ModalFooter>
    </>
  )
}

// Contrato común del catálogo de modales genéricos (specs/02-framework-compartido):
// { isOpen, onClose, onConfirm, title } — construido sobre el shell @Components/modal.
export const SeekTextModal = ({ isOpen, onClose, onConfirm, title }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      setOpen={(next) => { if (!next) onClose() }}
      ModalContent={SeekTextContent}
      data={{ onConfirm }}
      maxWidth="sm"
    />
  )
}
