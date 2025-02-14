import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { updateCollection } from '../../redux/collectionsActions';
import { toast } from 'react-toastify';
import './addTitleTabContent.scss';

export default function AddTitleTabContent(props) {
  const collections = useSelector((state) => state.collections);

  const titleInputRef = useRef();

  const params = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!titleInputRef.current) return;
    const collectionData = collections[params?.collectionId];
    titleInputRef.current.value = collectionData?.docProperties?.defaultTitle || collectionData?.name;
  }, [params?.collectionId]);

  function handleSaveAndPublish() {
    const collectionData = collections[params?.collectionId];
    collectionData.docProperties = { ...collectionData?.docProperties, defaultTitle: titleInputRef?.current?.value };
    dispatch(updateCollection(collectionData, () => toast.success('Saved & Published Successfuly')));
  }

  return (
    <div className={`p-4 ${props?.selectedTab === 1 ? '' : 'd-none'}`}>
      <h3>Add Title</h3>
      <p className='text-secondary'>Title will be visible at the public page on left sidebar.</p>
      <div className='d-flex align-items-center my-4'>
        <input ref={titleInputRef} placeholder='Enter Title' className='d-flex align-items-center title-tab-input border p-2 rounded' />
        <button onClick={handleSaveAndPublish} className='mx-3 btn bg-primary text-white'>
          Save & Publish
        </button>
      </div>
      <div className='important-notes-container'>
        <p className='text-secondary'>Title will only be visible when header and footer of collection has not been saved in the configuration.</p>
        <p className='text-secondary'>If title is not provided then the collection name would be visible at the left sidebar.</p>
        <p className='text-secondary'>
          Customize your header and footer from here ---{' '}
          <span onClick={() => props?.setSelectedTab(4)} className='related-tabs-link cursor-pointer'>
            Header and Footer
          </span>
        </p>
      </div>
    </div>
  );
}
