/* eslint-disable react/prop-types */
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap';

const ViewPdf = ({setOpen, data}) => {
  const {documentPath} = data;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <iframe title='Cargando pdf...'
            type="application/pdf"
            src={documentPath}
            style={{width:"100%",minHeight:"450px", height:"100%"}}
            frameBorder="0"
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ViewPdf