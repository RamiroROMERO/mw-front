import { Colxx } from '@/components/common/CustomBootstrap';
import UploadImages from '@/components/uploadImages/UploadImages';
import Confirmation from '@Containers/ui/confirmationMsg';
import { IntlMessages } from '@/helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { useModalImages } from './useModalImages';

const ModalImages = ({data, setOpen}) => {
  const {productCode, dataImages, fnGetImages, setLoading} = data;

  const {propsToMsgDelete, setImagesUpload, fnDeleteImage, fnSave} = useModalImages({productCode, fnGetImages, setLoading, setOpen});

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12}>
          <UploadImages title='Galeria' setDataImages={setImagesUpload} imagesSaved={dataImages} fnDeleteImages={fnDeleteImage}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
      <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
    </ModalFooter>
    <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ModalImages