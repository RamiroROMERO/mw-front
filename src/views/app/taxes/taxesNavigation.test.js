// Impuestos: toda ruta a la que lleva el menú o una tarjeta de inicio (Impuestos, Ajustes, Proceso y Reportes) debe existir en el router. Una tarjeta de Tipos de
// retención llevaba a `typesRetention` (la ruta es `typeRetentions`) y mostraba "página no encontrada" sin que ningún test lo viera.
import { describe, expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const routerFiles = ['router/TaxSettingsRoutes.jsx', 'router/TaxProcessRoutes.jsx', 'router/TaxReportsRoutes.jsx'];
const routePaths = routerFiles.flatMap((file) => [...read(file).matchAll(/path="\/([A-Za-z]+)"/g)].map((m) => `${file.includes('Settings') ? 'settings' : file.includes('Process') ? 'process' : 'reports'}/${m[1]}`));
routePaths.push('settings', 'process', 'reports');

const targets = (source) => [...source.matchAll(/\$\{adminRoot\}\/taxes(?:\/([A-Za-z/]+))?/g)].map((m) => m[1] || '');
const cards = ['views/app/taxes/Content.jsx', 'views/app/taxes/settings/Content.jsx', 'views/app/taxes/process/Content.jsx', 'views/app/taxes/reports/Content.jsx'];
const menu = read('constants/menu.js');
const taxMenu = menu.slice(menu.indexOf("label: 'menu.tax'"), menu.indexOf("label: 'menu.banks'"));

describe('las rutas de Impuestos existen en el router', () => {
  test('el router declara las 7 pantallas y las 3 portadas', () => {
    expect(routePaths.sort()).toEqual([
      'process', 'process/retentionReceipt', 'reports', 'reports/purchaseReport', 'reports/retentionReport', 'reports/salesReport', 'settings',
      'settings/fiscalPeriods', 'settings/typeRetentions', 'settings/typesTaxes'
    ].sort());
  });
  test.each(cards)('cada tarjeta de %s lleva a una ruta existente', (file) => {
    const found = targets(read(file)).filter((target) => target !== '');
    expect(found.length).toBeGreaterThan(0);
    found.forEach((target) => expect(routePaths, `${file} -> /taxes/${target}`).toContain(target));
  });
  test('cada entrada del menú de Impuestos lleva a una ruta existente', () => {
    const found = targets(taxMenu).filter((target) => target !== '');
    expect(found.length).toBe(7 + 3);
    found.forEach((target) => expect(routePaths, `menu -> /taxes/${target}`).toContain(target));
  });
});
