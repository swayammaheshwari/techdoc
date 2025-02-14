import _ from 'lodash';
import { toast } from 'react-toastify';
import moment from 'moment';
import { bodyTypesEnums, rawTypesEnums } from '../common/bodyTypeEnums';
import { fixSpanTags, getInnerText, getIntoTextBlock, getQueryParamsHTML } from '@/utilities/htmlConverter';
const rawBodyTypes = Object.keys(rawTypesEnums);

const makeOriginalParams = (keys, values, description, value, endpointContent) => {
  const originalParams = [];
  let trueCounter = 0;
  const queryParamsHtmlData = getQueryParamsHTML(value);
  for (let i = 0; i < endpointContent?.originalParams?.length; i++) {
    if (endpointContent?.originalParams[i].checked === 'false' || endpointContent?.originalParams[i].checked === 'false') {
      originalParams.push({
        checked: endpointContent?.originalParams[i].checked,
        key: endpointContent?.originalParams[i].key,
        value: endpointContent?.originalParams[i].value,
        description: endpointContent?.originalParams[i].description,
        type: endpointContent?.originalParams[i].type,
      });
    } else if (endpointContent?.originalParams[i].checked === 'true' && (endpointContent?.originalParams[i]?.key?.length > 0 || endpointContent?.originalParams[i]?.value?.length > 0 || endpointContent?.originalParams[i]?.description?.length > 0)) {
      if (trueCounter > queryParamsHtmlData?.length) break;
      originalParams.push({
        checked: 'true',
        key: fixSpanTags(queryParamsHtmlData?.[trueCounter]?.key?.html),
        value: fixSpanTags(queryParamsHtmlData?.[trueCounter]?.value?.html),
        description: endpointContent?.originalParams[i]?.description,
      });
      trueCounter++;
    }
  }
  while (trueCounter < queryParamsHtmlData?.length) {
    originalParams.push({
      checked: 'true',
      key: fixSpanTags(queryParamsHtmlData[trueCounter].key.html),
      value: fixSpanTags(queryParamsHtmlData[trueCounter].value.html),
      description: description[trueCounter] || '',
    });
    trueCounter++;
  }
  originalParams.push({
    checked: 'notApplicable',
    key: '',
    value: '',
    description: '',
    type: '',
  });
  return originalParams;
};

const makeHeaders = (headersData) => {
  const processedHeaders = Object.keys(headersData)
    .map((header) => ({
      name: getInnerText(header),
      value: getInnerText(headersData[header].value) || '""',
      comment: headersData[header].description || '',
      type: headersData[header].type || '',
    }))
    .filter((header) => header.name || header.value);
  return processedHeaders;
};

const makeParams = (params) => {
  const processedParams = [];
  if (params) {
    for (let i = 0; i < Object.keys(params)?.length; i++) {
      if (params[Object.keys(params)[i]].checked === 'true') {
        processedParams.push({
          name: getInnerText(params[Object.keys(params)[i]].key),
          value: getInnerText(params[Object.keys(params)[i]].value),
          comment: params[Object.keys(params)[i]].description,
          type: params[Object.keys(params)[i]].type,
        });
      }
    }
  }
  return processedParams;
};

const makeFormData = (body) => {
  const formData = {};
  for (let i = 0; i < body?.length; i++) {
    if (getInnerText(body[i].key)?.length !== 0 && body[i].checked === 'true') {
      if (body[i].type === 'file') {
        continue;
      }
      formData[getInnerText(body[i].key)] = getInnerText(body[i].value);
    }
  }
  return formData;
};

