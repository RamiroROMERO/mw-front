import { useIntl } from 'react-intl'
import {
  defaultDirection,
  defaultLocale,
  defaultColor,
  localeOptions,
  themeColorStorageKey,
  themeRadiusStorageKey,
} from '@/constants/defaultValues';
import moment from 'moment';
import * as XLSX from "xlsx";

export const mapOrder = (array, order, key) => {
  // eslint-disable-next-line func-names
  array.sort(function (a, b) {
    const A = a[key];
    const B = b[key];
    if (order.indexOf(`${A}`) > order.indexOf(`${B}`)) {
      return 1;
    }
    return -1;
  });
  return array;
};

export const getDateWithFormat = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; // January is 0!

  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${dd}.${mm}.${yyyy}`;
};

export const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}`;
};

export const getDirection = () => {
  let direction = defaultDirection;

  try {
    if (localStorage.getItem('direction')) {
      const localValue = localStorage.getItem('direction');
      if (localValue === 'rtl' || localValue === 'ltr') {
        direction = localValue;
      }
    }
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js : getDirection -> error', error);
    direction = defaultDirection;
  }
  return {
    direction,
    isRtl: direction === 'rtl',
  };
};
export const setDirection = (localValue) => {
  let direction = 'ltr';
  if (localValue === 'rtl' || localValue === 'ltr') {
    direction = localValue;
  }
  try {
    localStorage.setItem('direction', direction);
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js : setDirection -> error', error);
  }
};

export const getCurrentColor = () => {
  let currentColor = defaultColor;
  try {
    if (localStorage.getItem(themeColorStorageKey)) {
      currentColor = localStorage.getItem(themeColorStorageKey);
    }
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js : getCurrentColor -> error', error);
    currentColor = defaultColor;
  }
  return currentColor;
};

export const setCurrentColor = (color) => {
  try {
    localStorage.setItem(themeColorStorageKey, color);
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js : setCurrentColor -> error', error);
  }
};

export const getCurrentRadius = () => {
  let currentRadius = 'rounded';
  try {
    if (localStorage.getItem(themeRadiusStorageKey)) {
      currentRadius = localStorage.getItem(themeRadiusStorageKey);
    }
  } catch (error) {
    console.log(
      '>>>>: src/helpers/Utils.js : getCurrentRadius -> error',
      error
    );
    currentRadius = 'rounded';
  }
  return currentRadius;
};
export const setCurrentRadius = (radius) => {
  try {
    localStorage.setItem(themeRadiusStorageKey, radius);
  } catch (error) {
    console.log(
      '>>>>: src/helpers/Utils.js : setCurrentRadius -> error',
      error
    );
  }
};

export const getCurrentLanguage = () => {
  let language = defaultLocale;
  try {
    language =
      localStorage.getItem('currentLanguage') &&
        localeOptions.filter(
          (x) => x.id === localStorage.getItem('currentLanguage')
        ).length > 0
        ? localStorage.getItem('currentLanguage')
        : defaultLocale;
  } catch (error) {
    console.log(
      '>>>>: src/helpers/Utils.js : getCurrentLanguage -> error',
      error
    );
    language = defaultLocale;
  }
  return language;
};
export const setCurrentLanguage = (locale) => {
  try {
    localStorage.setItem('currentLanguage', locale);
  } catch (error) {
    console.log(
      '>>>>: src/helpers/Utils.js : setCurrentLanguage -> error',
      error
    );
  }
};

export const getCurrentUser = () => {
  let user = null;
  try {
    user =
      localStorage.getItem('mw_current_user') != null
        ? JSON.parse(localStorage.getItem('mw_current_user'))
        : null;
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js  : getCurrentUser -> error', error);
    user = null;
  }
  return user;
};

export const setCurrentUser = (user, companyData, dataUserModules) => {
  try {
    if (user) {
      localStorage.removeItem("mw_current_user");
      localStorage.setItem('mw_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mw_current_user');
    }
    if (companyData) {
      localStorage.removeItem("mw_current_company");
      localStorage.setItem("mw_current_company", JSON.stringify(companyData))
    } else {
      localStorage.removeItem("mw_current_company")
    }
    if (dataUserModules) {
      localStorage.removeItem("mw_current_userModules");
      localStorage.setItem("mw_current_userModules", JSON.stringify(dataUserModules))
    } else {
      localStorage.removeItem("mw_current_userModules")
    }
  } catch (error) {
    console.log('>>>>: src/helpers/Utils.js : setCurrentUser -> error', error);
  }
};

export const IntlMessages = (id) => {
  const intl = useIntl();
  return intl.formatMessage({ id })
};

export const IntlMessagesFn = (id) => {
  const intl = useIntl();
  return intl.formatMessage({ id })
};

export const rgbToHex = (r, g, b) => `#${[r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}).join('')}`

