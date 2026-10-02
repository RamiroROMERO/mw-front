import { describe, it, expect, vi, beforeEach } from 'vitest';

const dispatchMock = vi.fn();
const logoutUserMock = vi.fn((navigate) => ({ type: 'LOGOUT_USER', payload: { navigate } }));

vi.mock('@Containers/ui/Notifications', () => ({
  default: vi.fn(),
}));
vi.mock('@Redux/actions', () => ({
  logoutUser: (...args) => logoutUserMock(...args),
}));
vi.mock('@Redux/stores', () => ({
  getStore: () => ({ dispatch: dispatchMock }),
}));

const { request, buildUrl } = await import('./core');
const notification = (await import('@Containers/ui/Notifications')).default;

const makeToken = (exp) => {
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64');
  return `header.${payload}.sig`;
};

const jsonResponse = (body, { ok = true, status = 200, statusText = 'OK' } = {}) => ({
  ok,
  status,
  statusText,
  json: async () => {
    if (body === undefined) throw new SyntaxError('Unexpected token < in JSON');
    return body;
  },
});

const setStoredUser = (token) => {
  localStorage.setItem('mw_current_user', JSON.stringify({ id: 1, token }));
};

const futureExp = () => Math.floor(Date.now() / 1000) + 3600;
const pastExp = () => Math.floor(Date.now() / 1000) - 3600;

