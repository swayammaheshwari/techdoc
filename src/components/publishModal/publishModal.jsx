import React, { useEffect, useRef, useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './publishModal.scss';
import { getUrlPathById, SESSION_STORAGE_KEY } from '../common/utility';
import { useSelector } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import { IoCopyOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { GoGlobe } from 'react-icons/go';
import SeoSettings from './seoSettings';
import { CiSearch } from 'react-icons/ci';
import { MdKeyboardArrowDown } from 'react-icons/md';

function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

function PublishModal({ onPublish, onUnpublish, id, collectionId, isContentChanged }) {
  const [disabledValue, setDisabledValue] = useState(null);
  const [disabledValueForDomain, setDisabledValueForDomain] = useState(null);
  const [disabledValue1, setDisabledValue1] = useState(null);
  const [disabledValueForDomain1, setDisabledValueForDomain1] = useState(null);
  const [save, setSave] = useState(true);
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const { pages, customDomain, path, isPublished } = useSelector((state) => ({
    pages: state.pages,
    customDomain: state.collections?.[collectionId]?.customDomain || '',
    path: state.collections?.[collectionId]?.path || '',
    isPublished: state?.pages[state.tabs.activeTabId]?.isPublished,
  }));
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedPath1, setSelectedPath1] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownVisible1, setIsDropdownVisible1] = useState(false);
  const visiblePath1 = `${process.env.NEXT_PUBLIC_UI_URL}/p`;
  const basePath = customDomain ? `https://${customDomain}` : `/p`;
  const visiblePath2 = path ? `${basePath}/${path}` : `${basePath}`;
  const visiblePath3 = `${process.env.NEXT_PUBLIC_UI_URL}/p`;
  const visiblePath4 = path ? `${basePath}/${path}` : `${basePath}`;

  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);

  useOutsideClick(dropdownRef1, () => setIsDropdownVisible(false));
  useOutsideClick(dropdownRef2, () => setIsDropdownVisible1(false));

  function handleSelectUnified(path, type) {
    let pathName = getUrlPathById(id, pages, collectionId);
    let updatedPathName = pathName.replace(/\?collectionId=[^&]+/, '');

    if (type === 'type1') {
      if (!customDomain && path === 'visiblePath2') return;
      setSelectedPath(path === 'visiblePath1' ? visiblePath1 : visiblePath2);
      if (path === 'visiblePath1') {
        setDisabledValueForDomain(`/${pathName}`);
      } else if (path === 'visiblePath2') {
        setSelectedPath(visiblePath2);
        setDisabledValueForDomain(`/${updatedPathName}`);
      }
      setIsDropdownVisible(false);
    } else if (type === 'type2') {
      if (!customDomain && path === 'visiblePath4') return;
      setSelectedPath1(path === 'visiblePath3' ? visiblePath3 : visiblePath4);
      if (path === 'visiblePath3') {
        setDisabledValue1(`/${pathName}&source=single`);
      } else if (path === 'visiblePath4') {
        setSelectedPath1(visiblePath4);
        setDisabledValueForDomain1(`/${updatedPathName}?source=single`);
      }
      setIsDropdownVisible1(false);
    }
  }

  useEffect(() => {
    let pathName = getUrlPathById(id, pages, collectionId);
    if (customDomain) {
      const updatedPathName = pathName.replace(/\?collectionId=[^&]+/, '');
      setDisabledValueForDomain(`/${updatedPathName}`);
      setDisabledValueForDomain1(`/${updatedPathName}?source=single`);
    }
    setDisabledValue(`/${pathName}`);
    setDisabledValue1(`/${pathName}&source=single`);
    if (!customDomain) setSelectedPath(visiblePath1);
    if (!customDomain) setSelectedPath1(visiblePath3);
    setSave(true);
  }, [collectionId, id, pages, customDomain]);

  const handlePublishClick = () => {
    let pathName = getUrlPathById(id, pages);
    setDisabledValue(`/${pathName}`);
    onPublish();
  };

  const handlePublish = () => {
    setSave(false);
    onPublish();
  };

  const handleUnpublishClick = () => {
    setSave(true);
    onUnpublish();
  };

  const handleCopy = () => {
    toast.success('Link copied!');
  };

  return (
    <div className='custom-modal d-flex flex-column'>
      {!isPublished ? (
        <div className='d-flex align-items-center flex-column text-container gap-1 pt-2'>
          <GoGlobe size={26} className='text-grey' />
          <p className='fw-600 font-14 m-0'>Publish to web</p>
          <p className='create d-flex align-items-center font-12 text-grey mt-0 mb-2'>Share your work with others</p>
        </div>
      ) : (
        <>
          <div className='d-flex align-items-center gap-1 text-grey mx-2 mt-2 p-1 rounded'>
            <span className='font-12'>Public Preview</span>
          </div>
          <div className='custom-input-wrapper d-flex align-items-center mx-2 mb-0 border bg-white rounded'>
            <div className='align-items-center editable-input cursor-pointer w-50 p-1  border-right bg-white'>
              <div className='d-flex align-items-center input'>
                <div ref={dropdownRef1} className='dropdown'>
                  <div className='d-flex align-items-center input' onClick={() => setIsDropdownVisible(!isDropdownVisible)}>
                    <div className='value font-14 text-grey text-truncate'>{selectedPath || visiblePath2}</div>
                    <MdKeyboardArrowDown />
                  </div>
                  {/* Dropdown Menu */}
                  <div className={`dropdown-menu${isDropdownVisible ? ' show' : ''}`}>
                    <a className='dropdown-item' href='#' onClick={(e) => handleSelectUnified('visiblePath1', 'type1')}>
                      {visiblePath1}
                    </a>
                    {customDomain && (
                      <a className='dropdown-item' href='#' onClick={(e) => handleSelectUnified('visiblePath2', 'type1')}>
                        {visiblePath2}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='d-flex justify-content-between flex-grow-1 cursor-pointer bg-white'>
              <a href={selectedPath === visiblePath1 ? `${visiblePath1}${disabledValue}` : `${visiblePath2}${disabledValueForDomain}`} target='_blank' rel='noopener noreferrer' className='text-decoration-none text-black'>
                <div className='disabled-input overflow-hidden p-1 pr-3 text-nowrap font-14 text-grey text'>{selectedPath === visiblePath1 ? disabledValue : disabledValueForDomain}</div>
              </a>
              <div className='d-flex align-items-center copy-buton'>
                <div className='align-items-center icon cursor-pointer'>
                  <CopyToClipboard text={selectedPath === visiblePath1 ? visiblePath1 + disabledValue : visiblePath2 + disabledValueForDomain} onCopy={handleCopy}>
                    <IoCopyOutline className='mx-2' size={14} />
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {!isPublished ? null : (
        <>
          <div className='d-flex align-items-center gap-1 text-grey mx-2 mt-2 p-1 rounded'>
            <span className='font-12'>Single Preview</span>
          </div>
          <div className='custom-input-wrapper d-flex align-items-center mx-2 mb-0 border bg-white rounded'>
            <div className='align-items-center editable-input cursor-pointer bg-white w-50 p-1 border-right'>
              <div className='d-flex align-items-center input'>
                <div ref={dropdownRef2} className='dropdown'>
                  <div className='d-flex align-items-center input' onClick={() => setIsDropdownVisible1(!isDropdownVisible1)}>
                    <div className='value font-14 text-grey text-truncate'>{selectedPath1 || visiblePath4}</div>
                    <MdKeyboardArrowDown />
                  </div>
                  {/* Dropdown Menu */}
                  <div className={`dropdown-menu${isDropdownVisible1 ? ' show' : ''}`}>
                    <a className='dropdown-item' href='#' onClick={(e) => handleSelectUnified('visiblePath3', 'type2')}>
                      {visiblePath3}
                    </a>
                    {customDomain && (
                      <a className='dropdown-item' href='#' onClick={(e) => handleSelectUnified('visiblePath4', 'type2')}>
                        {visiblePath4}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='d-flex justify-content-between cursor-pointer bg-white flex-grow-1'>
              <a href={selectedPath1 === visiblePath3 ? `${visiblePath3}${disabledValue1}` : `${visiblePath4}${disabledValueForDomain1}`} target='_blank' rel='noopener noreferrer' className='text-decoration-none text-black'>
                <div className='disabled-input overflow-hidden p-1 pr-3 text-nowrap font-14 text-grey text'>{selectedPath1 === visiblePath3 ? disabledValue1 : disabledValueForDomain1}</div>
              </a>
              <div className='d-flex align-items-center copy-buton'>
                <div className='align-items-center icon cursor-pointer'>
                  <CopyToClipboard text={selectedPath1 === visiblePath3 ? visiblePath3 + disabledValue1 : visiblePath4 + disabledValueForDomain1} onCopy={handleCopy}>
                    <IoCopyOutline className='mx-2' size={14} />
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div onClick={() => setShowSeoSettings(true)} className='seo-btn cursor-pointer d-flex align-items-center gap-1 text-grey m-1 p-1 rounded'>
        <CiSearch />
        <span className='font-12'>Search Engine Indexing</span>
      </div>
      <SeoSettings isVisible={showSeoSettings} setShowSeoSettings={setShowSeoSettings} onClose={() => setShowSeoSettings(false)} />
      <div className='d-flex align-items-center justify-content-end gap-2 publish-view-site-btn w-100 border-top p-2'>
        {isContentChanged && save && isPublished && (
          <Button className='cursor-pointer d-flex align-items-center btn-sm font-12 view-site bg-primary py-2 px-3' onClick={handlePublish}>
            Publish
          </Button>
        )}
        {!isPublished ? (
          <Button className='cursor-pointer btn-sm font-12 publish-btn border-0 w-100 py-2 px-3' onClick={handlePublishClick}>
            Publish
          </Button>
        ) : (
          <Button className='cursor-pointer d-flex align-items-center btn-sm font-12 view-site unpublish-btn py-2 px-3 bg-danger' onClick={handleUnpublishClick}>
            Unpublish
          </Button>
        )}
      </div>
    </div>
  );
}

export default PublishModal;
