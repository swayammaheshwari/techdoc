import React from 'react';
import { OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import { GoDotFill } from 'react-icons/go';
import PublishModal from '../../components/publishModal/publishModal';
import { useSelector } from 'react-redux';
import { getOrgId } from '@/components/common/utility';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import RevisionHistoryModel from './revisionHistoryModel';
import { MdOutlineHistory } from 'react-icons/md';
import IconButton from '@/components/common/iconButton';

const PageHeader = ({ pageId, loading, renderPathLinks, handlePublish, handleUnPublish, setRevisionHistoryVisible, revisionHistoryVisible, handleRestoreContent }) => {
  const router = useRouter();

  const { page, pages, users, activeTabId, tabs, collections } = useSelector((state) => ({
    page: state?.pages[state.tabs.activeTabId],
    pages: state.pages,
    users: state.users,
    activeTabId: state.tabs.activeTabId,
    tabs: state.tabs.tabs,
    collections: state.collections,
  }));
  const createdAt = pages?.[pageId]?.createdAt ? moment(pages[pageId].createdAt).fromNow() : null;
  const lastModified = pages?.[pageId]?.updatedAt ? moment(pages[pageId].updatedAt).fromNow() : null;
  const createByUser = users?.usersList?.find((user) => user.id === pages?.[pageId]?.createdBy);
  const updateByUser = users?.usersList?.find((user) => user.id === pages?.[pageId]?.updatedBy);
  const handleCollectionClick = () => {
    const path = `orgs/${getOrgId()}/dashboard/collection/${pages?.[activeTabId]?.collectionId}/settings`;
    router.push(`/${path}`, { replace: true });
  };

  const showTooltips = (tooltipType) => {
    switch (tooltipType) {
      case 'EditedBy':
        return (
          <Tooltip id='edited-by-tooltip'>
            {lastModified && (
              <div className='font-12 text-secondary'>
                <div>
                  <span>Edited by </span>
                  <span className='font-weight-bold text-white'>{updateByUser?.name}</span>
                  <span>&nbsp;{lastModified}</span>
                </div>
                <div>
                  <span>Created by </span>
                  <span className='font-weight-bold text-white'>{createByUser?.name}</span>
                  <span>&nbsp;{createdAt}</span>
                </div>
              </div>
            )}
          </Tooltip>
        );
      case 'Live':
        return (
          <Tooltip id='edited-by-tooltip' className='font-12 text-secondary live-tooltip'>
            Live
          </Tooltip>
        );
    }
  };

  return (
    <div className='page-header position-sticky px-3 py-3 bg-white d-flex align-items-center justify-content-between w-100'>
      <div className='d-flex justify-content-start align-items-center'>
        {tabs?.[activeTabId]?.status === 'SAVED' && (
          <div className='header-page-name d-flex align-items-center fa-1x text-truncate'>
            <strong className='text-secondary fw-400 px-1 py-0 text-nowrap-heading cursor-pointer' onClick={handleCollectionClick}>
              {collections?.[pages?.[activeTabId]?.collectionId]?.name}
            </strong>
            <p className='p-0 m-0 text-secondary fw-400'>/</p>
          </div>
        )}
        <div className='header-page-name d-flex align-items-center fa-1x'>{renderPathLinks()}</div>
        {pages?.[pageId]?.isPublished && !loading && (
          <OverlayTrigger placement='right' overlay={showTooltips('Live')}>
            <GoDotFill size={14} color='green' />
          </OverlayTrigger>
        )}
      </div>
      <div className='header-operations d-flex align-items-center gap-2'>
        {tabs?.[activeTabId]?.status !== 'NEW' && (
          <OverlayTrigger placement='bottom' overlay={showTooltips('EditedBy')}>
            <button className='text-black-50 btn p-0'>Edited {lastModified}</button>
          </OverlayTrigger>
        )}
        {tabs?.[activeTabId]?.status !== 'NEW' && (
          <Dropdown className='ml-1'>
            <Dropdown.Toggle className='public-button p-1 text-grey' variant='default' id='dropdown-basic'>
              Share
            </Dropdown.Toggle>
            <Dropdown.Menu className='p-0'>
              <PublishModal onPublish={handlePublish} onUnpublish={handleUnPublish} id={pageId} collectionId={pages[activeTabId]?.collectionId} isContentChanged={true} />
            </Dropdown.Menu>
          </Dropdown>
        )}
        <div className='d-flex align-items-center justify-content-center rounded'>
          <IconButton onClick={() => setRevisionHistoryVisible(!revisionHistoryVisible)}>
            <MdOutlineHistory className='text-secondary' size={20} />
          </IconButton>
          {revisionHistoryVisible && <RevisionHistoryModel show={() => setRevisionHistoryVisible(!revisionHistoryVisible)} handleClose={() => setRevisionHistoryVisible(!revisionHistoryVisible)} handleRestoreContentCallback={handleRestoreContent} />}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
