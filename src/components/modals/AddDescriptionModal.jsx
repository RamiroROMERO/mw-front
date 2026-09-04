import { useState } from 'react'
import { ModalBody, ModalFooter, Button } from 'reactstrap'
import Modal from '@Components/modal'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'

const AddDescriptionContent = ({ data, setOpen }) => {
  const { type, onConfirm } = data
  const [value, setValue] = useState(type === 'number' ? 0 : '')

  const handleConfirm = () => {
    onConfirm(value)
    setOpen(false)
  }

  return (
    <>
      <ModalBody>
        <InputField
          name="addDescriptionValue"
          type={type}
          value={value}
          onChange={(e) => setValue(type === 'number' ? Number(e.target.value) : e.target.value)}
          autoFocus
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => setOpen(false)}>
          <i className="bi bi-x-circle" /> {IntlMessages('button.cancel2')}
        </Button>
        <Button color="primary" onClick={handleConfirm}>
          <i className="bi bi-check2" /> {IntlMessages('button.accept')}
        </Button>
      </ModalFooter>
    </>
  )
}

// Mismo contrato del catálogo: { isOpen, onClose, onConfirm, title }.
// `type` es específico de este modal: 'text' (default, err_add_description), 'textarea'
// (err_comment) o 'number' (err_select_value — ver corrección de contenido en mapping.md).
export const AddDescriptionModal = ({ isOpen, onClose, onConfirm, title, type = 'text' }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      setOpen={(next) => { if (!next) onClose() }}
      ModalContent={AddDescriptionContent}
      data={{ type, onConfirm }}
      maxWidth="sm"
    />
  )
}
