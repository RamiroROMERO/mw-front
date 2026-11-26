// Muestra un código de cuenta con el formato de cuentas (cont_ctas_set.format, por ejemplo '#####-##-###'): cada '#' toma un dígito y los separadores solo se ponen si aún quedan dígitos, así un
// código de 3 dígitos sale '101', uno de 7 '10101-01' y uno de 10 '10101-01-001'. Sin formato (o con dígitos de sobra) devuelve el código tal cual / agrega el resto al final.
const text = (value) => String(value ?? '').trim();

export const formatAccountCode = (code, format = '') => {
  const digits = text(code).replace(/[.\-\s]/g, '');
  const mask = text(format);
  if (!digits || !mask) return text(code);
  let out = '';
  let index = 0;
  for (const char of mask) {
    if (index >= digits.length) break;
    if (char === '#') {
      out += digits[index];
      index += 1;
    } else {
      out += char;
    }
  }
  return index < digits.length ? out + digits.slice(index) : out;
};