export const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export const formatDate = (date) => {
  const newDate = new Date(`${date}T12:00:00Z`);
  let dd = newDate.getDate();
  let mm = newDate.getMonth() + 1; // January is 0!

  const yyyy = newDate.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${dd}/${mm}/${yyyy}`;
};

export function formatNumber(number, simbol = '', decimals = 2) {
  if (!number || Number.isNaN(number)) {
    number = 0;
  }
  const separador = ","
  const sepDecimal = '.';
  number += '';
  const splitStr = number.split('.');
  const splitLeft = splitStr[0].replace(/\B(?=(\d{3})+(?!\d))/g, separador);
  let splitRight = "".padStart(decimals, '0');
  if (splitStr[1]) {
    const [a, b] = Number.parseFloat(number).toFixed(decimals).split(".");
    splitRight = b;
  }
  return simbol + splitLeft + sepDecimal + splitRight;
}

export const validInt = (number = 0) => {
  return Number.isNaN(number) ? 0 : Number.parseInt(number);
};

export const validFloat = (float = 0.00, decimals = 2) => {
  if (Number.isNaN(Number.parseFloat(float))) return Number.parseFloat('0.00')

  return Number.parseFloat(Number.parseFloat(float).toFixed(decimals));
};

export const getMonthLetter = (date) => {
  let mm = 0;
	if(date){
		mm = moment(date).month() + 1;
	}else{
		mm = moment().month() + 1;
	}

  let month = "";

  switch (mm) {
    case 1: month = "Enero"
      break;
    case 2: month = "Febrero"
      break;
    case 3: month = "Marzo"
      break;
    case 4: month = "Abril"
      break;
    case 5: month = "Mayo"
      break;
    case 6: month = "Junio"
      break;
    case 7: month = "Julio"
      break;
    case 8: month = "Agosto"
      break;
    case 9: month = "Septiembre"
      break;
    case 10: month = "Octubre"
      break;
    case 11: month = "Noviembre"
      break;
    case 12: month = "Diciembre"
      break;
    default: month = ""
      break;
  }
  return month;
}

export const fnCalcDaysVacations = (startDate, endDate) => {
  const fechaInicio=new Date(startDate);
  const fechaFin=new Date(endDate);
  const year = fechaFin.getFullYear();

  const datesHollyDays = [
    { fechaValidar: new Date(`${year}-01-01`)},
    { fechaValidar: new Date(`${year}-05-01`)},
    { fechaValidar: new Date(`${year}-09-15`)},
    { fechaValidar: new Date(`${year}-12-25`)}
  ]

  const fechaInicioMs = fechaInicio.getTime();
  const fechaFinMs = fechaFin.getTime();

  let hollyday = 0;

  datesHollyDays.forEach(element => {
    const fechaValidarMs = element.fechaValidar.getTime();

    if(fechaValidarMs >= fechaInicioMs && fechaValidarMs <= fechaFinMs){
      hollyday ++;
    }
  });

  return hollyday;
}

export const getDaysDiffExcMonday = (dateFrom, dateTo, incMonday=0) => {
  const date1 = moment(dateFrom);
  const date2 = moment(dateTo);

  const from = moment(date1, 'DD/MM/YYY');
  const to = moment(date2, 'DD/MM/YYY');
  let days = 0;

  while (!from.isAfter(to)) {
    if(incMonday === 1){
			days++;
		}else{
			// Si no es domingo
			if (from.isoWeekday() !== 7) {
				days++;
			}
		}
    from.add(1, 'days');
  }

  // buscar dias libres
  const hollydays = fnCalcDaysVacations(dateFrom, dateTo);

  days = days - hollydays;
  return days;
}

export const getCurrentDate = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; // January is 0!

  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  return `${yyyy}-${mm}-${dd}`;
};

export const ExcelErrors = {
  ISEMPTY: 'isEmpty',
  DONTHASVALIDCOLUMN: 'dontHasValidColumn',
  ALLZEROVALUES: 'allZeroValues'
}

export const cleanedObjectKeys = (item) => {
  return Object.keys(item).reduce((acc, key) => {
    const cleanedKey = key
      .replace(/\s+/g, " ")       // Replace multiple spaces with a single space
      .trim()                     // Remove spaces at the beginning and end
      .replace(/[\r\n↵]+/g, "");  // Remove line breaks and special characters
    acc[cleanedKey] = item[key];
    return acc;
  }, {});
}

export const getExcelData = (data, requiredColumns, priceCalculateColumns, startColumn, startRow, endColumn, endRow, removeEndRow) => {
  let formattedData = [];
  if (typeof data === "string") {
    const workbook = XLSX.read(data, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const range = `${startColumn}${startRow}:${endColumn}${endRow}`;
    const jsonData = XLSX.utils.sheet_to_json(sheet, { range, raw: false });
    if (jsonData.length && removeEndRow) {
      jsonData.pop();
    }
    if (jsonData.length === 0) {
      return { error: ExcelErrors.ISEMPTY, data: [] };
    }
    const hasValidColumn = jsonData.every((row) =>
      requiredColumns.every((col) => row[col] !== undefined && row[col] !== null && row[col] !== "")
    );
    if (!hasValidColumn) {
      return { error: ExcelErrors.DONTHASVALIDCOLUMN, data: [] };
    }
    formattedData = jsonData.filter((item) => {
      return requiredColumns.some(col =>
        item[col] !== undefined && item[col] !== null && item[col] !== ""
      );
    })
    const hasValidPrice = formattedData.find((item) => {
      let calculatedValue = 1;
      priceCalculateColumns.forEach((col) => {
        calculatedValue = calculatedValue * item[col];
      });
      return calculatedValue > 0;
    });
    if (!hasValidPrice) {
      return { error: ExcelErrors.ALLZEROVALUES, data: [] };
    }
  }
  return { data: formattedData };
}

export const getPrivilegeData = (privilegeCode) => {
  const privileges = JSON.parse(localStorage.getItem('mw_current_userModules'));
  let detaPrivilege = privileges.find(elem => elem.code === privilegeCode);
  if (detaPrivilege?.id) {
    detaPrivilege = detaPrivilege;
  } else {
    detaPrivilege = { fnCreate: 0, fnUpdate: 0, fnDelete: 0, id: 0, name: '', status: 0 };
  }
  return detaPrivilege;
}
