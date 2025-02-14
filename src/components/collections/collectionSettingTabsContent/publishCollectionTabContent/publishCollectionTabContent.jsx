import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { BiLinkExternal } from 'react-icons/bi';
import { IoCopyOutline } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa6';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './publishCollectionTabContent.scss';
import { updateCollection } from '../../redux/collectionsActions';

export default function PublishCollectionTabContent(props) {
  const { collections, pages } = useSelector((state) => {
    return {
      collections: state.collections,
      pages: state.pages,
    };
  });

  const params = useParams();

  const dispatch = useDispatch();

  const [isDisabled, setIsDisabled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const isDisable = isParentPagePublishedInCollection(collections?.[params?.collectionId]?.rootParentId);
    setIsDisabled(isDisable);
  }, []);

  function isParentPagePublishedInCollection(rootParentId) {
    const childs = pages?.[rootParentId]?.child;
    if (childs?.length > 0) {
      for (const child of childs) {
        if (pages[child]?.isPublished === true) {
          return true;
        }
      }
    }
    return false;
  }

  function handleCopy() {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }

  const handlePublishingCollection = (selectedCollection) => {
    const collectionData = collections[params?.collectionId];
    if (collectionData?.isPublic) {
      collectionData.isPublic = false;
    } else {
      collectionData.isPublic = true;
    }
    dispatch(updateCollection(collectionData));
  };

  return (
    <div className={`p-4 ${props?.selectedTab === 0 ? '' : 'd-none'}`}>
      <h3>Publish Collection</h3>
      <p className='text-secondary'>Publishing the collection will make your collection's published documents visible to the internet.</p>
      <div className='d-flex align-items-center my-4'>
        <div className='d-flex align-items-center public-link-container border p-2'>
          <BiLinkExternal size={18} />
          <a href={process.env.NEXT_PUBLIC_UI_URL + '/p?collectionId=' + params.collectionId} target='_blank' className='public-link mx-2'>
            {process.env.NEXT_PUBLIC_UI_URL + '/p?collectionId=' + params.collectionId}
          </a>
        </div>
        <div className='copy-icon-continer border p-2'>
          {!isCopied ? (
            <CopyToClipboard text={process.env.NEXT_PUBLIC_UI_URL + '/p?collectionId=' + params.collectionId} onCopy={handleCopy}>
              <IoCopyOutline size={18} className='cursor-pointer' />
            </CopyToClipboard>
          ) : (
            <FaCheck size={18} />
          )}
        </div>
        {!collections?.[params.collectionId]?.isPublic ? (
          <button onClick={handlePublishingCollection} className='mx-3 btn bg-primary text-white'>
            Publish
          </button>
        ) : (
          <button onClick={handlePublishingCollection} className='mx-3 btn bg-danger text-white'>
            UnPublish
          </button>
        )}
      </div>
      <div className='important-notes-container'>
        <p className='text-secondary'>Publishing documents without publishing collection will result 404 page at public site.</p>
        <p className='text-secondary'>
          To publish multiple documents at the same time you can try ---{' '}
          <span onClick={() => props?.setSelectedTab(5)} className='related-tabs-link cursor-pointer'>
            Bulk Publish
          </span>
        </p>
        <p className='text-secondary'>
          Add multiple redirections to your documents using slug ---{' '}
          <span onClick={() => props?.setSelectedTab(6)} className='related-tabs-link cursor-pointer'>
            Redirections
          </span>
        </p>
      </div>
    </div>
  );
}
