import { Buffer } from 'buffer';
import notification from '@Containers/ui/Notifications';
import { logoutUser } from '@Redux/actions';

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

const fnGetToken = () => {
  const dataUser = JSON.parse(localStorage.getItem('mw_current_user'));
  if (!dataUser) {
    logoutUser();
    return;
  }
  if (isTokenExpired(dataUser.token)) {
    logoutUser();
    localStorage.removeItem('mw_current_user');
    // window.location.href = "#/login";
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

const normalizeDates = (obj) => {
  if (Array.isArray(obj)) {
    let normalizedArray = [...obj];
    normalizedArray = normalizedArray.map((elem) => {
      const normalized = { ...elem };
      Object.keys(normalized).forEach(key => {
        if (normalized[key] instanceof Date) {
          const date = normalized[key];
          normalized[key] = new Date(
            `${date.toJSON().substring(0, 10)}T${date.toLocaleTimeString()}.000Z`
          );
        }
      });
      return normalized;
    });
    return normalizedArray;
  } else {
    const normalized = { ...obj };
    Object.keys(normalized).forEach(key => {
      if (normalized[key] instanceof Date) {
        const date = normalized[key];
        normalized[key] = new Date(
          `${date.toJSON().substring(0, 10)}T${date.toLocaleTimeString()}.000Z`
        );
      }
    });
    return normalized;
  }
};

// Función base genérica
const apiRequest = async (method, url, options = {}) => {
  const {
    data = null,
    fnSuccess,
    fnError,
    showMessage = true,
    fnFinally,
    successMsg = 'msg.save.record',
    errorMsg = 'msg.save.record.error'
  } = options;

  try {
    const baseUrl = url.split('?')[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();

    const normalizedData = data ? normalizeDates(data) : null;

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    if (normalizedData && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(normalizedData);
    }

    const response = await fetch(`${urlAPI}${url}`, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success' || result.status === 200) {
      fnSuccess?.(result);
      if (showMessage) {
        notification('success', successMsg, 'alert.success.title');
      }
      return { success: true, data: result };
    } else {
      fnError?.(result);
      if (showMessage) {
        notification('error', errorMsg, 'alert.error.title');
      }
      console.error('API Error:', result);
      return { success: false, data: result };
    }

  } catch (err) {
    fnError?.(err);
    if (showMessage) {
      notification('error', errorMsg, 'alert.error.title');
    }
    console.error('Request Error:', err);
    return { success: false, error: err };
  } finally {
    fnFinally?.();
  }
};

// Funciones específicas simplificadas

const request = {
  moveScrollTop: () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  },
  GET: (url, fnSuccess, fnError, fnFinally) => apiRequest('GET', url, { fnSuccess, fnError, fnFinally, showMessage: false }),

  POST: (url, data, fnSuccess, fnError, showMessage = true, fnFinally) =>
    apiRequest('POST', url, {
      data,
      fnSuccess,
      fnError,
      showMessage,
      fnFinally,
      successMsg: 'msg.save.record',
      errorMsg: 'msg.save.record.error'
    }),

  PUT: (url, data, fnSuccess, fnError, showMessage = true, fnFinally) =>
    apiRequest('PUT', url, {
      data,
      fnSuccess,
      fnError,
      showMessage,
      fnFinally,
      successMsg: 'msg.update.record',
      errorMsg: 'msg.update.record.error'
    }),

  DELETE: (url, fnSuccess, fnError, showMessage = true, fnFinally) =>
    apiRequest('DELETE', url, {
      fnSuccess,
      fnError,
      showMessage,
      fnFinally,
      successMsg: 'msg.delete.record',
      errorMsg: 'msg.delete.record.error'
    }),

  PATCH: (url, data, fnSuccess, fnError, showMessage = true, fnFinally) =>
    apiRequest('PATCH', url, {
      data,
      fnSuccess,
      fnError,
      showMessage,
      fnFinally,
      successMsg: 'msg.update.record',
      errorMsg: 'msg.update.record.error'
    }),

  GETPdf: (url, data, fileName, fnError) => {
    const token = fnGetToken();
    fetch(`${urlAPI}${url}`, {
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
      .then((response) => {
        return response.blob();
      })
      .then((response) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(response);
        a.download = fileName;
        a.click();
        return response.blob();
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
    fetch(`${urlAPI}${url}`, {
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
      .then((response) => {
        return response.blob();
      })
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

  // GET con parámetros de query
  getJSON: async (url, params = {}, fnSuccess, fnError) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      const baseUrl = fullUrl.split('?')[0];
      const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();

      const response = await fetch(`${urlAPI}${fullUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' || result.status === 200) {
        fnSuccess?.(result);
        return { success: true, data: result };
      } else {
        fnError?.(result);
        console.error('API Error:', result);
        return { success: false, data: result };
      }

    } catch (err) {
      fnError?.(err);
      console.error('Request Error:', err);
      return { success: false, error: err };
    }
  },

  // Descargar PDF
  downloadPDF: async (url, data, fileName, fnError) => {
    try {
      const token = fnGetToken();

      const response = await fetch(`${urlAPI}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      // Limpiar el objeto URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(link.href), 100);

      return { success: true };

    } catch (err) {
      fnError?.(err);
      console.error('Download PDF Error:', err);
      return { success: false, error: err };
    }
  },

  // Obtener URL de PDF (para preview)
  getPDFUrl: async (url, data, fnSuccess, fnError) => {
    try {
      const token = fnGetToken();

      const response = await fetch(`${urlAPI}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      fnSuccess?.(objectURL);
      return { success: true, url: objectURL };

    } catch (err) {
      fnError?.(err);
      console.error('Get PDF URL Error:', err);
      return { success: false, error: err };
    }
  },

  // Exportar a Excel
  exportToXLSX: async (url, data = {}, fileName, fnSuccess, fnError) => {
    try {
      const token = fnGetToken();

      const response = await fetch(`${urlAPI}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const contentType = response.headers.get('Content-Type');

      // Soporte para IE/Edge legacy
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, fileName);
      } else {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpiar el objeto URL
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      }

      fnSuccess?.({ success: true });
      return { success: true };

    } catch (err) {
      fnError?.(err);
      console.error('Export XLSX Error:', err);
      return { success: false, error: err };
    }
  },

  // Obtener archivo como URL de objeto
  getFile: async (url, fnSuccess, fnError) => {
    try {
      const baseUrl = url.split('?')[0];
      const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();

      const response = await fetch(`${urlAPI}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      fnSuccess?.(objectURL);
      return { success: true, url: objectURL };

    } catch (err) {
      fnError?.(err);
      console.error('Get File Error:', err);
      return { success: false, error: err };
    }
  },

  // Subir archivos
  uploadFiles: async (url, files = [], fnSuccess, fnError, showMessage = true) => {
    if (!files || files.length === 0) {
      console.warn('No files to upload');
      return { success: false, error: 'No files provided' };
    }

    try {
      const formData = new FormData();
      files.forEach(item => {
        formData.append('files', item.file);
      });

      const token = fnGetToken();

      const response = await fetch(`${urlAPI}${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No incluir Content-Type para que el navegador lo establezca automáticamente con boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' || result.status === 200) {
        fnSuccess?.(result);
        if (showMessage) {
          notification('success', 'msg.upload.record', 'alert.success.title');
        }
        return { success: true, data: result };
      } else {
        fnError?.(result);
        if (showMessage) {
          notification('error', 'msg.upload.record.error', 'alert.error.title');
        }
        console.error('Upload Error:', result);
        return { success: false, data: result };
      }

    } catch (err) {
      fnError?.(err);
      if (showMessage) {
        notification('error', 'msg.upload.record.error', 'alert.error.title');
      }
      console.error('Upload Files Error:', err);
      return { success: false, error: err };
    }
  }

};

export { request, moveScrollTop };

// getFile: async (url) => {
//   const baseUrl = url.split('?')[0];
//   const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
//   const dataFile = await fetch(`${urlAPI}${url}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`
//     },
//   });
//   const fileBlob = await dataFile.blob();
//   const fileObjectURL = URL.createObjectURL(fileBlob);
//   return fileObjectURL;
// },

// uploadFiles: (url, files = [], fnSuccess, fnError) => {
//   if (files.length <= 0) {
//     return;
//   }

//   const formData = new FormData();
//   files.forEach(item => {
//     formData.append('files', item.file);
//   });
//   const token = fnGetToken();
//   fetch(`${urlAPI}${url}`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`
//     },
//     body: formData
//   }).then((response) => {
//     return response.json();
//   })
//     .then((response) => {
//       if (response.status === "success" || response.status === 200) {
//         if (typeof fnSuccess === 'function') fnSuccess(response);
//         notification('success', 'msg.upload.record', 'alert.success.title');
//       } else {
//         if (typeof fnError === 'function') fnError(response);
//         console.error(response)
//         notification('error', 'msg.upload.record.error', 'alert.error.title');
//       }
//       return response;
//     })
//     .catch((err) => {
//       if (typeof fnError === 'function') fnError(err);
//       notification('error', 'msg.upload.record.error', 'alert.error.title');
//       console.error(err);
//       return err;
//     });
// },

// getJSON: async (url, params, onSuccess) => {

//   const qtyParams = Object.keys(params).length;
//   const strParams = Object.keys(params).reduce((acc, curr, idx) => {
//     acc += curr + '=' + params[curr] + (idx < (qtyParams - 1) ? "&" : "");
//     return acc;
//   }, "");
//   url = `${urlAPI}${url}` + (strParams.length > 0 ? `?${strParams}` : '');
//   const token = fnGetToken();
//   let data = await fetch(url, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`
//     },
//   })
//     .then((response) => {
//       return response.json();
//     })
//     .then((response) => {
//       if (response.status === 'success' || response.status === 200) {
//         if (typeof onSuccess === 'function') onSuccess(response);
//       } else {
//         console.error(response);
//       }
//       return response;
//     })
//     .catch((err) => {
//       console.error(err);
//       return err;
//     });
//   return data;
// },