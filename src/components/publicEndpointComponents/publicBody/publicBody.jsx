import React, { useEffect, useState } from 'react';
import PublicTable from '../publicTable/publicTable';
import { rawTypesEnums, bodyTypesEnums } from '@/components/common/bodyTypeEnums';
import PublicRawBody from './publicRawBody/publicRawBody';
import PublicBodyTableContainer from './publicBodyTableContainer/publicBodyTableContainer';
import './publicBody.scss';

export default function PublicBody(props) {
  const [bodyType, setBodyType] = useState('');
  const [selectedTab, setSelectedTab] = useState(true);

  useEffect(() => {
    if (Object.keys(rawTypesEnums)?.includes(props?.body?.type)) {
      setBodyType(bodyTypesEnums.raw);
    } else {
      setBodyType(props?.body?.type);
    }
  }, []);

  function RenderBody() {
    switch (bodyType) {
      case bodyTypesEnums.raw:
        return <PublicRawBody collectionTheme={props?.collectionTheme} themeShadedColor={props?.themeShadedColor} selectedTab={selectedTab} />;
      default:
        return <PublicBodyTableContainer bodyType={bodyType} collectionTheme={props?.collectionTheme} themeShadedColor={props?.themeShadedColor} />;
    }
  }

  function handleSelectedTab() {
    setSelectedTab(!selectedTab);
  }

  if (props?.body?.type == bodyTypesEnums.none) return null;
  if (Object.keys(rawTypesEnums)?.includes(props?.body?.type) && !props.body?.raw?.value) return null;

  return (
    <div className='my-4'>
      <div className='d-flex justify-content-between align-items-center mb-2'>
        <div className='d-flex align-items-center'>
          <h6 className='fw-500'>Body</h6>
          <h6 className='mx-1 body-sub-type'>({props?.body?.type})</h6>
        </div>
        {props?.body?.type === rawTypesEnums.JSON && (
          <div className='d-flex align-items-center'>
            <div onClick={handleSelectedTab} style={{ background: selectedTab ? props?.collectionTheme : '', color: selectedTab ? 'white' : '' }} className='body-tabs raw-type border p-2 cursor-pointer'>
              {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)}
            </div>
            <div onClick={handleSelectedTab} style={{ background: !selectedTab ? props?.collectionTheme : '', color: !selectedTab ? 'white' : '' }} className='body-tabs body-description border p-2 cursor-pointer'>
              Body-Description
            </div>
          </div>
        )}
      </div>
      <RenderBody />
    </div>
  );
}
