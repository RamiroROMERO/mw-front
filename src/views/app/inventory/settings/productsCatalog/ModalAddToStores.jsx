import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { useModalAddToStores } from './useModalAddToStores';

const ModalAddToStores = ({ data, setOpen }) => {
  const { productCode } = data;
  const { stores, selected, loaded, saving, onToggle, fnAccept, fnCancel } = useModalAddToStores({ productCode, setOpen });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p><strong>{productCode}</strong></p>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            {loaded && stores.length === 0 && <p>{IntlMessages('page.productsCatalog.modal.addToStores.empty')}</p>}
            {stores.map((store) => (
              <div className="form-check mb-2" key={store.id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`store-${store.id}`}
                  name={`store-${store.id}`}
                  checked={!!selected[store.id]}
                  onChange={(e) => onToggle(store.id, e.target.checked)}
                />
                <label className="form-check-label" htmlFor={`store-${store.id}`}>{store.name}</label>
              </div>
            ))}
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={saving} onClick={fnAccept}><i className="bi bi-check-lg"></i> {` ${IntlMessages('button.accept')}`}</Button>
        <Button color="secondary" disabled={saving} onClick={fnCancel}><i className="bi bi-box-arrow-right"></i> {` ${IntlMessages('button.cancel')}`}</Button>
      </ModalFooter>
    </>
  );
};

export default ModalAddToStores;