const formatBody = (body, headers) => {
  let finalBodyValue = null;
  switch (body.type) {
    case bodyTypesEnums['raw']:
      finalBodyValue = parseBody(body?.raw?.value || '');
      return { body: finalBodyValue, headers };
    case bodyTypesEnums['multipart/form-data']: {
      const formData = makeFormData(body[bodyTypesEnums['multipart/form-data']]);
      headers['content-type'] = bodyTypesEnums['multipart/form-data'];
      return { body: formData, headers };
    }
    case bodyTypesEnums['application/x-www-form-urlencoded']: {
      const urlEncodedData = {};
      for (let i = 0; i < body?.[bodyTypesEnums['application/x-www-form-urlencoded']]?.length; i++) {
        let innerTextKey = getInnerText(body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].key);
        let innerTextValue = getInnerText(body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].value);
        if (innerTextKey?.length !== 0 && body?.[bodyTypesEnums['application/x-www-form-urlencoded']][i].checked === 'true') {
          urlEncodedData[innerTextKey] = innerTextValue;
        }
      }
      return { body: urlEncodedData, headers };
    }
    default:
      return { body: body?.raw?.value, headers };
  }
};

const replaceVariables = (str, customEnv, x) => {
  let envVars = x;
  if (customEnv) {
    envVars = customEnv;
  }
  str = str?.toString() || '';
  const regexp = /{{((\w|-|\s)+)}}/g;
  let match = regexp.exec(str);
  const variables = [];
  if (match === null) return str;
  if (!envVars) {
    const missingVariable = match[1];
    return `${missingVariable}`;
  }
  do {
    variables.push(match[1]);
  } while ((match = regexp.exec(str)) !== null);
  variables.forEach((variable) => {
    const envVariable = envVars[variable];
    if (!envVariable) return;
    const strToReplace = `{{${variable}}}`;
    str = str.replace(strToReplace, envVariable.currentValue || envVariable.initialValue || '');
  });
  return str;
};

const replaceVariablesInJson = (json, customEnv) => {
  Object.keys(json).forEach((key) => {
    const updatedKey = replaceVariables(key, customEnv);
    if (updatedKey !== key) {
      json[updatedKey] = json[key];
      delete json[key];
    }
    json[updatedKey] = replaceVariables(json[updatedKey], customEnv);
  });
  return json;
};

const replaceVariablesInBody = (body, bodyType, customEnv) => {
  if ([bodyTypesEnums['multipart/form-data'], bodyTypesEnums['application/x-www-form-urlencoded']].includes(bodyType)) {
    return replaceVariablesInJson(body, customEnv);
  } else if (rawBodyTypes.includes(bodyType)) {
    return replaceVariables(body, customEnv);
  }
  return body;
};

const prepareBodyForSaving = (body) => {
  const data = _.cloneDeep(body);
  if (data?.type === bodyTypesEnums['multipart/form-data']) {
    data[bodyTypesEnums['multipart/form-data']].forEach((item) => {
      if (item.type === 'file') item.value = {};
    });
  }
  return data;
};

const prepareBodyForSending = (body) => {
  const data = _.cloneDeep(body);
  if (data.type === bodyTypesEnums['multipart/form-data']) {
    data[bodyTypesEnums['multipart/form-data']].forEach((item) => {
      if (item.type === 'file') item.value.srcPath = '';
    });
  }
  return data;
};

const prepareHeaderCookies = (url, cookiess) => {
  if (!url) return null;
  const domainUrl = url.split('/')[2];
  let cookies;
  Object.values(cookiess || {}).forEach((domain) => {
    if (domain.domain === domainUrl) {
      cookies = domain?.cookies;
    }
  });
  if (cookies) {
    let cookieString = '';
    Object.values(cookies || {}).forEach((cookie) => {
      let time;
      const expires = cookie.split(';')[2];
      if (expires.split('=')[1]) {
        time = expires.split('=')[1];
      }
      time = moment(time);
      if (!(time && moment(time).isBefore(moment().format()))) {
        cookieString += cookie.split(';')[0] + '; ';
      }
    });
    return cookieString;
  }
  return null;
};

const parseBody = (rawBody) => {
  let body = {};
  try {
    body = JSON.parse(rawBody);
    return body;
  } catch (error) {
    toast.error('Invalid Body');
    return body;
  }
};

const isBase64 = (response) => {
  if (typeof response !== 'string') {
    return false;
  }
  const base64Pattern = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return base64Pattern.test(response);
};

const extractParams = (pattern, pathname) => {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');

  const params = {};
  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const key = part.slice(1);
      params[key] = pathParts[index];
    }
  });

  return params;
};

