import React from 'react'
import { Button, Label, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'

const ModalApplyAccount = ({setOpen, data}) => {
  const {fnApplyAll, fnApplyCurrent} = data;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Label><h3>{IntlMessages("page.requisitions.modal.applyAccount.question")}</h3></Label>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnApplyCurrent} >
          <i className="bi bi-check"/>{` ${IntlMessages('button.applyCurrent')}`}
        </Button>
        <Button color="secondary" onClick={fnApplyAll} >
          <i className="bi bi-list-check"/>{` ${IntlMessages('button.applyAll')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalApplyAccount