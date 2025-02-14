'use client';
import React, { useEffect, useRef, useState } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropright } from 'react-icons/io';
import Combination from '../combination/combination';
import IconButton from '../../common/iconButton';
import { getPathForBreadcrumb, getUrlPathById, isTechdocOwnDomain } from '@/components/common/utility';
import { useRouter } from 'next/navigation';
import { addIsExpandedAction } from '@/store/clientData/clientDataActions';
import { useDispatch, useSelector } from 'react-redux';
import './subDocument.scss';
import { storeCurrentPublicId } from '@/store/publicStore/publicStoreActions';
import { IoDocumentTextOutline } from 'react-icons/io5';

export default function SubDocument({ subDocId, pages, collectionDetails, customDomain, workerHeaders }) {
  const [selectedSubDoc, setSelectedSubDoc] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const pathSlug = useSelector((state) => state?.collections?.[Object.keys(state?.collections || {})?.[0]]?.path || '');
  const isExpanded = useSelector((state) => state?.clientData?.[subDocId]?.isExpanded ?? false);
  const currentPublicId = useSelector((state) => state?.publicStore?.currentPublicId);

  useEffect(() => {
    setSelectedSubDoc(currentPublicId);
  }, [currentPublicId]);

  const handleLinkClick = (e) => {
    e.preventDefault();
    dispatch(storeCurrentPublicId(subDocId));
    let pathName = getUrlPathById(subDocId, pages);
    pathName = isTechdocOwnDomain() ? `/p/${pathName}` : pathSlug ? `/${pathSlug}/${pathName}` : `/${pathName}`;
    if (isExpanded) {
      router.push(pathName);
      return;
    }
    dispatch(addIsExpandedAction({ value: !isExpanded, id: subDocId }));
    router.push(pathName);
  };

  const toggleDoc = (e) => {
    e.preventDefault();
    dispatch(addIsExpandedAction({ value: !isExpanded, id: subDocId }));
  };

  const getPath = () => {
    const url = process.env.NEXT_PUBLIC_UI_URL;
    const { pathIds, versionId } = getPathForBreadcrumb(subDocId, pages, true);
    const pathsArray = pathIds.map((id) => {
      return pages[id].urlName;
    });
    const isVersionDefault = pages[versionId]?.state === 1;
    const path = pathsArray.join('/');
    if (workerHeaders?.urlHost && workerHeaders?.urlPath) {
      return isVersionDefault ? `https://${workerHeaders?.urlHost}/${workerHeaders?.urlPath}/${path}` : `https://${workerHeaders?.urlHost}/${workerHeaders?.urlPath}/${path}?version=${pages[versionId]?.name}`;
    } else if (customDomain) {
      return isVersionDefault ? `https://${customDomain}/${path}` : `https://${customDomain}/${path}?version=${pages[versionId]?.name}`;
    }
    return `${url}/p/${path}?version=${pages[versionId]?.name}&collectionId=${collectionDetails?.id}`;
  };

  return (
    <div className='documnet-container w-100'>
      <a href={getPath()} id={subDocId} onClick={(e) => e.preventDefault()} className='text-decoration-none'>
        <div onClick={handleLinkClick} className={'d-flex justify-content-start align-items-center custom-link-style my-1 px-2 py-1 w-100 sub-doc-container cursor-pointer' + ' ' + (selectedSubDoc == subDocId ? 'show-subdoc-bold' : '')}>
          {pages[subDocId]?.meta?.icon ? (
            <button className='collection-icons sub-page-emoji-icon border-0 outline-none bg-none'>{pages[subDocId]?.meta?.icon}</button>
          ) : (
            <button className='sub-page-icon border-0 outline-none bg-none text-grey'>
              <IoDocumentTextOutline size={19} />
            </button>
          )}
          {!isExpanded ? (
            <button onClick={toggleDoc} className='arrow-right-icon border-0 outline-none bg-none'>
              <IoMdArrowDropright size={18} color='grey' className='public-arrow-icon rounded' />
            </button>
          ) : (
            <button onClick={toggleDoc} className='arrown-down-icon border-0 outline-none bg-none'>
              <IoMdArrowDropdown size={18} color='grey' className='public-arrow-icon rounded' />
            </button>
          )}

          <span className={'ml-1 inline-block'}>{pages[subDocId]?.name}</span>
        </div>
      </a>
      {isExpanded && (
        <div className='pl-2'>
          <Combination incomingPageId={subDocId} pages={pages} collectionDetails={collectionDetails} customDomain={customDomain} workerHeaders={workerHeaders} />
        </div>
      )}
    </div>
  );
}