function addhttps(url) {
  if (!url) return url;
  if (!/^(?:f|ht)tps?:\/\//.test(url)) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      url = 'http://' + url;
    } else {
      url = 'https://' + url;
    }
  }
  return url;
}

function getModifiedEndpiontURLForModifiedParams(originalParams, endpointUrl) {
  let newHTML = endpointUrl,
    modifiedEndpiontUrl = '';
  let queryParamsHtmlData = getQueryParamsHTML(endpointUrl);
  if (queryParamsHtmlData?.length != 0 && queryParamsHtmlData[0]?.key?.startIndex) {
    newHTML = newHTML.substring(0, queryParamsHtmlData[0].key.startIndex);
    if (!newHTML.endsWith('</span>')) newHTML = newHTML + '</span>';
  }
  let count = 0,
    paramsHTML = '';
  originalParams.forEach((params) => {
    if (params.checked == 'true') {
      if (count >= 1) paramsHTML += getIntoTextBlock('&');
      paramsHTML = paramsHTML + `${params.key}${getIntoTextBlock('=')}${params.value}`;
      count++;
    }
  });
  let counter = newHTML?.length;
  while (counter > -1) {
    if (newHTML[counter] === '?') break;
    counter--;
  }
  if (count === 0) {
    if (counter === -1 || counter === 0) {
      modifiedEndpiontUrl = newHTML;
    } else {
      newHTML = newHTML.substring(0, counter);
      if (newHTML.endsWith("<span text-block='true'>") || newHTML.endsWith('<span text-block="true">')) {
        newHTML = newHTML?.slice(0, -24);
      } else if (!newHTML.endsWith('</span>')) {
        newHTML = newHTML + '</span>';
      }
      modifiedEndpiontUrl = newHTML;
    }
  } else {
    if (counter === -1 || counter === 0) {
      modifiedEndpiontUrl = newHTML + getIntoTextBlock('?') + paramsHTML;
    } else {
      modifiedEndpiontUrl = newHTML + paramsHTML;
    }
  }
  return modifiedEndpiontUrl;
}

const getUrlByReplacingPathVariables = (url, env, pathVariables) => {
  let endpointUrl = new URL(addhttps(url));
  const pathname = decodeURIComponent(endpointUrl.pathname);
  const pathParameters = pathname.split('/');
  const pathVariablesMap = {};
  Object.values(pathVariables || {}).forEach((variable) => {
    pathVariablesMap[replaceVariables(getInnerText(variable.key), env)] = replaceVariables(getInnerText(variable.value), env);
  });
  for (let i = 0; i < pathParameters?.length; i++) {
    if (pathParameters[i][0] === ':') {
      const pathVariableKey = pathParameters[i].slice(1).trim();
      if (pathVariablesMap.hasOwnProperty(pathVariableKey) && pathVariablesMap[pathVariableKey] !== '') {
        pathParameters[i] = pathVariablesMap[pathVariableKey];
      } else {
        pathParameters[i] = ':' + pathVariableKey;
      }
    }
  }
  const path = pathParameters.join('/');
  return `${endpointUrl.origin}${path}${endpointUrl.search ? decodeURIComponent(endpointUrl.search) : ''}`;
};

function checkTokenExpired(expirationTime, generatedDateTime) {
  if (!expirationTime) return false;
  const generatedTime = new Date(generatedDateTime).getTime();
  const expirationDateTime = generatedTime + expirationTime;
  const currentTime = new Date().getTime();
  const isExpired = currentTime > expirationDateTime;

  return isExpired;
}

function checkValue(param, originalParams) {
  let valueFlag = false;
  const originalParam = originalParams.find((o) => o.key === param.key);
  if (originalParam.value === null || originalParam.value === '') {
    valueFlag = true;
  }
  return valueFlag;
}

export { replaceVariables, replaceVariablesInJson, replaceVariablesInBody, prepareBodyForSaving, prepareBodyForSending, prepareHeaderCookies, makeOriginalParams, makeParams, makeHeaders, formatBody, makeFormData, parseBody, isBase64, addhttps, extractParams, getModifiedEndpiontURLForModifiedParams, getUrlByReplacingPathVariables, checkTokenExpired, checkValue };
