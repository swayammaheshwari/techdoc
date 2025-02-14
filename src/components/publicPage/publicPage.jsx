'use client';
import React, { useEffect, useState } from 'react';
import RenderPageContent from '../pages/renderPageContent';
import DisplayUserAndModifiedData from '../common/userService';
import { IoDocumentTextOutline } from 'react-icons/io5';
import Providers from '../../providers/providers';
import { getProxyToken } from '../auth/authServiceV2';
import { functionTypes } from '../common/functionType';
import shortid from 'shortid';
import { storeCurrentPublicId } from '@/store/publicStore/publicStoreActions';
import { useDispatch, useSelector } from 'react-redux';
import PreviewCard from '@/components/publicCards/previewCard';
import PublicBreadCrumb from '@/components/pages/publicBreadCrumb/publicBreadCrumb';
import '../../components/tiptapEditor/tiptap.scss';
import './publicPage.scss';
import '../../components/publicCards/previewCard.scss';

function PublicPage({ pageContentDataSSR, pages, widget_token, cardData, shouldRenderHeaderAndFooter }) {
  const dispatch = useDispatch();

  const [modifiedContent, setModifiedContent] = useState(pageContentDataSSR?.contents);

  const pathSlug = useSelector((state) => state?.collections?.[Object.keys(state?.collections || {})?.[0]]?.path || '');

  useEffect(() => {
    let threadId = localStorage.getItem('threadId');

    if (!threadId) {
      threadId = shortid();
      localStorage.setItem('threadId', threadId);
    }

    if (modifiedContent) {
      const updatedContent = removeBreadCollections(modifiedContent);
      setModifiedContent(updatedContent);
    }

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

    const timer = setInterval(() => {
      if (typeof window?.SendDataToChatbot === 'function') {
        window?.SendDataToChatbot({
          bridgeName: 'page',
          threadId,
          helloId: widget_token,
          variables: {
            Proxy_auth_token: getProxyToken(),
            collectionId: pageContentDataSSR?.collectionId,
            functionType: process.env.NEXT_PUBLIC_ENV === 'prod' ? functionTypes.prod : functionTypes.dev,
          },
        });
        clearInterval(timer);
      }
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, [modifiedContent, pageContentDataSSR, pages, widget_token]);

  useEffect(() => {
    dispatch(storeCurrentPublicId(pageContentDataSSR?.id));
  }, [pageContentDataSSR?.id]);

  const removeBreadCollections = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const breadcrumbContainers = doc.querySelectorAll('.breadcrumb-container');

    breadcrumbContainers.forEach((container) => {
      const breadcrumbSegments = container.querySelectorAll('.breadcrumb-segment');

      breadcrumbSegments.forEach((button) => {
        if (button.id.startsWith('collection/')) {
          const nextElement = button.nextElementSibling;
          button.remove();
          if (nextElement && nextElement.classList.contains('breadcrumb-separator')) {
            nextElement.remove();
          }
        }
      });
    });

    return doc.body.innerHTML;
  };

  return (
    <div className={`custom-display-public-page w-100 overflow-auto`}>
      <div className={`page-wrapper d-flex flex-column ${modifiedContent ? 'justify-content-between' : 'justify-content-center'}`}>
        <div className='pageText d-flex justify-content-center align-items-start'>
          <RenderPageContent
            cardData={cardData}
            pageContentDataSSR={{
              ...pageContentDataSSR,
              contents: modifiedContent,
            }}
            pages={pages}
            webToken={widget_token}
            shouldRenderHeaderAndFooter={shouldRenderHeaderAndFooter}
          />
        </div>
      </div>
    </div>
  );
}

export default PublicPage;
