'use client';
import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNewTabName } from '../../components/tabs/redux/tabsActions';
import { approvePage, draftPage } from '../../components/publicEndpoint/redux/publicEndpointsActions';
import Tiptap from '../../components/tiptapEditor/tiptap';
import { debounce } from 'lodash';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import { updatePageName } from '../../components/pages/redux/pagesActions';
import IconButton from '../../components/common/iconButton';
import { getProxyToken } from '../../components/auth/authServiceV2';
import { functionTypes } from '../../components/common/functionType';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { getOrgId, msgText } from '../../components/common/utility';
import ConfirmationModal from '../../components/common/confirmationModal';
import { useRouter, useParams } from 'next/navigation';
import { setPagesPath } from '../../components/pages/redux/pagesActions';
import { updatePage } from '../../components/pages/redux/pagesActions';
import PublishModal from '../../components/publishModal/publishModal';
import RevisionHistoryModel from './revisionHistoryModel';
import { MdOutlineHistory } from 'react-icons/md';
import PageHeader from './pageHeader';
import HoverActions from './hoverActions';
import PageIcon from './pageIcon';
import EmojiPickerComponent from './emojiPicker';
import * as Y from 'yjs';
import './page.scss';
import { deleteImage } from '@/components/pages/pageApiService';

const Page = () => {
  const { page, pages, users, activeTabId, tabs, collections } = useSelector((state) => ({
    page: state?.pages[state.tabs.activeTabId],
    pages: state.pages,
    users: state.users,
    activeTabId: state.tabs.activeTabId,
    tabs: state.tabs.tabs,
    collections: state.collections,
  }));

  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();

  const textareaRef = useRef(null);
  const { orgId, pageId } = params;

  const [pageName, setPageName] = useState(page?.name);
  const [openPublishConfirmationModal, setOpenPublishConfirmationModal] = useState(false);
  const [openUnpublishConfirmationModal, setOpenUnpublishConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState('');
  const [pathName, setPathName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [featureImageUrl, setFeatureImageUrl] = useState(page?.meta?.featureImage || {});
  const [revisionHistoryVisible, setRevisionHistoryVisible] = useState(false);
  const [featureImageRedux, setFeatureImageRedux] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (typeof window.SendDataToChatbot === 'function' && tabs[activeTabId]?.type === 'page') {
      window.SendDataToChatbot({
        bridgeName: 'page',
        threadId: `${users.currentUser.id}-${pageId}`,
        variables: {
          Proxy_auth_token: getProxyToken(),
          collectionId: page?.collectionId,
          functionType: process.env.NEXT_PUBLIC_ENV === 'prod' ? functionTypes.prod : functionTypes.dev,
        },
      });
    }
  }, []);

  useEffect(() => {
    setFeatureImageUrl(page?.meta?.featureImage);
  }, [page]);

  useEffect(() => {
    if (textareaRef.current) autoGrow(textareaRef.current);
    if (tabs[activeTabId].status === 'NEW') return setPageName(tabs[activeTabId]?.name || 'Untitled');
    setPageName(page?.name || 'Untitled');
  }, [page?.name, tabs?.activeTabId?.name, pageId]);

  useEffect(() => {
    const { newPath, collectionName } = getPath(activeTabId, pages);
    setPathData(newPath);
    setPagesPath(newPath);
    setPathName(collectionName);
  }, [activeTabId, pages]);

  const mapping = {
    local: process.env.NEXT_PUBLIC_RTC_URL_LOCAL,
    test: process.env.NEXT_PUBLIC_RTC_URL_TEST,
    prod: process.env.NEXT_PUBLIC_RTC_URL_PROD,
  };

  const { ydoc, provider } = useMemo(() => {
    if (tabs[activeTabId].status !== 'SAVED') return { ydoc: null, provider: null };
    const ydoc = new Y.Doc();
    const baseUrl = mapping[process.env.NEXT_PUBLIC_ENV];
    const provider = new HocuspocusProvider({
      url: `${baseUrl}?orgId=${orgId}`,
      name: `${pageId}`,
      document: ydoc,
    });
    return { ydoc, provider };
  }, [orgId, pageId, tabs[activeTabId]]);

  const debounceUpdateName = useCallback(
    debounce((activeTabId, name) => {
      dispatch(updateNewTabName(activeTabId, name));
    }, 500)
  );

  const handlePageNameChange = (event) => {
    const newName = event.target.value;
    if (newName !== pageName) {
      setPageName(newName);
      if (tabs?.[activeTabId]?.status === 'NEW') debounceUpdateName(activeTabId, newName);
    }
  };

  const handleSavePageName = () => {
    if (tabs[activeTabId].status === 'SAVED' && pageName !== page?.name) {
      const data = {
        pageName,
        urlName: page?.urlName === 'untitled' ? pageName : page?.urlName,
      };
      dispatch(updatePageName(page.id, data));
    }
  };

  const handlePageNameKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
      handleSavePageName();
    }
  };

  const autoGrow = (element) => {
    element.style.height = '5px';
    element.style.height = `${element.scrollHeight}px`;
    setPageName(element.textContent);
  };
  const publishClick = () => {
    setOpenPublishConfirmationModal(true);
  };

  const unpublishClick = () => {
    if (page?.isPublished) {
      setOpenUnpublishConfirmationModal(true);
    }
  };

  const renderPublishConfirmationModal = () => {
    return openPublishConfirmationModal && <ConfirmationModal show={openPublishConfirmationModal} onHide={() => setOpenPublishConfirmationModal(false)} proceed_button_callback={handlePublish} title={msgText.publishPage} submitButton='Publish' rejectButton='Discard' />;
  };

  const renderUnPublishConfirmationModal = () => {
    return openUnpublishConfirmationModal && <ConfirmationModal show={openUnpublishConfirmationModal} onHide={() => setOpenUnpublishConfirmationModal(false)} proceed_button_callback={handleUnPublish} title={msgText.unpublishPage} submitButton='UnPublish' rejectButton='Discard' />;
  };

  const handlePublish = async () => {
    setLoading(true);
    await dispatch(approvePage(pages[pageId]));
    setLoading(false);
  };

  const handleUnPublish = async () => {
    page.isPublished = false;
    page.publishedEndpoint = {};
    page.state = 1;
    dispatch(draftPage(page));
  };

  const getPath = (id, sidebar) => {
    const orgId = getOrgId();
    let path = [];
    let newPath = `${pages?.[activeTabId]?.collectionId}`;
    let pagePath = [],
      pagesName = [];

    let collectionName = collections?.[pages?.[activeTabId]?.collectionId]?.name ?? '';
    if (!collectionName) {
      collectionName = 'untitled';
    }

    while (sidebar?.[id]?.type > 0) {
      const itemName = sidebar[id].name;
      path.push({
        name: itemName,
        path: `orgs/${orgId}/dashboard/page/${id}`,
        id: id,
      });
      id = sidebar?.[id]?.parentId;
    }
    path.forEach((item) => {
      if (pages?.[item.id]?.type !== 2) {
        pagePath.push(`/${item.id}`);
        pagesName.push(`/${item.name}`);
      }
    });

    pagesName = pagesName.reverse().join('');
    collectionName = collectionName + pagesName;
    pagePath = pagePath.reverse().join('');
    newPath = newPath + pagePath;
    return { pathArray: path.reverse(), newPath, collectionName };
  };

  const handleStrongChange = (e) => {
    setPageName(e.currentTarget.textContent);
  };

  const renderPathLinks = () => {
    const { pathArray } = getPath(pageId, pages);
    const pathWithUrls = pathArray;
    return pathWithUrls.map((item, index) => {
      if (pages?.[item.id]?.type === 2) return null;
      const isLastItem = index === pathWithUrls?.length - 1;
      return (
        <div className='d-flex align-items-center' key={index} onClick={() => router.push(`/${item.path}`)}>
          {isLastItem ? (
            <strong className='fw-500 py-0 px-1 cursor-text' onInput={handleStrongChange} onChange={handlePageNameChange} onKeyDown={handlePageNameKeyDown} onBlur={handleSavePageName} contentEditable key={index}>
              {item.name}
            </strong>
          ) : (
            <strong className='cursor-pointer fw-400 px-1 py-0 text-secondary'>{item?.name}</strong>
          )}
          {index < pathWithUrls?.length - 1 && <p className='p-0 m-0 text-secondary fw-400'>/</p>}
        </div>
      );
    });
  };

  const onRemoveCoverImage = async () => {
    const updatedMeta = { ...page.meta, featureImage: null };
    const editedPage = { ...pages?.[pageId], meta: updatedMeta };
    dispatch(updatePage(editedPage));
    const path = `${page?.meta?.featureImage?.url}`.replace(/https:\/\/storage\.googleapis\.com\/(dev-techdoc\.walkover\.in|techdoc\.walkover\.in)\//, '');
    await deleteImage(path);
  };

  const handleRestoreContent = (content) => {
    if (content) {
      handleContentChange(content.html);
    }
  };

  return (
    <div className='parent-page-container d-flex flex-column align-items-center w-100'>
      <PageHeader pageId={pageId} loading={loading} renderPathLinks={renderPathLinks} handlePublish={handlePublish} handleUnPublish={handleUnPublish} setRevisionHistoryVisible={setRevisionHistoryVisible} revisionHistoryVisible={revisionHistoryVisible} handleRestoreContent={handleRestoreContent} />

      {featureImageUrl && (
        <div className='add-cover-options position-relative'>
          <img className='w-100 h-100' src={featureImageUrl?.url || ''} alt={`${featureImageUrl?.name || ''}`} />
          <div className='add-cover-action d-flex align-items-center gap-2 position-absolute'>
            <button
              className='border bg-white border-white outline-none py-1 px-3 font-12 rounded'
              onClick={() => {
                setShowImageModal(true);
              }}
            >
              Change Cover
            </button>
            <button className='border bg-white border-white outline-none py-1 px-3 font-12 rounded' onClick={onRemoveCoverImage}>
              Remove
            </button>
          </div>
        </div>
      )}
      <div className='page-container h-100 w-100 p-3'>
        <div className='page-header bg-white d-flex align-items-center justify-content-between w-100'>
          <div className='d-flex w-100 justify-content-between position-relative align-items-center'>
            {showEmojiPicker && <EmojiPickerComponent pageId={pageId} setShowEmojiPicker={setShowEmojiPicker} />}
            <div className='d-flex align-items-start mt-5'>
              <PageIcon icon={pages[pageId]?.meta?.icon} toggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)} />
              <textarea
                ref={textareaRef}
                onInput={(e) => {
                  setPageName(e.target.value);
                  autoGrow(textareaRef.current);
                }}
                className='page-name text-black fa-3x font-weight-bold border-0 w-100'
                type='text'
                value={pageName}
                placeholder='Untitled'
                onChange={handlePageNameChange}
                onKeyDown={handlePageNameKeyDown}
                onBlur={handleSavePageName}
              />
            </div>
            <HoverActions pageId={pageId} pages={pages} setFeatureImageRedux={setFeatureImageRedux} pathData={pathData} showImage={showImage} setShowImage={setShowImage} showImageModal={showImageModal} setShowImageModal={setShowImageModal} />
          </div>
        </div>
        <div id='tiptap-editor' className='page-content '>
          <Tiptap provider={provider} ydoc={ydoc} isInlineEditor={false} disabled={false} initial={false} onChange={false} isEndpoint={tabs[activeTabId]?.status === 'NEW' ? true : false} key={pageId} pathData={pathData} pathName={pathName} />
        </div>
      </div>
    </div>
  );
};

export default Page;
