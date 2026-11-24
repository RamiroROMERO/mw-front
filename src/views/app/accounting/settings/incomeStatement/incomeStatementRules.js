// Mismas reglas que modules/accounting/incomeStatementStructure/incomeStatementRules.js del back (SPEC v2-122-sr). Los reportes suman cada cuenta por PREFIJO: una cuenta repetida, en dos grupos o
// dentro de otra se contaría dos veces. El back es quien decide; aquí solo se evita el viaje y se filtra el selector.
export const TYPE_GROUPS = [
  { type: 1, label: 'page.incomeStatementStructure.group.income' },
  { type: 2, label: 'page.incomeStatementStructure.group.costOfSales' },
  { type: 3, label: 'page.incomeStatementStructure.group.expenses' },
  { type: 4, label: 'page.incomeStatementStructure.group.otherIncome' },
  { type: 5, label: 'page.incomeStatementStructure.group.otherExpenses' },
  { type: 6, label: 'page.incomeStatementStructure.group.tax' },
  { type: 7, label: 'page.incomeStatementStructure.group.discounts' }
];

export const emptyGroups = () => TYPE_GROUPS.reduce((acc, g) => { acc[g.type] = []; return acc; }, {});

// Dos códigos se traslapan si uno empieza con el otro (incluye el mismo código).
export const overlaps = (a, b) => a.startsWith(b) || b.startsWith(a);

// Parejas problemáticas entre las filas { accountNumber, type }; el texto es el mismo del back.
export const findProblems = (rows) => {
  const duplicated = [];
  const overlapping = [];
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      const a = rows[i];
      const b = rows[j];
      if (a.accountNumber === b.accountNumber && a.type === b.type) {
        duplicated.push(`${a.accountNumber} (grupo ${a.type})`);
      } else if (overlaps(a.accountNumber, b.accountNumber)) {
        const [parent, child] = a.accountNumber.length <= b.accountNumber.length ? [a, b] : [b, a];
        overlapping.push(parent.accountNumber === child.accountNumber
          ? `${parent.accountNumber} (grupos ${parent.type} y ${child.type})`
          : `${child.accountNumber} (grupo ${child.type}) está dentro de ${parent.accountNumber} (grupo ${parent.type})`);
      }
    }
  }
  return { duplicated, overlapping };
};

// Resultado de revisar la estructura completa antes de guardar: null si está bien, o { id, detail } con el id de traducción del aviso.
export const validateStructure = (rows) => {
  if (!rows.length) return { id: 'page.incomeStatementStructure.error.empty', detail: '' };
  const { duplicated, overlapping } = findProblems(rows);
  if (duplicated.length) return { id: 'page.incomeStatementStructure.error.duplicated', detail: duplicated.join(', ') };
  if (overlapping.length) return { id: 'page.incomeStatementStructure.error.overlap', detail: overlapping.join('; ') };
  return null;
};

// Al agregar: separa las cuentas elegidas entre las que se pueden agregar y las que chocarían con lo ya configurado (en cualquier grupo) o entre sí.
export const splitAddable = (selectedCodes, existingRows) => {
  const accepted = [];
  const rejected = [];
  selectedCodes.forEach((code) => {
    const clash = existingRows.some((r) => overlaps(r.accountNumber, code)) || accepted.some((c) => overlaps(c, code));
    (clash ? rejected : accepted).push(code);
  });
  return { accepted, rejected };
};
