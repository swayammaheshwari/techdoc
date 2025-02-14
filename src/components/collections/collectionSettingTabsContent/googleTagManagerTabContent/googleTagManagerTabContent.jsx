import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { updateCollection } from '../../redux/collectionsActions';

export default function GoogleTagManagerTabContent(props) {
  const collections = useSelector((state) => state.collections);

  const gtmIdInputRef = useRef();

  const params = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!gtmIdInputRef.current) return;
    const collectionData = collections[params?.collectionId];
    gtmIdInputRef.current.value = collectionData?.gtmId || '';
  }, [params?.collectionId]);

  function handleSaveAndPublish() {
    const collectionData = collections[params?.collectionId];
    collectionData.gtmId = gtmIdInputRef.current.value;
    dispatch(updateCollection(collectionData, () => toast.success('Saved & Published Successfuly')));
  }

  return (
    <div className={`p-4 ${props?.selectedTab === 7 ? '' : 'd-none'}`}>
      <h3>Google Tag Manager ID</h3>
      <p className='text-secondary'></p>
      <div className='d-flex align-items-center my-4'>
        <input placeholder='Enter GTM-ID' ref={gtmIdInputRef} className='d-flex align-items-center title-tab-input border p-2 rounded' />
        <button onClick={handleSaveAndPublish} className='mx-3 btn bg-primary text-white'>
          Save & Publish
        </button>
      </div>
      <p className='text-secondary w-50'>Google Tag Manager (GTM) is a powerful tool that simplifies the process of managing tags, scripts, and snippets of code on a website without directly editing the website's code.</p>
    </div>
  );
}
