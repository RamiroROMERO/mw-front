import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { useModalExport } from './useModalExport';

const ModalExport = ({ setOpen }) => {
  const { includeDisabled, setIncludeDisabled, exporting, fnAccept, fnCancel } = useModalExport({ setOpen });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p>{IntlMessages('page.productsCatalog.modal.export.text')}</p>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="export-include-disabled"
                name="export-include-disabled"
                checked={includeDisabled}
                onChange={(e) => setIncludeDisabled(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="export-include-disabled">{IntlMessages('page.productsCatalog.modal.export.includeDisabled')}</label>
            </div>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={exporting} onClick={fnAccept}><i className="bi bi-file-earmark-excel"></i> {` ${IntlMessages('button.export')}`}</Button>
        <Button color="secondary" disabled={exporting} onClick={fnCancel}><i className="bi bi-box-arrow-right"></i> {` ${IntlMessages('button.cancel')}`}</Button>
      </ModalFooter>
    </>
  );
};

export default ModalExport;
