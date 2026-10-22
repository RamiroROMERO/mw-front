import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { request } from "@Helpers/core";
import { IntlMessagesFn } from "@Helpers/Utils";
import { NotificationManager } from "@Components/common/react-notifications";
import { useExportExcel } from "@Hooks";
import { FIELD_LABELS, MAX_ROWS, applyRowChange, buildSavePayload, firstProblem, mapOriginalCosts, validateRows } from "./costsAndPricesRules";

const listTaxPercent = [{ id: "0.00", name: "0.00" }, { id: "15.00", name: "15.00" }, { id: "18.00", name: "18.00" }];

// Costos y Precios (inv_prod_edit.sc2) — grilla masiva sobre los productos habilitados, una fila por cada combinación
// producto/distribución. Edita los FK normalizados del Catálogo de Productos (typeId/tradeId/packId/undinId); la unidad de salida
// se muestra pero no se edita (es inmutable, SPEC v2-09-sr). Las mismas reglas del back se validan aquí (costsAndPricesRules.js)
// para no llamar al back con un guardado que ya se sabe rechazado; el costo solo se edita con el privilegio 11.01.003.
const useCostsAndPrices = ({ setLoading, canEditCosts = false }) => {

  const intl = useIntl();
  const [dataFull, setDataFull] = useState([]);
  const [search, setSearch] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [listClassifications, setListClassifications] = useState([]);
  const [listMeasurementUnits, setListMeasurementUnits] = useState([]);
  const [listPackagingUnits, setListPackagingUnits] = useState([]);
  const [listMarks, setListMarks] = useState([]);
  const originalCosts = useRef({});
  const { fnExport: fnExportExcel } = useExportExcel(setLoading);

  const msgSaveSuccess = IntlMessagesFn('msg.costsAndPrices.saveSuccess');
  const msgNoChanges = IntlMessagesFn('msg.costsAndPrices.noChanges');
  const t = (id, values) => intl.formatMessage({ id }, values);

  const fnLoadProducts = () => {
    setLoading(true);
    request.GET('inventory/settings/costsAndPrices', (resp) => {
      const rows = resp.data.map((item) => ({
        ...item,
        rowKey: `${item.productId}_${item.distId || 'new'}`,
        edited: false
      }));
      originalCosts.current = mapOriginalCosts(rows);
      setDataFull(rows);
      setShowErrors(false);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnLoadProducts();

    request.GET('inventory/settings/productsClassifications', (resp) => {
      setListClassifications(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
    request.GET('inventory/settings/measurementUnits', (resp) => {
      const units = resp.data.map((item) => ({ label: item.name.toUpperCase(), value: item.id, isPackaging: !!item.isPackaging }));
      setListMeasurementUnits(units);
      setListPackagingUnits(units.filter((item) => item.isPackaging));
    }, () => { });
    request.GET('inventory/settings/trademarks', (resp) => {
      setListMarks(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    if (!search) return dataFull;
    const term = search.toUpperCase();
    return dataFull.filter((row) => `${row.code}${row.name}`.toUpperCase().includes(term));
  }, [dataFull, search]);

  // Errores por fila y campo de las filas editadas; solo se muestran después del primer intento de guardar.
  const editedRows = useMemo(() => dataFull.filter((row) => row.edited), [dataFull]);
  const validation = useMemo(
    () => validateRows(editedRows, { originalCosts: originalCosts.current, canEditCosts }),
    [editedRows, canEditCosts]
  );
  const rowErrors = showErrors ? validation.rowErrors : {};

  const fnRowChange = (rowKey, field, value) => {
    setDataFull((prev) => applyRowChange(prev, rowKey, field, value));
  }

  const warn = (text) => NotificationManager.warning(text, '', 6000, null, null, '');

  const fnSave = () => {
    if (editedRows.length === 0) {
      warn(msgNoChanges);
      return;
    }
    if (validation.tooMany) {
      warn(t('page.costsAndPrices.error.tooMany', { max: MAX_ROWS }));
      return;
    }
    const problem = firstProblem(editedRows, validation.rowErrors);
    if (problem) {
      setShowErrors(true);
      warn(t('page.costsAndPrices.error.summary', {
        code: problem.code,
        field: t(FIELD_LABELS[problem.field]),
        message: t(problem.id),
        count: Object.keys(validation.rowErrors).length
      }));
      return;
    }
    setLoading(true);
    request.PUT('inventory/settings/costsAndPrices', { rows: buildSavePayload(dataFull) }, () => {
      setDataFull((prev) => {
        const next = prev.map((row) => ({ ...row, edited: false }));
        originalCosts.current = mapOriginalCosts(next);
        return next;
      });
      setShowErrors(false);
      setLoading(false);
      NotificationManager.success(msgSaveSuccess, '', 3000, null, null, '');
    }, () => {
      setLoading(false);
    });
  }

  // Migrado de mw_legacy/exportexcel.prg — el legacy exporta el listado completo
  // (ignora el filtro de búsqueda activo); acá se mantiene esa misma fidelidad.
  // La generación del archivo (columnas, títulos, colores) vive en el backend,
  // reusando el mismo generador de XLSX que ya usa el resto de la app.
  const fnExport = () => {
    fnExportExcel('inventory/settings/costsAndPrices/exportXlsx', {}, 'ListadoProductosPrecios.xlsx');
  }

  return {
    dataFull: filteredData,
    search,
    setSearch,
    listClassifications,
    listMeasurementUnits,
    listPackagingUnits,
    listMarks,
    listTaxPercent,
    rowErrors,
    canEditCosts,
    fnRowChange,
    fnSave,
    fnExport
  }
}

export default useCostsAndPrices;
