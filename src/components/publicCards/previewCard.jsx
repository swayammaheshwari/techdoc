import React from 'react';
import { useRouter } from 'next/navigation';
import { getUrlPathById, isTechdocOwnDomain } from '../common/utility';
import { CiCalendar } from 'react-icons/ci';
import { RxFileText } from 'react-icons/rx';

import './previewCard.scss';

export default function PreviewCard({ pageContentDataSSR, pages, pathSlug }) {
  const router = useRouter();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleClick = () => {
    let pathName = getUrlPathById(pageContentDataSSR?.id, pages);
    pathName = isTechdocOwnDomain() ? `/p/${pathName}` : pathSlug ? `/${pathSlug}/${pathName}` : `/${pathName}`;
    router.push(pathName);
  };

  const isContentEmpty = (htmlContent) => {
    const textContent = htmlContent?.replace(/<[^>]*>/g, '').trim();
    return textContent?.length < 1;
  };

  return (
    <div onClick={handleClick} className='d-flex flex-column preview-card cursor-pointer'>
      <div className='preview-card-content-wrapper border-bottom position-relative w-100 pb-1'>
        {pageContentDataSSR?.meta?.featureImage?.url ? (
          <div className='preview-card-preview-image'>
            <img src={pageContentDataSSR?.meta?.featureImage?.url} alt={pageContentDataSSR?.meta?.featureImage?.name} />
          </div>
        ) : isContentEmpty(pageContentDataSSR?.contents) ? (
          <div className='pc-no-content w-100 d-flex align-items-center px-3'>
            <RxFileText className='text-muted thinner-icon' />
          </div>
        ) : (
          <div
            className='preview-card-content-doc position-relative w-100 tiptap'
            dangerouslySetInnerHTML={{
              __html: pageContentDataSSR?.contents,
            }}
          />
        )}
      </div>
      <h3 className='preview-card-title px-3 py-2' title={pageContentDataSSR?.name}>
        {pageContentDataSSR?.name.length > 20 ? `${pageContentDataSSR?.name.slice(0, 20)}...` : pageContentDataSSR?.name}
      </h3>
      <div className='preview-card-details-wrapper d-flex w-100 fw-medium px-3'>
        <div className='preview-card-details d-flex flex-column'>
          <span>
            <i className='calendar-icon'>
              <CiCalendar />
            </i>
            <span className='text-muted'>{formatDate(pageContentDataSSR?.createdAt)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
