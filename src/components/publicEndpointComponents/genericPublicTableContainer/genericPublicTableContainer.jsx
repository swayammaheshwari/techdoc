import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PublicTable from '../publicTable/publicTable';
import { debounce } from 'lodash';
import { storePublicEndpointData } from '@/store/publicStore/publicStoreActions';
import { getModifiedEndpiontURLForModifiedParams } from '@/components/endpoints/endpointUtility';

export default function genericPublicTableContainer(props) {
  const publicEndpointData = useSelector((state) => state?.publicStore?.publicEndpointData || {});

  const dispatch = useDispatch();

  const handleValueDelayChange = debounce(handleChange, 500);

  const [typeHeading, setTypeHeading] = useState('Params');
  const [publicTableContent, setPublicTableContent] = useState([]);

  useEffect(() => {
    switch (props?.type) {
      case 'params':
        return setTypeHeading('Params');
      case 'headers':
        return setTypeHeading('Headers');
      case 'pathVariables':
        return setTypeHeading('Path Variables');
    }
  }, []);

  useEffect(() => {
    generatePublicTableContent();
  }, [publicEndpointData]);

  function generatePublicTableContent() {
    const objContent = publicEndpointData?.[props?.type] || {};
    if (props?.type === 'params' || props?.type === 'headers' || props?.type === 'pathVariables') {
      const publicTableData = [];
      Object.keys(objContent || [])?.forEach((keyValue) => {
        if (props?.type === 'pathVariables' && !objContent?.[keyValue]?.key) return null;
        else if (!keyValue) return null;
        else {
          publicTableData.push({
            key: props?.type === 'pathVariables' ? objContent?.[keyValue]?.key : keyValue,
            value: objContent?.[keyValue]?.value || '',
            checked: objContent?.[keyValue]?.checked || '',
            description: objContent?.[keyValue]?.description || '',
            optional: objContent?.[keyValue]?.optional,
          });
        }
      });
      return setPublicTableContent(publicTableData);
    }
  }

  function modifyQueryParamsToArray(queryParams) {
    const queryParamsKeys = Object.keys(queryParams || {});
    if (queryParamsKeys.length === 0) return [];
    const modifiedArrayParams = queryParamsKeys.map((key) => {
      return { key: key, ...queryParams[key] };
    });
    return modifiedArrayParams;
  }

  function handleChange(type, index, value, key) {
    const endpointData = publicEndpointData;
    switch (type) {
      case 'params':
        endpointData[type][key].value = value;
        const modifiedQueryParamsIntoArrayForm = modifyQueryParamsToArray(endpointData?.params);
        let endpointUrl = getModifiedEndpiontURLForModifiedParams(modifiedQueryParamsIntoArrayForm, endpointData.URL);
        endpointData.URL = endpointUrl;
      case 'headers':
        endpointData[type][key].value = value;
        break;
      default:
        endpointData[type][index].value = value;
        break;
    }
    dispatch(storePublicEndpointData(endpointData));
  }

  function handleCheckBoxClick(type, index, checkboxValue, key) {
    const endpointData = publicEndpointData;
    switch (type) {
      case 'params':
        endpointData[type][key].checked = `${checkboxValue}`;
        const modifiedQueryParamsIntoArrayForm = modifyQueryParamsToArray(endpointData?.params);
        let endpointUrl = getModifiedEndpiontURLForModifiedParams(modifiedQueryParamsIntoArrayForm, endpointData.URL);
        endpointData.URL = endpointUrl;
      case 'headers':
        endpointData[type][key].checked = `${checkboxValue}`;
        break;
      default:
        break;
    }
    dispatch(storePublicEndpointData({ ...endpointData }));
  }

  if (publicTableContent?.length === 0) return null;

  return (
    <div key={props?.key} className='my-4'>
      <h6 className='fw-500 mb-2'>{typeHeading}</h6>
      <PublicTable handleCheckBoxClick={handleCheckBoxClick} handleValueChange={(...arg) => handleValueDelayChange(...arg)} type={props?.type} isCheckedVisible={props?.type === 'pathVariables' ? false : true} publicTableContent={publicTableContent} collectionTheme={props?.collectionTheme} themeShadedColor={props?.themeShadedColor} />
    </div>
  );
}
