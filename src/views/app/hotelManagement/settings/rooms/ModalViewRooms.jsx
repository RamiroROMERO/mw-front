import { Colxx } from '@/components/common/CustomBootstrap'
import Gallery from '@/components/gallery/Gallery';
import { IntlMessages } from '@/helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'

const ModalViewRooms = ({data, setOpen}) => {
  const {dataRoomImages} = data;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12}>
          <Gallery dataImages={dataRoomImages}/>
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

export default ModalViewRooms