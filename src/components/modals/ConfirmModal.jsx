import { ModalBody, ModalFooter, Button } from 'reactstrap'
import Modal from '@Components/modal'
import { IntlMessages } from '@Helpers/Utils'

const ConfirmContent = ({ data, setOpen }) => {
  const { message, labels, onConfirm } = data

  const handleClick = (accepted) => {
    onConfirm(accepted)
    setOpen(false)
  }

  return (
    <>
      <ModalBody>
        {message && <p className="mb-0">{IntlMessages(message)}</p>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => handleClick(true)}>
          <i className="bi bi-check2" /> {IntlMessages(labels[0])}
        </Button>
        <Button color="secondary" onClick={() => handleClick(false)}>
          <i className="bi bi-x-circle" /> {IntlMessages(labels[1])}
        </Button>
      </ModalFooter>
    </>
  )
}

// Mismo contrato del catálogo: { isOpen, onClose, onConfirm, title }.
// `message` (opcional) y `labels` son específicos de este modal: `onConfirm(true)` = primer botón,
// `onConfirm(false)` = segundo botón — cubre tanto Sí/No genérico (error_1) como botones con
// texto propio (error_fpag, ej. labels=['page...cash','page...bankTransfer']).
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, labels = ['alert.question.yes', 'alert.question.no'] }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      setOpen={(next) => { if (!next) onClose() }}
      ModalContent={ConfirmContent}
      data={{ message, labels, onConfirm }}
      maxWidth="sm"
    />
  )
}
