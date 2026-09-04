import { ModalBody, ModalFooter, Button } from 'reactstrap'
import Modal from '@Components/modal'
import { IntlMessages } from '@Helpers/Utils'

const variantIcon = {
  info: 'bi-info-circle text-success',
  warning: 'bi-exclamation-triangle text-warning',
  help: 'bi-question-circle text-primary',
}

const MessageContent = ({ data, setOpen }) => {
  const { message, variant, buttons, onConfirm } = data

  const handleAccept = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <>
      <ModalBody className="d-flex align-items-center">
        <i className={`bi ${variantIcon[variant] || variantIcon.info} me-2`} style={{ fontSize: '1.5rem' }} />
        {message && <p className="mb-0">{IntlMessages(message)}</p>}
      </ModalBody>
      <ModalFooter>
        {buttons && buttons.length > 0
          ? buttons.map((btn, idx) => (
            <Button key={idx} color={btn.color || 'primary'} onClick={() => { btn.onClick?.(); setOpen(false) }}>
              {IntlMessages(btn.label)}
            </Button>
          ))
          : <Button color="primary" onClick={handleAccept}>
            <i className="bi bi-check2" /> {IntlMessages('button.accept')}
          </Button>}
      </ModalFooter>
    </>
  )
}

// Mismo contrato del catálogo: { isOpen, onClose, onConfirm, title }.
// `message` (opcional) y `variant: 'info' | 'warning' | 'help'` son específicos de este modal
// (color/ícono de cabecera, cubren error_2/error_3/error_4). `buttons` opcional
// ([{label, onClick, color}]) reemplaza el Aceptar único cuando hace falta más de una acción
// (equivalente al addbutton/fnclickbutton dinámico del legacy error_4).
export const MessageModal = ({ isOpen, onClose, onConfirm, title, message, variant = 'info', buttons }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      setOpen={(next) => { if (!next) onClose() }}
      ModalContent={MessageContent}
      data={{ message, variant, buttons, onConfirm }}
      maxWidth="sm"
    />
  )
}
