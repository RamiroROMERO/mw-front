/* eslint-disable react/prop-types */
import { ModalBody, Row } from 'reactstrap';
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
            style={{width:"100%",minHeight:"500px", height:"100%"}}
            frameBorder="0"
          />
        </Colxx>
      </Row>
    </ModalBody>
    </>
  )
}

export default ViewPdf