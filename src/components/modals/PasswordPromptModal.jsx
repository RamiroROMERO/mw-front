import { useState } from 'react'
import { ModalBody, ModalFooter, Button } from 'reactstrap'
import Modal from '@Components/modal'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'

const PasswordPromptContent = ({ data, setOpen }) => {
  const { onConfirm } = data
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (value === '') {
      setError('msg.required.input.password')
      return
    }
    onConfirm(value)
    setOpen(false)
  }

  return (
    <>
      <ModalBody>
        <InputField
          name="passwordPromptValue"
          type="password"
          label="user.password"
          value={value}
          onChange={(e) => { setError(''); setValue(e.target.value) }}
          feedbackText={error || undefined}
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
// onConfirm(password: string) — cubre error_pass (confirmar una acción con contraseña
// de administrador). No estaba en la lista de candidatos original del spec (ver mapping.md).
export const PasswordPromptModal = ({ isOpen, onClose, onConfirm, title }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      setOpen={(next) => { if (!next) onClose() }}
      ModalContent={PasswordPromptContent}
      data={{ onConfirm }}
      maxWidth="sm"
    />
  )
}
