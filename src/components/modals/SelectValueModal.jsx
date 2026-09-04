import { useState } from 'react'
import { ModalBody, ModalFooter, Button } from 'reactstrap'
import Modal from '@Components/modal'
import { SimpleSelect } from '@Components/simpleSelect'
import { RadioGroup } from '@Components/radioGroup'
import { IntlMessages } from '@Helpers/Utils'

const SelectValueContent = ({ data, setOpen }) => {
  const { options, onConfirm } = data
  const [value, setValue] = useState('')

  const handleConfirm = () => {
    if (value === '' || value === '0') return
    onConfirm(value)
    setOpen(false)
  }

  return (
    <>
      <ModalBody>
        {options.length <= 3
          ? <RadioGroup
            name="selectValue"
            options={options.map((o) => ({ id: o.value, label: o.label }))}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          : <SimpleSelect
            name="selectValue"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            options={options}
            getOptionValue={(o) => o.value}
            getOptionLabel={(o) => o.label}
          />}
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

// Mismo contrato del catálogo (ver SeekTextModal): { isOpen, onClose, onConfirm, title }.
// `options` es específico de este modal: [{ value, label }].
export const SelectValueModal = ({ isOpen, onClose, onConfirm, title, options = [] }) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      setOpen={(next) => { if (!next) onClose() }}
      ModalContent={SelectValueContent}
      data={{ options, onConfirm }}
      maxWidth="sm"
    />
  )
}
