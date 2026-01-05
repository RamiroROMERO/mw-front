import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/es';

// Configurar plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekday);

class DateHelper {
  // Detecta automáticamente la zona horaria del sistema
  static defaultTimezone = dayjs.tz.guess();

  // Configuración
  static setLocale(locale = 'es') {
    dayjs.locale(locale);
  }

  static setDefaultTimezone(tz) {
    DateHelper.defaultTimezone = tz;
  }

  static getDefaultTimezone() {
    return DateHelper.defaultTimezone;
  }

  // Función interna para asegurar siempre la TZ por defecto
  static _d(date) {
    // Si no viene fecha, usamos ahora en la TZ por defecto
    if (!date) {
      return dayjs().tz(DateHelper.defaultTimezone);
    }
    // Si viene un dayjs, lo pasamos a la TZ por defecto
    if (dayjs.isDayjs(date)) {
      return date.tz(DateHelper.defaultTimezone);
    }
    // Si viene string/Date/number, parseamos y aplicamos TZ
    return dayjs(date).tz(DateHelper.defaultTimezone);
  }

  // Crear fechas
  static now() {
    return dayjs().tz(DateHelper.defaultTimezone);
  }

  static parse(date, format = null) {
    const d = format ? dayjs(date, format) : dayjs(date);
    return d.tz(DateHelper.defaultTimezone);
  }

  static fromTimestamp(timestamp) {
    return dayjs(timestamp).tz(DateHelper.defaultTimezone);
  }

  // Formateo
  static format(date, format = 'YYYY-MM-DD') {
    return DateHelper._d(date).format(format);
  }

  static toISO(date) {
    return DateHelper._d(date).toISOString();
  }

  static toDate(date) {
    return DateHelper._d(date).toDate();
  }

  static fromNow(date) {
    return DateHelper._d(date).from(DateHelper.now());
  }

  static toNow(date) {
    return DateHelper._d(date).to(DateHelper.now());
  }

  // Operaciones
  static add(date, amount, unit = 'day') {
    return DateHelper._d(date).add(amount, unit);
  }

  static subtract(date, amount, unit = 'day') {
    return DateHelper._d(date).subtract(amount, unit);
  }

  static diff(date1, date2, unit = 'day', precise = false) {
    return DateHelper._d(date1).diff(DateHelper._d(date2), unit, precise);
  }

  static startOf(date, unit = 'day') {
    return DateHelper._d(date).startOf(unit);
  }

  static endOf(date, unit = 'day') {
    return DateHelper._d(date).endOf(unit);
  }

  // Validación
  static isValid(date) {
    return DateHelper._d(date).isValid();
  }

  // Comparaciones
  static isBefore(date1, date2, unit = null) {
    return DateHelper._d(date1).isBefore(DateHelper._d(date2), unit);
  }

  static isAfter(date1, date2, unit = null) {
    return DateHelper._d(date1).isAfter(DateHelper._d(date2), unit);
  }

  static isSame(date1, date2, unit = null) {
    return DateHelper._d(date1).isSame(DateHelper._d(date2), unit);
  }

  static isSameOrBefore(date1, date2, unit = null) {
    return DateHelper._d(date1).isSameOrBefore(DateHelper._d(date2), unit);
  }

  static isSameOrAfter(date1, date2, unit = null) {
    return DateHelper._d(date1).isSameOrAfter(DateHelper._d(date2), unit);
  }

  static isBetween(date, start, end, unit = null, inclusivity = '()') {
    return DateHelper._d(date).isBetween(
      DateHelper._d(start),
      DateHelper._d(end),
      unit,
      inclusivity
    );
  }

  static getDate() {
    return DateHelper._d().format();
  }

  static getDateOnly() {
    return DateHelper._d().format().substring(0, 10);
  }

  // Getters
  static getYear(date) {
    return DateHelper._d(date).year();
  }

  static getMonth(date) {
    return DateHelper._d(date).month();
  }

  static getDay(date) {
    return DateHelper._d(date).date();
  }

  static getHour(date) {
    return DateHelper._d(date).hour();
  }

  static getMinute(date) {
    return DateHelper._d(date).minute();
  }

  static getSecond(date) {
    return DateHelper._d(date).second();
  }

  static getWeekday(date) {
    return DateHelper._d(date).day();
  }

  static getDaysInMonth(date) {
    return DateHelper._d(date).daysInMonth();
  }

  // Utilidades
  static isWeekend(date) {
    const day = DateHelper._d(date).day();
    return day === 0 || day === 6;
  }

  static isToday(date) {
    return DateHelper._d(date).isSame(DateHelper.now(), 'day');
  }

  static isTomorrow(date) {
    return DateHelper._d(date).isSame(DateHelper.now().add(1, 'day'), 'day');
  }

  static isYesterday(date) {
    return DateHelper._d(date).isSame(DateHelper.now().subtract(1, 'day'), 'day');
  }

  // Rangos
  static getDateRange(start, end, unit = 'day') {
    const dates = [];
    let current = DateHelper._d(start);
    const endDate = DateHelper._d(end);

    while (current.isBefore(endDate) || current.isSame(endDate)) {
      dates.push(current);
      current = current.add(1, unit);
    }

    return dates;
  }

  // Timezone
  static setTimezone(date, timezone) {
    return DateHelper._d(date).tz(timezone);
  }

  static guessTimezone() {
    return dayjs.tz.guess();
  }

  // Formatos comunes
  static toShortDate(date, format = 'DD/MM/YYYY') {
    return DateHelper._d(date).format(format);
  }

  static toLongDate(date) {
    return DateHelper._d(date).format('dddd, D [de] MMMM [de] YYYY');
  }

  static toTime(date) {
    return DateHelper._d(date).format('HH:mm:ss');
  }

  static toDateTime(date) {
    return DateHelper._d(date).format('DD/MM/YYYY HH:mm:ss');
  }

  // Métodos adicionales útiles
  static getTimezoneOffset(date) {
    return DateHelper._d(date).utcOffset();
  }

  static getTimezoneAbbr(date) {
    return DateHelper._d(date).format('z');
  }
}

// Configurar español por defecto
DateHelper.setLocale('es');

export default DateHelper;