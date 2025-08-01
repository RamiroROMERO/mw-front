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
    console.log('dont logged!')
    localStorage.removeItem('mw_current_user');
    // window.location.href = "#/login";
    return;
  }
  return dataUser.token;
}

const request = {
  GET: (url, fnSuccess, fnError) => {
    const baseUrl = url.split('?')[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
    fetch(`${urlAPI}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.status === 'success' || response.status === 200) {
          if (typeof fnSuccess === 'function') {
            fnSuccess(response);
          } else {
            console.log(response);
          }
        } else if (typeof fnError === 'function') {
          fnError(response);
        } else {
          console.error(response);
        }
        return response;
      })
      .catch((err) => {
        console.log(err.status);
        if (err)
          if (typeof fnError === 'function') {
            fnError(err);
          } else {
            console.error(err);
          }
        return err;
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
    let data = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
      .then((response) => {
        return response.json();
      })
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
    const dataFile = await fetch(`${urlAPI}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const fileBlob = await dataFile.blob();
    const fileObjectURL = URL.createObjectURL(fileBlob);
    return fileObjectURL;
  },
  POST: (url, data, success, error, showMessage = true) => {
    const baseUrl = url.split("?")[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
    if (data) {
      Object.keys(data).map(item => {
        if (data[item] instanceof Date) {
          data[item] = new Date(`${data[item].toJSON().substring(0, 10)}T${data[item].toLocaleTimeString()}.000Z`)
        }
      })
    }
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
        return response.json();
      })
      .then((response) => {
        if (response.status === 'success' || response.status === 200) {
          if (typeof success === 'function') {
            success(response);
          } else {
            console.info(response);
          }
          if (showMessage) notification('success', 'msg.save.record', 'alert.success.title');
        } else if (typeof error === 'function') {
          error(response);
          if (showMessage) notification('error', 'msg.save.record.error', 'alert.error.title');
        } else {
          console.error(response);
        }
        return response;
      })
      .catch((err) => {
        if (typeof error === 'function') {
          error(err);
          if (showMessage) notification('error', 'msg.save.record.error', 'alert.error.title');
        } else {
          console.error(err);
        }
        return err;
      });
  },

  uploadFiles: (url, files = [], fnSuccess, fnError) => {
    if (files.length <= 0) {
      return;
    }

    const formData = new FormData();
    files.forEach(item => {
      console.log(item.name);
      formData.append('files', item.file);
    });
    console.log("formData", formData);
    const token = fnGetToken();
    fetch(`${urlAPI}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then((response) => {
      return response.json();
    })
      .then((response) => {
        if (response.status === "success" || response.status === 200) {
          if (typeof fnSuccess === 'function') {
            fnSuccess(response);
          } else {
            console.info(response);
          }
          return notification('success', 'msg.upload.record', 'alert.success.title');
        } else if (typeof fnError === 'function') {
          fnError(response);
          return notification('error', 'msg.upload.record.error', 'alert.error.title');
        } else {
          console.error(response)
        }
        return response;
      })
      .catch((err) => {
        if (typeof fnError === 'function') {
          fnError(err);
          return notification('error', 'msg.upload.record.error', 'alert.error.title');
        } else {
          console.error(err);
        }
        return err;
      });
  },
  PUT: (url, data, fnSuccess, fnError, showMessage = true) => {
    const baseUrl = url.split("?")[0];
    const token = urlPublic.includes(baseUrl) ? '' : fnGetToken();
    if (data) {
      Object.keys(data).map(item => {
        if (data[item] instanceof Date) {
          data[item] = new Date(`${data[item].toJSON().substring(0, 10)}T${data[item].toLocaleTimeString()}.000Z`)
        }
      })
    }
    fetch(`${urlAPI}${url}`, {
      async: true,
      crossDomain: true,
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      contentType: 'JSON',
      body: JSON.stringify(data)
    }).then((response) => {
      return response.json();
    })
      .then((response) => {
        if (response.status === "success" || response.status === 200) {
          if (typeof fnSuccess === 'function') {
            fnSuccess(response);
          } else {
            console.info(response);
          }
          if (showMessage) notification('success', 'msg.update.record', 'alert.success.title');
        } else if (typeof fnError === 'function') {
          fnError(response);
          if (showMessage) notification('error', 'msg.update.record.error', 'alert.error.title');
        } else {
          console.error(response)
        }
        return response;
      })
      .catch((err) => {
        if (typeof fnError === 'function') {
          fnError(err);
          if (showMessage) notification('error', 'msg.update.record.error', 'alert.error.title');
        } else {
          console.error(err);
        }
        return err;
      });
  },
  DELETE: (url, fnSuccess, fnError, showMessage = true) => {
    const token = fnGetToken();
    fetch(`${urlAPI}${url}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.status === "success" || response.status === 200) {
          if (typeof fnSuccess === 'function') {
            fnSuccess(response)
          } else {
            console.info(response);
          }
          if (showMessage) notification('success', 'msg.delete.record', 'alert.success.title');
        } else if (typeof fnError === 'function') {
          fnError(response);
        } else {
          console.error(response);
          if (showMessage) notification('error', 'msg.delete.record.error', 'alert.error.title');
        }
        return response;
      })
      .catch(err => {
        if (typeof fnError === 'function') {
          fnError(err);
          if (showMessage) notification('error', 'msg.delete.record.error', 'alert.error.title');
        } else {
          console.error(err);
        }
        return err;
      });
  }
};

const fnTest = () => {
  return 'texto';
};

export { request, fnTest };