describe('core.js — request', () => {
  beforeEach(() => {
    localStorage.clear();
    dispatchMock.mockClear();
    logoutUserMock.mockClear();
    global.fetch = vi.fn();
  });

  describe('GET', () => {
    it('llama a fnSuccess con el body cuando el status del body es "success"', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockResolvedValue(jsonResponse({ status: 'success', data: [1, 2] }));

      const fnSuccess = vi.fn();
      const fnError = vi.fn();
      await new Promise((resolve) => {
        request.GET('some/endpoint', fnSuccess, fnError, resolve);
      });

      expect(fnSuccess).toHaveBeenCalledWith({ status: 'success', data: [1, 2] });
      expect(fnError).not.toHaveBeenCalled();
    });

    it('envía el token vigente como header Authorization', async () => {
      const token = makeToken(futureExp());
      setStoredUser(token);
      global.fetch.mockResolvedValue(jsonResponse({ status: 'success' }));

      await new Promise((resolve) => request.GET('some/endpoint', () => {}, () => {}, resolve));

      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('arma un error con forma consistente cuando el HTTP status no es 2xx y el body no es JSON', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockResolvedValue(
        jsonResponse(undefined, { ok: false, status: 500, statusText: 'Internal Server Error' })
      );

      const fnError = vi.fn();
      await new Promise((resolve) => {
        request.GET('some/endpoint', () => {}, (err) => { fnError(err); resolve(); }, () => {});
      });

      expect(fnError).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: 500,
          messages: [{ description: 'Internal Server Error' }],
        })
      );
    });

    it('llama a fnError ante un fallo de red (fetch rechaza)', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const fnError = vi.fn();
      await new Promise((resolve) => {
        request.GET('some/endpoint', () => {}, (err) => { fnError(err); resolve(); }, () => {});
      });

      expect(fnError).toHaveBeenCalled();
    });

    it('invoca fnFinally tanto en éxito como en error (regresión: antes nunca se llamaba)', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockResolvedValueOnce(jsonResponse({ status: 'success' }));

      const fnFinallySuccess = vi.fn();
      await new Promise((resolve) => {
        request.GET('ok', () => {}, () => {}, () => { fnFinallySuccess(); resolve(); });
      });
      expect(fnFinallySuccess).toHaveBeenCalledTimes(1);

      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      const fnFinallyError = vi.fn();
      await new Promise((resolve) => {
        request.GET('fails', () => {}, () => {}, () => { fnFinallyError(); resolve(); });
      });
      expect(fnFinallyError).toHaveBeenCalledTimes(1);
    });

    it('despacha logout y no manda token si no hay sesión guardada', async () => {
      global.fetch.mockResolvedValue(jsonResponse({ status: 'success' }));

      await new Promise((resolve) => request.GET('some/endpoint', () => {}, () => {}, resolve));

      expect(logoutUserMock).toHaveBeenCalled();
      expect(dispatchMock).toHaveBeenCalled();
      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer undefined');
    });

    it('con token expirado, limpia localStorage y despacha logout', async () => {
      setStoredUser(makeToken(pastExp()));
      global.fetch.mockResolvedValue(jsonResponse({ status: 'success' }));

      await new Promise((resolve) => request.GET('some/endpoint', () => {}, () => {}, resolve));

      expect(logoutUserMock).toHaveBeenCalled();
      expect(dispatchMock).toHaveBeenCalled();
      expect(localStorage.getItem('mw_current_user')).toBeNull();
    });

    it('no dispara el chequeo de token para URLs públicas, incluso sin sesión guardada', async () => {
      global.fetch.mockResolvedValue(jsonResponse({ status: 'success' }));

      await new Promise((resolve) => request.GET('login', () => {}, () => {}, resolve));

      expect(dispatchMock).not.toHaveBeenCalled();
      const [, options] = global.fetch.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer ');
    });
  });

  describe('POST', () => {
    it('llama a success con el body cuando el status del body es "success"', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockResolvedValue(jsonResponse({ status: 'success', id: 10 }));

      const success = vi.fn();
      await new Promise((resolve) => {
        request.POST('some/endpoint', { name: 'x' }, success, () => {}, false, resolve);
      });

      expect(success).toHaveBeenCalledWith({ status: 'success', id: 10 });
    });

    it('invoca fnFinally incluso cuando falla', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const fnFinally = vi.fn();
      await new Promise((resolve) => {
        request.POST('some/endpoint', {}, () => {}, () => {}, false, () => { fnFinally(); resolve(); });
      });

      expect(fnFinally).toHaveBeenCalledTimes(1);
    });
  });

  describe('mensaje de error del back (SPEC v2-20)', () => {
    const businessBody = (message, description) => ({
      status: 'error', data: [], messages: [{ type: 'error', message, description }],
    });
    const call = (method, response) => new Promise((resolve) => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockResolvedValue(response);
      if (method === 'DELETE') request.DELETE('some/endpoint/1', () => {}, () => {}, true, resolve);
      else request[method]('some/endpoint', {}, () => {}, () => {}, true, resolve);
    });

    beforeEach(() => { notification.mockClear(); vi.spyOn(console, 'error').mockImplementation(() => {}); });

    it.each(['POST', 'PUT', 'DELETE'])('%s: un 400 con una clave traducida muestra la traducción', async (method) => {
      await call(method, jsonResponse(businessBody('period.closed.module', 'x'), { ok: false, status: 400 }));
      expect(notification).toHaveBeenCalledWith('error', 'error.period.closed.module', 'alert.error.title');
    });

    it.each(['POST', 'PUT', 'DELETE'])('%s: un 400 sin traducción muestra la description del back', async (method) => {
      await call(method, jsonResponse(businessBody('notFound', 'El cheque no existe'), { ok: false, status: 400 }));
      expect(notification).toHaveBeenCalledWith('error', { text: 'El cheque no existe' }, 'alert.error.title');
    });

    it.each([
      ['POST', 'msg.save.record.error'],
      ['PUT', 'msg.update.record.error'],
      ['DELETE', 'msg.delete.record.error'],
    ])('%s: un 500 mantiene el mensaje genérico y no muestra la falla interna', async (method, generic) => {
      await call(method, jsonResponse(businessBody('server.error', 'SequelizeDatabaseError: Unknown column'), { ok: false, status: 500 }));
      expect(notification).toHaveBeenCalledWith('error', generic, 'alert.error.title');
    });

    it('un 403 de permisos muestra la traducción del permiso', async () => {
      const forbidden = { id: 403, type: 'Forbidden', message: 'user.update.forbidden', description: 'User Update Forbidden', status: 'error', data: [], messages: [{ type: 'error', message: 'user.update.forbidden', description: 'User Update Forbidden' }] };
      await call('PUT', jsonResponse(forbidden, { ok: false, status: 403 }));
      expect(notification).toHaveBeenCalledWith('error', 'error.user.update.forbidden', 'alert.error.title');
    });

    it('un 403 sin traducción muestra la description del back', async () => {
      const forbidden = { id: 403, type: 'Forbidden', message: 'user.otro.forbidden', description: 'No tiene permiso', status: 'error', data: [], messages: [{ type: 'error', message: 'user.otro.forbidden', description: 'No tiene permiso' }] };
      await call('PUT', jsonResponse(forbidden, { ok: false, status: 403 }));
      expect(notification).toHaveBeenCalledWith('error', { text: 'No tiene permiso' }, 'alert.error.title');
    });

    it('una respuesta sin cuerpo JSON mantiene el mensaje genérico', async () => {
      await call('POST', jsonResponse(undefined, { ok: false, status: 502, statusText: 'Bad Gateway' }));
      expect(notification).toHaveBeenCalledWith('error', 'msg.save.record.error', 'alert.error.title');
    });

    it('un fallo de red mantiene el mensaje genérico', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
      await new Promise((resolve) => { request.POST('some/endpoint', {}, () => {}, () => {}, true, resolve); });
      expect(notification).toHaveBeenCalledWith('error', 'msg.save.record.error', 'alert.error.title');
    });

    it('con showMessage false no notifica nada', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockResolvedValue(jsonResponse(businessBody('notFound', 'x'), { ok: false, status: 400 }));
      await new Promise((resolve) => { request.POST('some/endpoint', {}, () => {}, () => {}, false, resolve); });
      expect(notification).not.toHaveBeenCalled();
    });

    it('el callback de error recibe el cuerpo con statusCode', async () => {
      setStoredUser(makeToken(futureExp()));
      global.fetch.mockResolvedValue(jsonResponse(businessBody('notFound', 'x'), { ok: false, status: 400 }));
      const fnError = vi.fn();
      await new Promise((resolve) => { request.POST('some/endpoint', {}, () => {}, fnError, false, resolve); });
      expect(fnError).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, messages: expect.any(Array) }));
    });
  });
});

