import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import AutoSuggest from 'env-autosuggest';
import { apiTestJSON, apiTestFormData } from '@/components/endpoints/endpointApiService';
import { addhttps, getModifiedEndpiontURLForModifiedParams, getUrlByReplacingPathVariables, replaceVariables, replaceVariablesInJson } from '@/components/endpoints/endpointUtility';
import { getInnerText } from '@/utilities/htmlConverter';
import { rawTypesEnums } from '@/components/common/bodyTypeEnums';
import { storePublicEndpointData } from '@/store/publicStore/publicStoreActions';
import './publicHost.scss';

export default function PublicHost(props) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const { publicEnv, publicEndpointData } = useSelector((state) => {
    return {
      publicEnv: state.publicEnv,
      publicEndpointData: state.publicStore.publicEndpointData,
    };
  });

  const dispatch = useDispatch();

  const autoSuggestRef = useRef();
  const cancelTokenRef = useRef(null);
  const isRequestInitiated = useRef({ initiated: false });

  const [apiLoadingState, setApiLoadingState] = useState(false);

  useEffect(() => {
    autoSuggestRef.current.innerHTML = publicEndpointData?.URL || props?.url;
  }, [publicEndpointData?.URL]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [apiLoadingState]);

  function handleKeyDown(event) {
    if (((isMac && event.metaKey) || (!isMac && event.ctrlKey)) && event.key === 'Enter') handleRun();
    if (((isMac && event.metaKey) || (!isMac && event.ctrlKey)) && event.shiftKey && event.key === 'x') handleCancel();
  }

  function getDataReplacingVariables(data) {
    let selectedData = {};
    Object.keys(data || {})?.forEach((key) => {
      if (data?.[key]?.checked === 'true') {
        selectedData[replaceVariables(getInnerText(key), publicEnv)] = replaceVariables(getInnerText(data[key].value), publicEnv);
      }
    });
    return selectedData;
  }

  function getDataForBody(body) {
    let bodyData = {};
    if (Object.keys(rawTypesEnums)?.includes(body?.type)) {
      bodyData = replaceVariables(body?.raw?.value || '', publicEnv);
    } else if (body?.type === 'multipart/form-data') {
      const data = body?.[body?.type];
      data.forEach((item) => {
        if (typeof item === 'string') {
          bodyData[replaceVariables(getInnerText(item.key))] = replaceVariables(getInnerText(item.value), publicEnv);
        } else {
          bodyData[replaceVariables(getInnerText(item.key))] = item.value;
        }
      });
    } else {
      body?.[body?.type]?.forEach((data) => {
        if (data.checked === 'true') {
          bodyData[replaceVariables(getInnerText(data.key))] = replaceVariables(getInnerText(data.value), publicEnv);
        }
      });
    }
    return bodyData;
  }

  async function handleRun() {
    if (isRequestInitiated?.current && isRequestInitiated?.current?.initiated) return;
    if (isRequestInitiated?.current) isRequestInitiated.current.initiated = true;
    cancelTokenRef.current = axios.CancelToken.source();
    let endpointUrl = publicEndpointData.URL;
    endpointUrl = replaceVariables(getInnerText(endpointUrl), publicEnv);
    endpointUrl = getUrlByReplacingPathVariables(endpointUrl, publicEnv, publicEndpointData?.pathVariables);
    const headers = getDataReplacingVariables(publicEndpointData?.headers);
    const params = getDataReplacingVariables(publicEndpointData?.params);
    const body = getDataForBody(publicEndpointData?.body);
    setApiLoadingState(true);
    let response;
    let duration = 0;
    let status = '';
    let responseData = '';
    let responseHeaders = {};
    const startTime = Date.now();
    const api = addhttps(endpointUrl);
    const method = publicEndpointData?.requestType;
    const bodyType = publicEndpointData?.body?.type;
    const cancelToken = cancelTokenRef.current.token;
    try {
      if (headers['content-type']?.toLowerCase() === 'multipart/form-data') {
        const formData = new FormData();
        const formDataEntries = Object.entries(body).map(([key, value]) => {
          const parser = new DOMParser();
          let keyDoc = parser.parseFromString(key, 'text/html');
          let parsedKey = keyDoc.body.textContent.trim();

          if (typeof value === 'string') {
            let valueDoc = parser.parseFromString(value, 'text/html');
            let parsedValue = valueDoc.body.textContent.trim();
            return [parsedKey, parsedValue];
          } else if (value instanceof FileList || Array.isArray(value)) {
            return [parsedKey, Array.from(value)];
          }
          return [parsedKey, value];
        });

        formDataEntries.forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              formData.append(key, val);
            });
          } else {
            formData.append(key, value);
          }
        });
        responseData = await apiTestFormData(api, method, formData, headers, bodyType, cancelToken);
      } else {
        responseData = await apiTestJSON(api, method, body, headers, bodyType, cancelToken);
      }
      duration = Math.abs(Date.now() - startTime - 50);
      if (responseData?.data?.success === false) {
        response = responseData?.data?.error || '';
        status = responseData?.data?.status || 400;
        responseHeaders = responseData?.data?.headers;
      } else {
        response = responseData?.data?.data || responseData?.data || '';
        status = responseData?.code || 200;
        responseHeaders = responseData?.data?.headers;
      }
    } catch (error) {
      console.error(error);
      duration = Math.abs(Date.now() - startTime - 50);
      response = error?.message || '';
      if (response === 'Request canceled by user') status = 'Cancelled';
    }
    publicEndpointData.response = { data: response, duration, status, responseHeaders, requestHeaders: headers };
    dispatch(storePublicEndpointData({ ...publicEndpointData }));
    setApiLoadingState(false);
    isRequestInitiated.current.initiated = false;
  }

  function handleCancel() {
    if (!isRequestInitiated?.current?.initiated) return;
    cancelTokenRef.current.cancel('Request canceled by user');
  }

  return (
    <div className='d-flex justify-content-center my-4'>
      <div className={`d-flex justify-content-center px-4 align-items-center m-0 request-type-container ${props?.requestType}`} type='div' disabled={true}>
        <span>{props?.requestType}</span>
      </div>
      <AutoSuggest contentEditableDivRef={autoSuggestRef} disable={true} placeholder='No url present here' />
      {apiLoadingState ? (
        <OverlayTrigger placement='top' overlay={<Tooltip>{(isMac ? 'Cmd' : 'Ctrl') + ' + Shift + X'}</Tooltip>}>
          <button className='btn px-3 ml-2 cancel-btn' onClick={handleCancel}>
            Cancel
          </button>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger placement='top' overlay={<Tooltip>{(isMac ? 'Cmd' : 'Ctrl') + ' + Enter'}</Tooltip>}>
          <button className='btn col-white px-3 ml-2 send-btn' onClick={handleRun} style={{ backgroundColor: props.collectionTheme }}>
            TRY
          </button>
        </OverlayTrigger>
      )}
    </div>
  );
}
