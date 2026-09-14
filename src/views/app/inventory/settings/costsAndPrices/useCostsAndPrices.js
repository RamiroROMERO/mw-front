import { useEffect, useMemo, useState } from "react";
import { request } from "@Helpers/core";
import { IntlMessagesFn } from "@Helpers/Utils";
import { NotificationManager } from "@Components/common/react-notifications";
import { useExportExcel } from "@Hooks";

const listTaxPercent = [{ id: "0.00", name: "0.00" }, { id: "15.00", name: "15.00" }, { id: "18.00", name: "18.00" }];

// Costos y Precios (inv_prod_edit.sc2) — grilla masiva sobre productos con habilita=0
// (pendientes de terminar de configurar tras "Distribuir Todos"). A diferencia del
// legacy (columnas de texto), edita los FK normalizados que usa el resto del Catálogo
// de Productos: typeId/tradeId/packId/undinId/undoutId.
const useCostsAndPrices = ({ setLoading }) => {

  const [dataFull, setDataFull] = useState([]);
  const [search, setSearch] = useState('');
  const [listClassifications, setListClassifications] = useState([]);
  const [listMeasurementUnits, setListMeasurementUnits] = useState([]);
  const [listPackagingUnits, setListPackagingUnits] = useState([]);
  const [listMarks, setListMarks] = useState([]);
  const { fnExport: fnExportExcel } = useExportExcel(setLoading);

  const msgSaveSuccess = IntlMessagesFn('msg.costsAndPrices.saveSuccess');
  const msgNoChanges = IntlMessagesFn('msg.costsAndPrices.noChanges');

  const fnLoadProducts = () => {
    setLoading(true);
    request.GET('inventory/settings/costsAndPrices', (resp) => {
      const rows = resp.data.map((item) => ({
        ...item,
        rowKey: `${item.productId}_${item.distId || 'new'}`,
        edited: false
      }));
      setDataFull(rows);
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
      const units = resp.data.map((item) => ({ label: item.name.toUpperCase(), value: item.id, type: item.type }));
      setListMeasurementUnits(units);
      setListPackagingUnits(units.filter((item) => item.type === 2));
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

  const fnRowChange = (rowKey, field, value) => {
    setDataFull((prev) => prev.map((row) => row.rowKey === rowKey ? { ...row, [field]: value, edited: true } : row));
  }

  const fnSave = () => {
    const rows = dataFull.filter((row) => row.edited);
    if (rows.length === 0) {
      NotificationManager.warning(msgNoChanges, '', 4000, null, null, '');
      return;
    }
    setLoading(true);
    request.PUT('inventory/settings/costsAndPrices', { rows }, () => {
      setDataFull((prev) => prev.map((row) => ({ ...row, edited: false })));
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
    fnRowChange,
    fnSave,
    fnExport
  }
}

export default useCostsAndPrices;