describe('core.js — buildUrl', () => {
  it('arma la query string con múltiples params', () => {
    expect(buildUrl('billing/process/invoiceDetail', { idFather: 42 })).toBe(
      'billing/process/invoiceDetail?idFather=42'
    );
  });

  it('devuelve el path sin "?" cuando no hay params', () => {
    expect(buildUrl('inventory/process/providers')).toBe('inventory/process/providers');
    expect(buildUrl('inventory/process/providers', {})).toBe('inventory/process/providers');
  });

  it('codifica caracteres especiales en valores de texto libre (el bug real que motivó esto)', () => {
    const url = buildUrl('hotel/settings/rooms/paginate', { page: 1, limit: 10, q: 'a&b=c' });
    expect(url).toBe('hotel/settings/rooms/paginate?page=1&limit=10&q=a%26b%3Dc');
  });

  it('codifica espacios y acentos', () => {
    const url = buildUrl('search', { q: 'habitación doble' });
    expect(url).toBe('search?q=habitaci%C3%B3n+doble');
  });

  it('omite params undefined/null pero conserva string vacío', () => {
    const url = buildUrl('reports', { a: undefined, b: null, c: '' });
    expect(url).toBe('reports?c=');
  });
});

describe('core.js — getFile', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  it('devuelve la object URL del blob cuando la respuesta es 2xx', async () => {
    setStoredUser(makeToken(futureExp()));
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => new Blob(['file-content']),
    });

    const url = await request.getFile('rrhh/process/employees/getProfileImage/1');

    expect(url).toBe('blob:mock-url');
  });

  it('no rechaza (ni tira una excepción no manejada) ante un 401 — devuelve undefined', async () => {
    setStoredUser(makeToken(futureExp()));
    global.fetch.mockResolvedValue(
      jsonResponse(undefined, { ok: false, status: 401, statusText: 'Unauthorized' })
    );

    const url = await request.getFile('rrhh/process/employees/getProfileImage/1');

    expect(url).toBeUndefined();
  });
});

describe('core.js — request.GETPdf', () => {
  const blobResponse = () => ({ ok: true, status: 200, blob: async () => new Blob(['%PDF-']) });

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
    global.window.URL.createObjectURL = vi.fn(() => 'blob:test');
  });

  it('por defecto envía POST con el body en JSON (comportamiento previo)', async () => {
    setStoredUser(makeToken(futureExp()));
    global.fetch.mockResolvedValue(blobResponse());

    request.GETPdf('some/report', { type: 'summary' }, 'r.pdf');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/some\/report$/);
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ type: 'summary' }));
  });

  it("con 'GET' envía los datos como query string y sin body", async () => {
    setStoredUser(makeToken(futureExp()));
    global.fetch.mockResolvedValue(blobResponse());

    request.GETPdf('some/report', { type: 'detailed' }, 'r.pdf', undefined, 'GET');
    await vi.waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toMatch(/some\/report\?type=detailed$/);
    expect(options.method).toBe('GET');
    expect(options.body).toBeUndefined();
    expect(options.headers.Authorization).toMatch(/^Bearer /);
  });
});
