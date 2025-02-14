const querystring = require('querystring');
const FormData = require('form-data');
const axios = require('axios');
const https = require('https');
const { bodyTypesEnums } = require('../src/components/common/bodyTypeEnums');
const HITMAN_AGENT = 'Hitman/1.0.0';
const cancelTokenMap = new Map();

async function makeHttpRequestThroughAxios({ api: url, method, body: data, header: headers, keyForRequest, sslMode }, FILE_UPLOAD_DIRECTORY) {
  const httpsAgent = getAgent(sslMode);
  headers = headers || {};
  headers['user-agent'] = HITMAN_AGENT;
  const options = {
    method: method,
    url: encodeURI(url),
    headers,
    data,
    proxy: false,
    cancelToken: createCancelToken(keyForRequest),
    httpsAgent,
  };
  if (headers['content-type'] === bodyTypesEnums['multipart/form-data']) {
    const bodyFormData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object') {
        const fs = require('fs');
        try {
          const destPath = FILE_UPLOAD_DIRECTORY + value.id + '_' + value.name;
          const srcExist = fs.existsSync(value.srcPath);
          const destExist = value.id ? fs.existsSync(destPath) : false;
          if (!srcExist && !destExist) continue;

          let filePath = value.srcPath;
          if (srcExist) fs.copyFileSync(filePath, destPath);

          if (!srcExist && destExist) filePath = destPath;

          const stream = fs.createReadStream(filePath);
          bodyFormData.append(key, stream);
        } catch (e) {}
      } else {
        bodyFormData.append(key, value);
      }
    }
    options.data = bodyFormData;
    options.headers = { ...headers, ...bodyFormData.getHeaders() };
  } else if (headers['content-type'] === bodyTypesEnums['application/x-www-form-urlencoded']) {
    options.data = querystring.stringify(data);
  }
  return new Promise((resolve, reject) => {
    axios(options)
      .then(function (response) {
        cancelTokenMap.delete(keyForRequest);
        resolve({
          status: 200,
          data: prepareResponse(response),
        });
      })
      .catch(function (error) {
        cancelTokenMap.delete(keyForRequest);
        if (axios.isCancel(error)) {
          resolve({
            status: 200,
            data: { success: false, error },
          });
        } else if (!error.response) {
          resolve({
            status: 200,
            data: { success: false, error },
          });
        } else {
          resolve({
            status: 200,
            data: prepareResponse(error.response),
          });
        }
      });
  });
}

function createCancelToken(key) {
  cancelTokenMap.set(key, axios.CancelToken.source());
  return cancelTokenMap.get(key).token;
}

function getAgent(sslMode = true) {
  const rejectUnauthorized = sslMode;
  const agent = new https.Agent({
    rejectUnauthorized,
  });
  return agent;
}

function prepareResponse(data) {
  return {
    success: true,
    status: data.status,
    statusText: data.statusText,
    response: data.data,
    headers: data.headers,
  };
}

function invokeCancel(key) {
  cancelTokenMap.get(key).cancel('Request was cancelled');
}

module.exports = { makeHttpRequestThroughAxios, invokeCancel };
