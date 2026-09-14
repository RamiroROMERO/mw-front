import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import { useModalSendEmail } from './useModalSendEmail';

const ModalSendEmail = ({ data, setOpen }) => {

  const { formState, onInputChange, sending, attachmentName, fnSendEmail } = useModalSendEmail({ data, setOpen });

  const { to, subject, body } = formState;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <InputField
              label='input.to'
              name="to"
              value={to}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <InputField
              label='input.subject'
              name="subject"
              value={subject}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <InputField
              label='input.message'
              type='textarea'
              rows={8}
              name="body"
              value={body}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row className='mt-2'>
          <Colxx xxs={12}>
            <span className='badge bg-light text-dark border'>
              <i className='bi bi-paperclip me-1' />
              {attachmentName}
            </span>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color='danger' outline onClick={() => setOpen(false)}>
          <i className='bi bi-box-arrow-right' />
          {` ${IntlMessages('button.exit')}`}
        </Button>
        <Button color='primary' onClick={fnSendEmail} disabled={sending || !to}>
          <i className='bi bi-send' />
          {` ${IntlMessages('button.send')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSendEmail;
