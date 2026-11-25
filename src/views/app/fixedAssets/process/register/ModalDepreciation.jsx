import { useEffect, useState } from 'react';
import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { buildDepreciationPayload, validateDepreciation } from './depreciationRules';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

// El cuerpo es un componente aparte: IntlMessages es un hook y no puede llamarse solo después de que el activo cargue (orden de hooks).
const DepreciationBody = ({ asset, dateCalc, setDateCalc, useLife, setUseLife, percent, setPercent, residualValue, depreciableValue, lines, hasApplied, sendForm, errors, fnCalculate, fnSave, setOpen }) => (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="12" md="3"><strong>{IntlMessages('page.fixedAssets.input.code')}:</strong> {asset.code}</Colxx>
          <Colxx xxs="12" md="6"><strong>{IntlMessages('input.name')}:</strong> {asset.name}</Colxx>
          <Colxx xxs="12" md="3"><strong>{IntlMessages('page.fixedAssets.input.valueIn')}:</strong> {formatNumber(asset.valueIn)}</Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="3">
            <DateCalendar name="dateCalc" label="page.fixedAssets.input.dateCalc" value={dateCalc}
              onChange={(e) => setDateCalc(e.target.value)} disabled={hasApplied}
              feedbackText={sendForm && (errors.dateCalc || null)} />
          </Colxx>
          <Colxx xxs="12" md="3">
            <InputField name="useLife" label="page.fixedAssets.input.useLife" type="text" value={useLife}
              onChange={(e) => setUseLife(e.target.value)} disabled={hasApplied}
              invalid={sendForm && !!errors.useLife} feedbackText={sendForm && (errors.useLife || null)} />
          </Colxx>
          <Colxx xxs="12" md="3">
            <InputField name="percent" label="page.fixedAssets.input.residualPercent" type="text" value={percent}
              onChange={(e) => setPercent(e.target.value)} disabled={hasApplied}
              invalid={sendForm && !!errors.percent} feedbackText={sendForm && (errors.percent || null)} />
          </Colxx>
          <Colxx xxs="12" md="3">
            <InputField name="residualValue" label="page.fixedAssets.input.residualValue" type="text" value={formatNumber(residualValue)} disabled />
          </Colxx>
        </Row>
        <Row className="mb-2">
          <Colxx xxs="12" md="3">
            <InputField name="depreciableValue" label="page.fixedAssets.input.depreciableValue" type="text" value={formatNumber(depreciableValue)} disabled />
          </Colxx>
          <Colxx xxs="12" md="9" align="right" className="d-flex align-items-end justify-content-end">
            <Button color="secondary" onClick={fnCalculate} disabled={hasApplied}>
              <i className="bi bi-calculator" /> {IntlMessages('page.fixedAssets.button.calculate')}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>{IntlMessages('table.column.date')}</th>
                  <th>{IntlMessages('page.fixedAssets.table.month')}</th>
                  <th>{IntlMessages('page.fixedAssets.table.year')}</th>
                  <th align="right">{IntlMessages('table.column.value')}</th>
                  <th>{IntlMessages('page.fixedAssets.title.status')}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td>{line.date}</td>
                    <td>{line.monthName}</td>
                    <td>{line.year}</td>
                    <td align="right">{formatNumber(line.value)}</td>
                    <td>{line.statusName || 'Pendiente'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave} disabled={hasApplied}>
          <i className="bi bi-check-lg" /> {IntlMessages('button.save')}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
);

// "Detalle de Depreciación" (af_activos_deprec.sc2) — calculadora de línea recta mensual para
// UN activo, accedida desde el botón "Depreciación" de Registro de Activos. Réplica del
// legacy: Calcular arma/recalcula el cronograma completo en memoria (sin persistir),
// Guardar lo persiste. Bloqueado para editar si ya hay períodos Aplicados (nunca ocurre hoy,
// ver DepreciationService).
export const ModalDepreciation = ({ data, setOpen }) => {
  const { assetId, setLoading } = data;
  const [asset, setAsset] = useState(null);
  const [dateCalc, setDateCalc] = useState('');
  const [useLife, setUseLife] = useState(0);
  const [percent, setPercent] = useState(0);
  const [residualValue, setResidualValue] = useState(0);
  const [depreciableValue, setDepreciableValue] = useState(0);
  const [lines, setLines] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const errors = validateDepreciation({ dateCalc, useLife, percent }, asset?.dateIn);

  const fnLoad = () => {
    if (!assetId) return;
    setLoading(true);
    request.GET(`fixedAssets/process/depreciation/${assetId}`, (resp) => {
      const { asset: assetData, header, lines: lineData, hasApplied: applied } = resp.data;
      setAsset(assetData);
      if (header) {
        setDateCalc(header.dateCalc);
        setUseLife(header.useLife);
        setPercent(header.percent);
        setResidualValue(header.residualValue);
        setDepreciableValue(header.depreciableValue);
      } else {
        // Sugerencias del tipo del activo (vida útil y % residual) y la fecha de ingreso como fecha de cálculo.
        setDateCalc(assetData.dateIn || '');
        setUseLife(assetData.typeUseLife || 0);
        setPercent(assetData.typeResidPercent || 0);
        setResidualValue(0);
        setDepreciableValue(0);
      }
      setLines(lineData || []);
      setHasApplied(!!applied);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  useEffect(() => {
    fnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  const fnCalculate = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    request.POST(`fixedAssets/process/depreciation/${assetId}/calculate`, buildDepreciationPayload({ dateCalc, useLife, percent }), (resp) => {
      setResidualValue(resp.data.residualValue);
      setDepreciableValue(resp.data.depreciableValue);
      setLines(resp.data.lines);
      setLoading(false);
    }, () => setLoading(false));
  }

  // Guardar manda solo los tres parámetros: el back recalcula el cronograma y lo reemplaza; después se recarga lo guardado.
  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;
    if (lines.length === 0) {
      notification('warning', 'page.fixedAssets.msg.calculateFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.PUT(`fixedAssets/process/depreciation/${assetId}`, buildDepreciationPayload({ dateCalc, useLife, percent }), () => {
      notification('success', 'page.fixedAssets.msg.savedOk', 'alert.success.title');
      setLoading(false);
      fnLoad();
    }, () => setLoading(false));
  }

  if (!asset) return <ModalBody />;

  return (
    <DepreciationBody {...{ asset, dateCalc, setDateCalc, useLife, setUseLife, percent, setPercent, residualValue, depreciableValue, lines, hasApplied, sendForm, errors, fnCalculate, fnSave, setOpen }} />
  );
}
