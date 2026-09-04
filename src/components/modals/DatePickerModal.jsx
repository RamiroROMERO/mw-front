import { useState } from 'react'
import { ModalBody, ModalFooter, Button } from 'reactstrap'
import Modal from '@Components/modal'
import DateCalendar from '@Components/dateCalendar'
import { IntlMessages } from '@Helpers/Utils'

const DatePickerContent = ({ data, setOpen }) => {
  const { mode, onConfirm } = data
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (mode === 'range') {
      if (dateFrom === '' || dateTo === '') {
        setError('msg.required.input.date')
        return
      }
      if (dateFrom > dateTo) {
        setError('msg.required.input.range')
        return
      }
      onConfirm({ dateFrom, dateTo })
    } else {
      if (dateFrom === '') {
        setError('msg.required.input.date')
        return
      }
      onConfirm(dateFrom)
    }
    setOpen(false)
  }

  return (
    <>
      <ModalBody>
        {mode === 'range' ? (
          <>
            <DateCalendar
              name="dateFrom"
              label="input.since"
              value={dateFrom}
              onChange={(e) => { setError(''); setDateFrom(e.target.value) }}
            />
            <DateCalendar
              name="dateTo"
              label="input.until"
              value={dateTo}
              onChange={(e) => { setError(''); setDateTo(e.target.value) }}
              feedbackText={error || undefined}
            />
          </>
        ) : (
          <DateCalendar
            name="date"
            value={dateFrom}
            onChange={(e) => { setError(''); setDateFrom(e.target.value) }}
            feedbackText={error || undefined}
          />
        )}
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
// `mode` es específico de este modal: 'single' (default, onConfirm(date)) o 'range' (onConfirm({dateFrom, dateTo})).
export const DatePickerModal = ({ isOpen, onClose, onConfirm, title, mode = 'single' }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      setOpen={(next) => { if (!next) onClose() }}
      ModalContent={DatePickerContent}
      data={{ mode, onConfirm }}
      maxWidth="sm"
    />
  )
}
