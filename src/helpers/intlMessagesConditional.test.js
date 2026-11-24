// `IntlMessages` es un hook (usa el contexto de react-intl): llamarlo dentro de una condición de JSX (`cond && <th>{IntlMessages('x')}</th>`, o un ternario) cambia el
// orden de los hooks entre renders y React lanza "change in the order of Hooks". Pasó en Depósitos Varios, Depósitos de Afiliadas, Líneas de Depósito de Clientes y el modal
// de Libro de Bancos. Esta prueba falla si una línea de JSX de Bancos o de Impuestos vuelve a llamarlo así; la solución es un `useIntl()` arriba del componente.
import { describe, expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../views/app');
const folders = ['banks', 'taxes'];

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) return walk(full);
  return /\.jsx$/.test(entry.name) ? [full] : [];
});

// Cubre la condición y la llamada en la misma línea (`{a && <th>{IntlMessages('x')}</th>}` o un ternario). Un bloque condicional de varias líneas (`{cond && (` ... `)}`) no se
// ve con una regex: ahí hay que revisar a mano al agregar texto traducido dentro de la condición.
const conditional = /(&&|\?)\s*\(?\s*<[^>]*>[^<]*\{\s*IntlMessages\(|\{[^{}]*(&&|\?)[^{}]*\bIntlMessages\(/;

describe('IntlMessages no se llama dentro de condiciones de JSX', () => {
  folders.forEach((folder) => {
    walk(path.join(root, folder)).forEach((file) => {
      test(path.relative(root, file), () => {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        const found = lines.map((text, index) => ({ text, line: index + 1 })).filter(({ text }) => conditional.test(text));
        expect(found.map(({ line, text }) => `${line}: ${text.trim().slice(0, 120)}`)).toEqual([]);
      });
    });
  });
});
