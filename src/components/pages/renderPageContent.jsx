'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUrlPathById, isTechdocOwnDomain } from '../common/utility';
import Providers from '../../providers/providers';
import ApiDocReview from '../apiDocReview/apiDocReview';
import { useSelector } from 'react-redux';
import PublicBreadCrumb from '../pages/publicBreadCrumb/publicBreadCrumb.tsx';
import './renderPageContent.scss';
import PreviewCard from '../publicCards/previewCard';
import { HiOutlineDocumentText } from 'react-icons/hi';
import '../publicCards/previewCard.scss';
// import 'bootstrap/dist/css/bootstrap.css';

export default function RenderPageContent(props) {
  const pathSlug = useSelector((state) => state?.collections?.[Object.keys(state?.collections || {})?.[0]]?.path || '');
  const [htmlWithIds, setHtmlWithIds] = useState('');
  const router = useRouter();

  function handleBreadcrumbClick(event) {
    const breadcrumbSegmentId = event.target.getAttribute('id');
    let id = breadcrumbSegmentId.split('/');
    if (id[0] === 'collection') {
      return;
    }
    id = id[1];
    let pathName = getUrlPathById(id, props?.pages);
    pathName = isTechdocOwnDomain() ? `/p/${pathName}` : pathSlug ? `/${pathSlug}/${pathName}` : `/${pathName}`;
    router.push(pathName);
  }

  function handleLinkClick(event) {
    let id = event.target.getAttribute('data-page-id');
    let pathName = getUrlPathById(id, props?.pages);
    pathName = isTechdocOwnDomain() ? `/p/${pathName}` : pathSlug ? `/${pathSlug}/${pathName}` : `/${pathName}`;
    router.push(pathName);
  }

  const addIdsToHeadings = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      heading.setAttribute('id', id);
      return {
        id,
        text: heading.innerText,
        tag: heading.tagName.toLowerCase(),
      };
    });
    const emptyParagraphs = doc.querySelectorAll('p:empty');
    emptyParagraphs.forEach((p) => {
      const br = doc.createElement('br');
      p.replaceWith(br);
    });
    return doc.body.innerHTML;
  };

  useEffect(() => {
    const html = addIdsToHeadings(props?.pageContentDataSSR?.contents);
    setHtmlWithIds(html);
  }, [props?.pageContentDataSSR?.contents]);

  useEffect(() => {
    if (!props.shouldRenderHeaderAndFooter) {
      setTimeout(() => {
        const getBtn = document.querySelectorAll('.breadcrumb-segment');
        getBtn.forEach((button) => {
          button.addEventListener('click', handleBreadcrumbClick);
        });
        const linkBtn = document.querySelectorAll('.linked-page');
        linkBtn.forEach((button) => {
          button.addEventListener('click', handleLinkClick);
        });
      }, 10);
    }
  }, [props?.pageContentDataSSR?.contents]);

  const isContentEmpty = (htmlContent) => {
    if (!props.shouldRenderHeaderAndFooter) return;
    const textContent = htmlContent?.replace(/<[^>]*>/g, '')?.trim();
    if (/<iframe\b[^>]*>/i.test(htmlContent)) {
      return false;
    }
    return textContent?.length < 1;
  };

  return (
    <div className='d-flex flex-column w-100 align-items-start justify-content-start main-page-content-container'>
      <div className='main-page-content w-100 d-flex flex-column doc-content-container justify-content-start align-items-start'>
        {!props.shouldRenderHeaderAndFooter && <PublicBreadCrumb />}
        <div className='page-text-render d-flex justify-content-start align-items-center mt-3'>
          <h1 className={`font-weight-bold d-flex align-items-center mt-0`}>{props?.pageContentDataSSR?.name}</h1>
        </div>
        {!isContentEmpty(props?.pageContentDataSSR?.contents) && (
          <div className='page-text-render w-100 d-flex justify-content-start mt-3 tiptap'>
            <div id='__page__content' className='w-100'>
              <div
                className='page-content-body'
                dangerouslySetInnerHTML={{
                  __html: htmlWithIds || props?.pageContentDataSSR?.contents,
                }}
              />
            </div>
          </div>
        )}
        {isContentEmpty(props?.pageContentDataSSR?.contents) && !props?.cardData?.length && !props.shouldRenderHeaderAndFooter && (
          <div className='public-page-empty text-muted'>
            <div className='public-page-empty-content'>
              <HiOutlineDocumentText className='doc-icon' /> <span className='doc-message'>{props?.pageContentDataSSR?.name.length > 20 ? `${props?.pageContentDataSSR?.name.slice(0, 20)}... is empty.` : `${props?.pageContentDataSSR?.name} is empty`}</span>
            </div>
          </div>
        )}
      </div>

      {props?.cardData?.length > 0 && !isContentEmpty(props?.pageContentDataSSR?.contents) && !props.shouldRenderHeaderAndFooter && <h3 className='related-docs-heading'>Related Docs</h3>}

      {!props.shouldRenderHeaderAndFooter && (
        <div className='d-flex flex-wrap w-100 preview-cards-container'>
          {props?.cardData?.map((data, index) => {
            return <PreviewCard pageContentDataSSR={data} key={index} pages={props?.pages} pathSlug={pathSlug} />;
          })}
        </div>
      )}

      {props?.pageContentDataSSR?.contents && (
        <div className='my-5 doc-review-container w-100 d-flex justify-content-center'>
          <Providers>
            <ApiDocReview />
          </Providers>
        </div>
      )}
    </div>
  );
}
