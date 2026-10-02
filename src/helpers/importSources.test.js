import { describe, it, expect } from 'vitest';

// `request`, `moveScrollTop` y `buildUrl` se exportan desde '@Helpers/core', no desde '@Helpers/Utils'.
// Importarlos del módulo equivocado no falla al compilar: el navegador lanza un SyntaxError al cargar la
// pantalla (pasó en Activos Fijos > Reportes con `buildUrl`) y el ErrorBoundary muestra "Oops!".
const CORE_EXPORTS = ['request', 'moveScrollTop', 'buildUrl'];

const files = import.meta.glob('../**/*.{js,jsx}', { query: '?raw', import: 'default', eager: true });

const IMPORT_FROM_UTILS = /import\s*\{([^}]*)\}\s*from\s*['"]@Helpers\/Utils['"]/g;

describe('imports de @Helpers/Utils y @Helpers/core', () => {
  it('encuentra los archivos fuente', () => {
    expect(Object.keys(files).length).toBeGreaterThan(100);
  });

  it('ningún archivo importa de @Helpers/Utils algo que vive en @Helpers/core', () => {
    const offenders = [];
    Object.entries(files).forEach(([file, source]) => {
      let match = IMPORT_FROM_UTILS.exec(source);
      while (match) {
        const names = match[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]).filter(Boolean);
        names.filter((n) => CORE_EXPORTS.includes(n)).forEach((n) => offenders.push(`${file}: ${n}`));
        match = IMPORT_FROM_UTILS.exec(source);
      }
    });
    expect(offenders).toEqual([]);
  });

  it('ningún archivo lee el código de error de description.name: se usa getErrorCode (desde la SPEC v2-20 la description es texto)', () => {
    const offenders = Object.entries(files)
      .filter(([file]) => !/errorMessage(\.test)?\.js$|importSources\.test\.js$/.test(file))
      .filter(([, source]) => /description\??\.name\b/.test(source))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
