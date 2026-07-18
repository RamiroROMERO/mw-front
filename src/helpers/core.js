import { Buffer } from 'buffer';
import notification from '@Containers/ui/Notifications';
import { logoutUser } from '@Redux/actions';
import { getStore } from '@Redux/stores';

import envs from './envs';
const urlAPI = envs.URL_API;

import { urlPublic } from './app.json';

function isTokenExpired(token) {
  const payloadBase64 = token.split('.')[1];
  const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
  const decoded = JSON.parse(decodedJson)
  const { exp } = decoded;
  const expired = (Date.now() >= exp * 1000)
  return expired
}

// La saga de auth (src/redux/auth/saga.js) espera un "history" invocable como
// react-router's navigate(path, options). Fuera del árbol de React no hay acceso
// a useNavigate(), así que se normaliza a window.location.hash (la app usa HashRouter).
const forceNavigateToLogin = (path = '/login') => {
  const clean = path.replace(/^\/?#?/, '');
  window.location.hash = clean.startsWith('/') ? clean : `/${clean}`;
};

const dispatchLogout = () => {
  const store = getStore();
  if (store) {
    store.dispatch(logoutUser(forceNavigateToLogin));
  } else {
    forceNavigateToLogin();
  }
};

const fnGetToken = () => {
  const dataUser = JSON.parse(localStorage.getItem('mw_current_user'));
  if (!dataUser) {
    dispatchLogout();
    return;
  }
  if (isTokenExpired(dataUser.token)) {
    localStorage.removeItem('mw_current_user');
    dispatchLogout();
    return;
  }
  return dataUser.token;
}

const moveScrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Arma una query string codificada correctamente a partir de un objeto de
// params, reemplazando la concatenación manual (`path?a=${a}&b=${b}`) que
// no escapaba caracteres especiales — un texto de búsqueda con "&" o "="
// rompía o contaminaba la query string real en vez de viajar como valor.
const buildUrl = (path, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, value);
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

const DEFAULT_TIMEOUT_MS = 30000;

// fetch no soporta timeout nativo: sin esto, un backend que nunca responde
// deja el "loading" de la pantalla prendido para siempre.
const fetchWithTimeout = (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
};

// Antes de esto, una respuesta no-2xx con un body no-JSON (ej. una página
// HTML de error 500) hacía explotar response.json() con una excepción de
// parseo genérica. Ahora se revisa response.ok primero y, si el body no es
// JSON válido, se arma un objeto de error con la misma forma que ya esperan
// los callbacks fnError existentes (message legible + statusCode).
const parseResponse = async (response) => {
  let body;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  if (!response.ok) {
    throw body ?? {
      status: 'error',
      statusCode: response.status,
      messages: [{ description: response.statusText || 'Error de red' }],
    };
  }
  return body;
};

// Igual que parseResponse pero para endpoints que devuelven un blob (PDFs,
// imágenes, etc.) en vez de JSON. En error, intenta leer el body como texto
// (muchos backends devuelven JSON de error incluso en un endpoint de blob)
// antes de caer a un mensaje genérico basado en el status HTTP.
const parseBlobResponse = async (response) => {
  if (!response.ok) {
    let errorBody;
    try {
      const text = await response.text();
      errorBody = JSON.parse(text);
    } catch {
      errorBody = {
        status: 'error',
        statusCode: response.status,
        messages: [{ description: response.statusText || 'Error de red' }],
      };
    }
    throw errorBody;
  }
  return response.blob();
};

const request = {
  moveScrollTop: () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  },
  GET: (url, fnSuccess, fnError, fnFinaly = undefined) => {
    const baseUrl = url.split('?')[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
    fetchWithTimeout(`${urlAPI}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then(parseResponse)
      .then((response) => {
        if (response.status === 'success' || response.status === 200) {
          if (typeof fnSuccess === 'function') fnSuccess(response);
        } else {
          if (typeof fnError === 'function') fnError(response);
          console.error(response);
        }
        return response;
      })
      .catch((err) => {
        if (err && typeof fnError === 'function') fnError(err);
        console.error(err);
        return err;
      })
      .finally(() => {
        if (typeof fnFinaly === 'function') fnFinaly();
      });
  },
  POST: (url, data, success, error, showMessage = true, fnFinaly = undefined) => {
    const baseUrl = url.split("?")[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
    if (data) {
      Object.keys(data).map(item => {
        if (data[item] instanceof Date) {
          data[item] = new Date(`${data[item].toJSON().substring(0, 10)}T${data[item].toLocaleTimeString()}.000Z`)
        }
      })
    }
    fetchWithTimeout(`${urlAPI}${url}`, {
      async: true,
      crossDomain: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      contentType: 'JSON',
      body: JSON.stringify(data),
    })
      .then(parseResponse)
      .then((response) => {
        if (response.status === 'success' || response.status === 200) {
          if (typeof success === 'function') success(response);
          if (showMessage) notification('success', 'msg.save.record', 'alert.success.title');
        } else {
          if (typeof error === 'function') error(response);
          if (showMessage) notification('error', 'msg.save.record.error', 'alert.error.title');
          console.error(response);
        }
        return response;
      })
      .catch((err) => {
        if (typeof error === 'function') error(err);
        if (showMessage) notification('error', 'msg.save.record.error', 'alert.error.title');
        console.error(err);
        return err;
      })
      .finally(() => {
        if (typeof fnFinaly === 'function') fnFinaly();
      });
  },
  PUT: (url, data, fnSuccess, fnError, showMessage = true, fnFinaly = undefined) => {
    const baseUrl = url.split("?")[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
    if (data) {
      Object.keys(data).map(item => {
        if (data[item] instanceof Date) {
          data[item] = new Date(`${data[item].toJSON().substring(0, 10)}T${data[item].toLocaleTimeString()}.000Z`)
        }
      })
    }
    fetchWithTimeout(`${urlAPI}${url}`, {
      async: true,
      crossDomain: true,
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      contentType: 'JSON',
      body: JSON.stringify(data)
    }).then(parseResponse)
      .then((response) => {
        if (response.status === "success" || response.status === 200) {
          if (typeof fnSuccess === 'function') fnSuccess(response);
          if (showMessage) notification('success', 'msg.update.record', 'alert.success.title');
        } else {
          if (typeof fnError === 'function') fnError(response);
          if (showMessage) notification('error', 'msg.update.record.error', 'alert.error.title');
          console.error(response)
        }
        return response;
      })
      .catch((err) => {
        if (typeof fnError === 'function') fnError(err);
        if (showMessage) notification('error', 'msg.update.record.error', 'alert.error.title');
        console.error(err);
        return err;
      })
      .finally(() => {
        if (typeof fnFinaly === 'function') fnFinaly();
      });
  },
  DELETE: (url, fnSuccess, fnError, showMessage = true, fnFinaly = undefined) => {
    const token = fnGetToken();
    fetchWithTimeout(`${urlAPI}${url}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    })
      .then(parseResponse)
      .then((response) => {
        if (response.status === "success" || response.status === 200) {
          if (typeof fnSuccess === 'function') fnSuccess(response);
          if (showMessage) notification('success', 'msg.delete.record', 'alert.success.title');
        } else {
          if (typeof fnError === 'function') fnError(response);
          if (showMessage) notification('error', 'msg.delete.record.error', 'alert.error.title');
          console.error(response);
        }
        return response;
      })
      .catch(err => {
        if (typeof fnError === 'function') fnError(err);
        if (showMessage) notification('error', 'msg.delete.record.error', 'alert.error.title');
        console.error(err);
        return err;
      })
      .finally(() => {
        if (typeof fnFinaly === 'function') fnFinaly();
      });
  },
  getJSON: async (url, params, onSuccess) => {

    const qtyParams = Object.keys(params).length;
    const strParams = Object.keys(params).reduce((acc, curr, idx) => {
      acc += curr + '=' + params[curr] + (idx < (qtyParams - 1) ? "&" : "");
      return acc;
    }, "");
    url = `${urlAPI}${url}` + (strParams.length > 0 ? `?${strParams}` : '');
    const token = fnGetToken();
    let data = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then(parseResponse)
      .then((response) => {
        if (response.status === 'success' || response.status === 200) {
          if (typeof onSuccess === 'function') onSuccess(response);
        } else {
          console.error(response);
        }
        return response;
      })
      .catch((err) => {
        console.error(err);
        return err;
      });
    return data;
  },
  GETPdf: (url, data, fileName, fnError) => {
    const token = fnGetToken();
    fetchWithTimeout(`${urlAPI}${url}`, {
      async: true,
      crossDomain: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      contentType: 'JSON',
      body: JSON.stringify(data),
    })
      .then(parseBlobResponse)
      .then((blob) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        return blob;
      })
      .catch((err) => {
        if (typeof fnError === 'function') {
          fnError(err);
        } else {
          console.error(err);
        }
        return err;
      });
  },
  GETPdfUrl: (url, data, fnSuccess, fnError) => {
    const token = fnGetToken();
    fetchWithTimeout(`${urlAPI}${url}`, {
      async: true,
      crossDomain: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      contentType: 'JSON',
      body: JSON.stringify(data),
    })
      .then(parseBlobResponse)
      .then((response) => {
        const url = URL.createObjectURL(response);
        if (typeof fnSuccess === 'function') {
          fnSuccess(url);
        } else {
        }
        return url;
      })
      .catch((err) => {
        if (typeof fnError === 'function') fnError(err);
        console.error(err);
        return err;
      });
  },
  fnExportToXLSX: (url, data = {}, fileName) => {
    return new Promise(function (resolve, reject) {
      const token = fnGetToken();
      if (!url) {
        return;
      }
      let dataRequest = JSON.stringify(data);
      let xhr = new XMLHttpRequest();
      xhr.open('POST', `${urlAPI}${url}`, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {
        if (this.status === 200) {
          var blob = this.response;
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, fileName);
          } else {
            var downloadLink = window.document.createElement('a');
            var contentTypeHeader = xhr.getResponseHeader("Content-Type");
            downloadLink.href = window.URL.createObjectURL(new Blob([blob], {
              type: contentTypeHeader
            }));
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          }
          resolve(xhr.response);
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send(dataRequest);
    });
  },
  getFile: async (url) => {
    const baseUrl = url.split('?')[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
    const dataFile = await fetchWithTimeout(`${urlAPI}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const fileBlob = await parseBlobResponse(dataFile);
    const fileObjectURL = URL.createObjectURL(fileBlob);
    return fileObjectURL;
  },
  uploadFiles: (url, files = [], fnSuccess, fnError) => {
    if (files.length <= 0) {
      return;
    }

    const formData = new FormData();
    files.forEach(item => {
      formData.append('files', item.file);
    });
    const token = fnGetToken();
    // Los uploads pueden tardar más que un request JSON típico en redes lentas.
    fetchWithTimeout(`${urlAPI}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }, 120000)
      .then(parseResponse)
      .then((response) => {
        if (response.status === "success" || response.status === 200) {
          if (typeof fnSuccess === 'function') fnSuccess(response);
          notification('success', 'msg.upload.record', 'alert.success.title');
        } else {
          if (typeof fnError === 'function') fnError(response);
          console.error(response)
          notification('error', 'msg.upload.record.error', 'alert.error.title');
        }
        return response;
      })
      .catch((err) => {
        if (typeof fnError === 'function') fnError(err);
        notification('error', 'msg.upload.record.error', 'alert.error.title');
        console.error(err);
        return err;
      });
  },

};

export { request, moveScrollTop, buildUrl };
