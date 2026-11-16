import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import { buildMovementRequest, buildTypeOptions, defaultMovementForm, validateMovement } from './stockMovementRules';

// Modal "Movimiento por Producto" (SPEC v2-45-sr): pide el tipo de producto ("Todos" o uno), el rango, el modo (detalle o resumen) y si se
// excluyen los ajustes, y descarga el documento en PDF o Excel. Es un GET de solo lectura que el back arma desde lo guardado; GETPdf no
// notifica por sí mismo, así que el error se avisa aquí. Un filtro inválido se marca en pantalla y NO llama al back. Si el back rechaza,
// el modal queda abierto con su mensaje real.
export const useModalMovement = ({ setOpen }) => {
  const intl = useIntl();
  const [form, setForm] = useState(() => defaultMovementForm());
  const [types, setTypes] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const errors = useMemo(() => validateMovement(form), [form]);
  const allLabel = intl.formatMessage({ id: 'page.stock.modal.printMovements.allTypes' });
  const typeOptions = useMemo(() => buildTypeOptions(types, allLabel), [types, allLabel]);

  useEffect(() => {
    request.GET('inventory/settings/productsClassifications/getSL', (resp) => setTypes(resp?.data || []), () => { });
  }, []);

  const onInputChange = ({ target: { name, value } }) => setForm((prev) => ({ ...prev, [name]: value }));
  const onTypeChange = ({ target: { value } }) => setForm((prev) => ({ ...prev, productTypeId: Number(value) || 0 }));
  const onExcludeChange = ({ target: { checked } }) => setForm((prev) => ({ ...prev, excludeAdjustments: Boolean(checked) }));

  const fnDownload = (format) => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    setDownloading(true);
    const stop = () => setDownloading(false);
    const { url, params, fileName } = buildMovementRequest(form, format);
    request.GETPdf(url, params, fileName, (err) => {
      stop();
      notifyError(err, 'page.stock.msg.movementError');
    }, 'GET', () => {
      stop();
      setOpen(false);
    });
  };

  return { form, errors, sendForm, downloading, typeOptions, onInputChange, onTypeChange, onExcludeChange, fnDownload };
};
