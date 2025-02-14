import React, { useState, useEffect } from 'react';
import { getPublishedVersions, restorePublishedVersion } from '@/components/pages/pageApiService';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './page.scss';
import './revisionhistory.scss';
import { BsCircleFill } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import IconButton from '@/components/common/iconButton';

const RevisionHistoryModel = ({ show, handleClose, handleRestoreContentCallback }) => {
  const params = useParams();
  const { pages, users } = useSelector((state) => ({
    pages: state.pages,
    users: state.users,
  }));
  const { orgId, pageId } = params;

  const [publishedVersion, setPublishedVersion] = useState({});
  const [isLoadingPublishedVersion, setIsLoadingPublishedVersion] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [restorePublishVersion, setSelectedRestorePublishVersion] = useState(null);
  const [showRestoreConfirmation, setShowRestoreConfirmation] = useState(false);

  /** Fetch Published Versions using useEffect */
  useEffect(() => {
    const fetchPublishedVersions = async () => {
      setIsLoadingPublishedVersion(true);
      try {
        const { data } = await getPublishedVersions(pageId);
        setPublishedVersion(data.publishedVersions || {});
      } catch (error) {
        console.error('Error fetching published versions:', error);
        toast.error('Failed to load published versions.');
      } finally {
        setIsLoadingPublishedVersion(false);
      }
    };

    if (pageId) {
      fetchPublishedVersions();
    }
  }, [pageId]);

  useEffect(() => {
    setSelectedVersion(null);
    setSelectedRevision(null);
  }, [pageId]);

  useEffect(() => {
    if (publishedVersion && Object.keys(publishedVersion).length > 0) {
      const defaultVersionKey = Object.keys(publishedVersion)[0];
      const defaultVersion = publishedVersion[defaultVersionKey];
      if (defaultVersion) {
        setSelectedVersion(defaultVersion);
        setSelectedRestorePublishVersion(defaultVersionKey);
      }
    }
  }, [publishedVersion]);

  const handleRestoreContent = (content) => {
    if (content) {
      setSelectedRevision(content);
    }
  };

  const handleRestoreConfirmation = async () => {
    if (selectedRevision) {
      handleRestoreContent(selectedRevision);
      handleRestoreContentCallback(selectedRevision);
      setSelectedRevision(null);
    } else if (selectedVersion) {
      await restorePublishedVersion(pageId, restorePublishVersion);
      handleRestoreContentCallback(null);
      toast.success('Version Restored');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} className='revision-history-content-modal'>
      <Modal.Header closeButton>
        <Modal.Title>
          <h5>Published Versions</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='p-0 revision-history-body d-flex h-100 overflow-y-auto overflow-x-hidden'>
        <div className='revision-history-content flex-grow-1 p-2 h-100 w-100 overflow-y-auto overflow-x-hidden scrollbar-width-thin'>
          {isLoadingPublishedVersion ? (
            <div className='d-flex justify-content-center align-items-center h-100'>
              <p className='text-secondary'>Loading...</p>
            </div>
          ) : Object.keys(publishedVersion || {}).length === 0 ? (
            <div className='d-flex justify-content-center align-items-center h-100'>
              <p className='text-secondary'>No published versions available</p>
            </div>
          ) : selectedRevision ? (
            <div className='page-text-render h-100 w-100 d-flex justify-content-start tiptap'>
              <div
                className='page-content-body h-100'
                dangerouslySetInnerHTML={{
                  __html: selectedRevision?.html,
                }}
              />
            </div>
          ) : selectedVersion ? (
            <div className='page-text-render h-100 w-100 d-flex justify-content-start tiptap p-4'>
              <div
                className='page-content-body h-100'
                dangerouslySetInnerHTML={{
                  __html: selectedVersion?.contents,
                }}
              />
            </div>
          ) : null}
        </div>

        {isLoadingPublishedVersion ? (
          <p className='m-4 text-secondary'>Loading...</p>
        ) : (
          Object.keys(publishedVersion || {}).length != 0 && (
            <aside className='revision-aside-pane border-left overflow-y-auto overflow-x-hidden scrollbar-width-thin'>
              <ul className='p-2 h-100'>
                {Object.keys(publishedVersion).map((versionKey) => {
                  const version = publishedVersion[versionKey];
                  const publishedByUser = users?.usersList?.find((user) => user?.id === version?.updatedBy);
                  const isSelected = selectedVersion === version;
                  return (
                    <li
                      type='button'
                      className={`cursor-pointer py-1 px-2 my-2 rounded revision-history-content-heading ${isSelected ? 'bg-light-grey' : ''}`}
                      key={versionKey}
                      onClick={() => {
                        setSelectedVersion(version);
                        setSelectedRestorePublishVersion(versionKey);
                      }}
                    >
                      <p className={`font-14 my-1 mx-0 ${isSelected ? 'text-black fw-500' : 'text-secondary'}`}>{new Date(version?.updatedAt).toLocaleString() || 'Date Unknown'}</p>
                      <p className='font-12 m-0 ml-2 d-flex align-items-center gap-2 text-secondary'>
                        <BsCircleFill size={6} className='text-success' />
                        <span>Published By - </span>
                        <span>{publishedByUser ? publishedByUser?.name : 'Unknown'}</span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )
        )}
      </Modal.Body>
      <Modal.Footer className='revision-histoy-footer'>
        {showRestoreConfirmation ? (
          <>
            <button
              type='button'
              className='btn bg-primary text-white'
              onClick={() => {
                handleRestoreConfirmation();
                setShowRestoreConfirmation(false);
              }}
            >
              Confirm
            </button>
            <button type='button' className='btn bg-secondary text-white' onClick={() => setShowRestoreConfirmation(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className='btn bg-primary text-white' onClick={() => setShowRestoreConfirmation(true)}>
            Restore
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RevisionHistoryModel;
