'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { storeCurrentPublicId, storePublicEndpointData } from '@/store/publicStore/publicStoreActions';
import { createNewPublicEnvironment } from '../publishDocs/redux/publicEnvActions';
import PublicBreadCrumb from '../pages/publicBreadCrumb/publicBreadCrumb';
import PublicHost from '@/components/publicEndpointComponents/publicHost/publicHost';
import PublicBody from '@/components/publicEndpointComponents/publicBody/publicBody';
import PublicSampleResponse from '@/components/publicEndpointComponents/publicSampleResponse/publicSampleResponse';
import GenericPublicTableContainer from '../publicEndpointComponents/genericPublicTableContainer/genericPublicTableContainer';
import PublicEditor from '@/components/publicEndpointComponents/publicEditor/publicEditor';
import PublicCodeTemplate from '../publicEndpointComponents/publicCodeTemplate/publicCodeTemplate';
import PublicEnv from '@/components/publicEndpointComponents/publicEnv/publicEnv';
import PublicEndpointResponse from '@/components/publicEndpointComponents/publicEndpointResponse/publicEndpointResponse';
import { background } from '../backgroundColor';
import { hexToRgb } from '../common/utility';
import Providers from '../../providers/providers';
import ApiDocReview from '../apiDocReview/apiDocReview';
import { rawTypesEnums } from '../common/bodyTypeEnums';
import '@/components/publicEndpoint/publicEndpoint.scss';

function PublicEndpoint(props) {
  const [orderOfPublicComponents, setOrderOfPublicComponents] = useState(props?.pageContentDataSSR?.docViewData?.length > 0 ? props?.pageContentDataSSR?.docViewData : [{ type: 'host' }, { type: 'pathVariables' }, { type: 'body' }, { type: 'params' }, , { type: 'headers' }, { type: 'sampleResponse' }]);

  const dispatch = useDispatch();

  const collections = useSelector((state) => state.collections);
  const pages = useSelector((state) => state.pages);

  const idToRender = props?.pageContentDataSSR?.id;
  const type = props?.pageContentDataSSR?.type || pages?.[idToRender]?.type;
  const collectionId = pages?.[idToRender]?.collectionId ?? null;
  let collectionTheme;
  if (collectionId) collectionTheme = collections[collectionId]?.theme;
  const dynamicColor = hexToRgb(collectionTheme, 0.02);
  const staticColor = background['background_boxes'];
  const themeShadedColor = `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}), linear-gradient(to right, ${staticColor}, ${staticColor})`;

  useEffect(() => {
    const scriptId = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_ID;
    const chatbot_token = process.env.NEXT_PUBLIC_CHATBOT_TOKEN;
    const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT;

    if (chatbot_token && !document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.setAttribute('embedToken', chatbot_token);
      script.id = scriptId;
      document.head.appendChild(script);
      script.src = scriptSrc;
    }

    setOrderOfPublicComponents((prevState) => {
      const newOrderWithPublicEnv = [...prevState];
      if (newOrderWithPublicEnv[1].type === 'publicEnv') return prevState;
      newOrderWithPublicEnv.splice(1, 0, { type: 'publicEnv' });
      return newOrderWithPublicEnv;
    });

    dispatch(storeCurrentPublicId(props?.pageContentDataSSR?.id));
    dispatch(createNewPublicEnvironment(collections[collectionId]?.environment));

    addOptionalKeyAndStorePublicEndpoint();
  }, []);

  function addOptionalKeyAndStorePublicEndpoint() {
    const endpointData = props?.pageContentDataSSR;
    Object.keys(endpointData.headers || {})?.forEach((key) => {
      if (endpointData.headers?.[key]?.checked === 'false') endpointData.headers[key].optional = true;
    });
    Object.keys(endpointData.params || {})?.forEach((key) => {
      if (endpointData.params?.[key]?.checked === 'false') endpointData.params[key].optional = true;
    });
    if (!Object.keys(rawTypesEnums)?.includes(endpointData?.body?.type)) {
      endpointData.body[endpointData.body.type]?.forEach((content, index) => {
        if (endpointData?.body[endpointData?.body?.type]?.[index]?.checked === 'false') endpointData.body[endpointData.body.type][index].optional = true;
      });
    }
    dispatch(storePublicEndpointData(endpointData));
  }

  function RenderPublicComponentsInOrder({ item, key }) {
    switch (item?.type) {
      case 'host':
        return <PublicHost requestType={props?.pageContentDataSSR?.requestType} url={props?.pageContentDataSSR?.URL} collectionTheme={collectionTheme} />;
      case 'publicEnv':
        return <PublicEnv themeShadedColor={themeShadedColor} />;
      case 'body':
        return <PublicBody body={props?.pageContentDataSSR?.body} collectionTheme={collectionTheme} themeShadedColor={themeShadedColor} />;
      case 'headers':
      case 'params':
      case 'pathVariables':
        return <GenericPublicTableContainer type={item?.type} collectionTheme={collectionTheme} themeShadedColor={themeShadedColor} />;
      case 'sampleResponse':
        return <PublicSampleResponse sampleResponse={props?.pageContentDataSSR?.sampleResponse || []} themeShadedColor={themeShadedColor} collectionTheme={collectionTheme} />;
      case 'textArea':
      case 'textBlock':
        return <PublicEditor htmlData={item?.data} />;
      default:
        return null;
    }
  }

  return (
    <div className='w-100'>
      <div className='d-flex public-endpoint-outer-container justify-content-around w-100'>
        <div className='main-public-endpoint-container'>
          {!props.shouldRenderHeaderAndFooter && <PublicBreadCrumb />}
          <h1 className='font-weight-bold d-flex align-items-center mt-3'>{props?.pageContentDataSSR?.name}</h1>
          {orderOfPublicComponents?.map((item, index) => (
            <RenderPublicComponentsInOrder item={item} />
          ))}
          <PublicEndpointResponse themeShadedColor={themeShadedColor} collectionTheme={collectionTheme} />
        </div>
        <PublicCodeTemplate themeShadedColor={themeShadedColor} collectionTheme={collectionTheme} />
      </div>
      <div className='d-flex my-4 justify-content-center endpoint-api-doc-review-container w-100'>
        <Providers>
          <ApiDocReview />
        </Providers>
      </div>
    </div>
  );
}

export default PublicEndpoint;
