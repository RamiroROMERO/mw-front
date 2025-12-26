/* eslint-disable react/prop-types */
import { ModalBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';

const ViewPdf = ({ setOpen, data }) => {
  const { documentPath } = data;

  return (
    <>
      <ModalBody>
        {/* <Row> */}
        <div className="embed-responsive embed-responsive-21by9">
          // embed-responsive-16by9
          <iframe className='embed-responsive-item' title='Cargando pdf...'
            type="application/pdf"
            src={documentPath}
            // style={{width:"100%",minHeight:"500px", height:"100%"}}
            frameBorder="0"
          />
        </div>
        {/* </Row> */}
      </ModalBody>
    </>
  )
}

export default ViewPdf