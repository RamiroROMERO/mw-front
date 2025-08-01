import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap';

const UploadFile = ({onFileChange, fnViewFile, icon, nameFile, showButtonView}) => {
  const hiddenFileInput = React.useRef(null);

  const onClickFile = e =>{
    hiddenFileInput.current.click();
  }

  return (
    <Card>
      <CardBody className="text-center">
        <Row style={{cursor: 'pointer'}}>
          <Colxx xxs="12" onClick={onClickFile}>
            <i className={icon} />
            <p className="card-text font-weight-semibold mb-0">
              {nameFile}
            </p>
            <input type="file"
              ref={hiddenFileInput}
              onChange={onFileChange}
              style={{display:'none'}}
            />
          </Colxx>
        </Row>
        <Row style={{display: showButtonView}}>
          <Colxx xxs="12" align="center" className="mt-3">
            <Button color="primary" onClick={fnViewFile} className="btn-circle-table"><i className="bi bi-eye" /></Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default UploadFile