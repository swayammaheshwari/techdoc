import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage } from '../pages/redux/pagesActions';
import TagInput from '@/components/publishModal/tagInput';
import { IoArrowBack } from 'react-icons/io5';

const SeoSettings = ({ isVisible, onClose, setShowSeoSettings }) => {
  if (!isVisible) return null;

  const { page, pages, activeTabId } = useSelector((state) => ({
    page: state?.pages[state.tabs.activeTabId],
    pages: state.pages,
    activeTabId: state.tabs.activeTabId,
  }));

  const dispatch = useDispatch();

  const [tags, setTags] = useState(page?.meta?.tags || []);
  const [metaTitle, setMetaTitle] = useState(page?.meta?.title || '');
  const [description, setDescription] = useState(page?.meta?.description || '');

  const onSubmit = (id) => {
    const updatedMeta = {
      ...page.meta,
      tags: tags,
      title: metaTitle,
      description: description,
    };
    const editedPage = { ...pages?.[id], meta: updatedMeta };
    dispatch(updatePage(editedPage));
    onClose();
  };

  useEffect(() => {
    setDescription(page?.meta?.description || '');
    setMetaTitle(page?.meta?.title || '');
    setTags(page?.meta?.tags || []);
  }, [activeTabId, page]);

  return (
    <div className='seo-settings-overlay w-100 h-100 bg-white'>
      <div className='seo-settings-panel d-flex flex-column gap-4'>
        {/* Back Arrow */}
        <div className='seo-settings-header d-flex align-items-center gap-1 border-bottom p-2'>
          <button onClick={() => setShowSeoSettings(false)} className='back-button border-0 bg-white text-grey rounded outline-none'>
            <IoArrowBack size={14} />
          </button>
          <h3 className='m-0 font-14 text-grey'>Search Engine Indexing</h3>
        </div>

        {/* SEO Settings Form */}
        <div className='seo-settings-content d-flex flex-column gap-4 p-2'>
          <div className='seo-input-group d-flex flex-column gap-1'>
            <label className='m-0 font-12 text-black'>Meta Title</label>
            <input className='p-1 font-12 border rounded' type='text' placeholder='Add meta title' value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </div>
          <div className='seo-input-group d-flex flex-column gap-1'>
            <label className='m-0 font-12 text-black'>Meta Description</label>
            <input className='p-1 font-12 border rounded' type='text' placeholder='Add meta description' value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className='seo-input-group d-flex flex-column gap-1'>
            <label className='m-0 font-12 text-black'>Tags</label>
            <TagInput pageId={page?.id} tags={tags} setTags={setTags} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='seo-settings-actions text-right px-2'>
          <button onClick={() => onSubmit(page?.id)} className='btn btn-secondary'>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeoSettings;
