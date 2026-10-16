import { Alert, Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useIntl } from 'react-intl';
import { InputField } from '@Components/inputFields';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { useModalDistributeAll } from './useModalDistributeAll';

const FIELDS = [
  { name: 'localMin', label: 'page.productsCatalog.modal.distProduct.table.column.minPrice' },
  { name: 'localMid', label: 'page.productsCatalog.modal.distProduct.table.column.medPrice' },
  { name: 'localMax', label: 'page.productsCatalog.modal.distProduct.table.column.maxPrice' },
  { name: 'foranMin', label: 'page.productsCatalog.modal.distProduct.table.column.minPrice' },
  { name: 'foranMid', label: 'page.productsCatalog.modal.distProduct.table.column.medPrice' },
  { name: 'foranMax', label: 'page.productsCatalog.modal.distProduct.table.column.maxPrice' }
];

// IntlMessages es un hook: no se puede llamar dentro de condiciones ni de .map (React falla por el orden de los hooks). Aquí se llama
// useIntl una sola vez y `t` es una función común.
const ModalDistributeAll = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const {
    formState, onInputChange, errors, pendingCount, loaded, running, progress, result,
    rowsCount, skippedCount, skippedSummary, fnDistribute
  } = useModalDistributeAll({ setLoading: data.setLoading });

  const percentInput = ({ name, label }) => (
    <Colxx xxs={12} sm={4} key={name}>
      <InputField
        label={label}
        name={name}
        type="text"
        value={formState[name]}
        onChange={onInputChange}
        invalid={!!errors[name]}
        feedbackText={errors[name] || null}
      />
    </Colxx>
  );

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p>{t('page.productsCatalog.modal.distAll.description')}</p>
            <h6>{loaded ? `${t('page.productsCatalog.modal.distAll.pending')}: ${pendingCount}` : ''}</h6>
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12}>
            <p className="text-muted">{t('page.productsCatalog.modal.distAll.percentsHelp')}</p>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} lg={6}>
            <ContainerWithLabel label="page.productsCatalog.modal.distProduct.localPrices">
              <Row>{FIELDS.slice(0, 3).map(percentInput)}</Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} lg={6}>
            <ContainerWithLabel label="page.productsCatalog.modal.distProduct.foranPrices">
              <Row>{FIELDS.slice(3).map(percentInput)}</Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        {loaded && (
          <Row>
            <Colxx xxs={12}>
              <p>
                <strong>{`${t('page.productsCatalog.modal.distAll.willDistribute')}: ${rowsCount}`}</strong>
                {skippedCount > 0 && ` — ${t('page.productsCatalog.modal.distAll.willSkip')}: ${skippedCount}`}
              </p>
              {skippedCount > 0 && (
                <>
                  <p className="text-muted mb-1">{t('page.productsCatalog.modal.distAll.skipHelp')}</p>
                  <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                    <ul className="mb-1">
                      {skippedSummary.listed.map((item) => (
                        <li key={item.code}>{`${item.code} - ${item.name} (${t(`page.productsCatalog.modal.distAll.reason.${item.reason}`)})`}</li>
                      ))}
                    </ul>
                    {skippedSummary.hidden > 0 && <p className="text-muted">{`+ ${skippedSummary.hidden}`}</p>}
                  </div>
                </>
              )}
            </Colxx>
          </Row>
        )}
        {progress && (
          <Row>
            <Colxx xxs={12}>
              <Alert color="info">{`${t('page.productsCatalog.modal.distAll.progress')}: ${progress.done} / ${progress.total}`}</Alert>
            </Colxx>
          </Row>
        )}
        {result && (
          <Row>
            <Colxx xxs={12}>
              <Alert color={result.failed ? 'danger' : 'success'}>
                {`${t('page.productsCatalog.modal.distAll.created')}: ${result.created}`}
                {result.skipped > 0 && ` — ${t('page.productsCatalog.modal.distAll.willSkip')}: ${result.skipped}`}
                {result.failed && ` — ${t('page.productsCatalog.modal.distAll.stopped')}`}
              </Alert>
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnDistribute} disabled={running || !loaded || rowsCount === 0}>
          <i className="bi bi-diagram-3"></i> {` ${t('page.productsCatalog.modal.distAll.button.run')}`}
        </Button>
        <Button color="secondary" onClick={() => setOpen(false)} disabled={running}>
          <i className="bi bi-box-arrow-right"></i> {` ${t('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalDistributeAll;
