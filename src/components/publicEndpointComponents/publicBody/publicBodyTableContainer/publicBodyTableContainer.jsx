import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PublicTable from '../../publicTable/publicTable';
import { storePublicEndpointData } from '@/store/publicStore/publicStoreActions';
import { debounce } from 'lodash';

export default function PublicBodyTableContainer(props) {
  const dispatch = useDispatch();

  const publicEndpointData = useSelector((state) => state?.publicStore?.publicEndpointData || {});

  const [publicTableContent, setPublicTableContent] = useState([]);

  useEffect(() => {
    generatePublicTableContent();
  }, [publicEndpointData]);

  const handleDelayBodyChange = debounce(handleBodyChange, 500);

  function generatePublicTableContent() {
    const objContent = publicEndpointData?.body?.[props?.bodyType];
    const publicTableData = [];
    objContent?.forEach((data) => {
      if (!data.key) return;
      publicTableData.push(data);
    });
    setPublicTableContent(publicTableData);
  }

  function handleBodyChange(type, index, value, key) {
    const endpointData = publicEndpointData;
    endpointData.body[type]?.forEach((data, index) => {
      if (key === data.key) endpointData.body[type][index].value = value;
    });
    dispatch(storePublicEndpointData(endpointData));
  }

  function handleCheckBoxClick(type, index, checkboxValue, key) {
    const endpointData = publicEndpointData;
    endpointData.body[type]?.forEach((data, index) => {
      if (key === data.key) endpointData.body[type][index].checked = `${checkboxValue}`;
    });
    dispatch(storePublicEndpointData(endpointData));
  }

  return <PublicTable type={props?.bodyType} handleCheckBoxClick={handleCheckBoxClick} handleValueChange={(...arg) => handleDelayBodyChange(...arg)} isCheckedVisible={true} publicTableContent={publicTableContent} collectionTheme={props?.collectionTheme} themeShadedColor={props?.themeShadedColor} />;
}
