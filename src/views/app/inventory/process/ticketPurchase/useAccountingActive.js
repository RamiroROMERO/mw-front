import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';

// Contabilidad activa (mw_setting.cont_menu). En el legacy (`contMenu`) sin ella no se ven el almacén, la cuenta, "Al Inventario", "Aplicar
// a todos" ni "Contabilizar". Mientras no se conoce se asume activa (el back decide); el valor real llega con admin/companyInternalSettings.
export const useAccountingActive = () => {
  const [accountingActive, setAccountingActive] = useState(true);

  useEffect(() => {
    const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
    if (companyData?.id) {
      request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
        const [settings] = resp.data;
        setAccountingActive(!!settings?.accountingMenu);
      }, () => { });
    }
  }, []);

  return accountingActive;
};
