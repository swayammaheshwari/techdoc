import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BiSolidImage } from 'react-icons/bi';
import Modal from 'react-bootstrap/Modal';
import pageApiService from '../../components/pages/pageApiService';
import UploadIcon from '../../../public/assets/icons/uploadIcon.svg';
import { updatePage } from '../../components/pages/redux/pagesActions';

const HoverActions = ({ pageId, pages, pathData, showImage, setShowImage, showImageModal, setShowImageModal }) => {
  const [ImageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileSizeVal, setFileSizeVal] = useState(false);

  const dispatch = useDispatch();

  const { page, activeTabId } = useSelector((state) => ({
    page: state?.pages[state.tabs.activeTabId],
    activeTabId: state.tabs.activeTabId,
  }));

  const handleFileUpload = async (files) => {
    const formData = new FormData();
    formData.append('files', files[0]);
    formData.append('pathData', pathData);
    setLoading(true);
    try {
      const result = await pageApiService.uploadFiles(formData);
      const item = result.data.files[0];
      const updatedMeta = {
        ...page.meta,
        featureImage: { url: item.url, name: item.originalName },
      };
      const editedPage = { ...pages?.[activeTabId], meta: updatedMeta };
      dispatch(updatePage(editedPage));
      setLoading(false);
      setShowImage(false);
      setShowImageModal(false);
    } catch (error) {
      setLoading(false);
      console.error('Error uploading files:', error);
    }
  };

  const handleSave = () => {
    setLoading(true);
    try {
      const updatedMeta = {
        ...page.meta,
        featureImage: { url: ImageUrl, name: 'image' },
      };
      const editedPage = { ...pages?.[activeTabId], meta: updatedMeta };
      dispatch(updatePage(editedPage));
      setLoading(false);
      setShowImage(false);
      setShowImageModal(false);
    } catch (error) {
      setLoading(false);
      console.error('Error uploading files:', error);
    }
  };

  const onFileChange = (e) => {
    const selectedFiles = e.target.files;
    let valid = true;
    const file = selectedFiles[0];
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      valid = false;
      setFileSizeVal(true);
      setTimeout(() => {
        setFileSizeVal(false);
      }, 2000);
      e.target.value = '';
    }
    if (valid && selectedFiles?.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const renderUploadModule = (disabled) => (
    <>
      <div className='favicon-container cursor-pointer'>
        <label className='font-icon mt-2 ml-3' htmlFor='upload-button'>
          <UploadIcon />
        </label>
        <input type='file' id='upload-button' disabled={disabled} style={{ display: 'none' }} accept={'image/*'} onChange={(e) => onFileChange(e)} />
      </div>
    </>
  );
  function handleClick() {
    setShowImage(true);
  }
  return (
    <>
      {!pages[pageId]?.meta?.featureImage && (
        <button className='btn text-secondary position-absolute description-button d-flex align-items-center gap-1' style={{ top: '0px', left: '0px' }} onClick={handleClick}>
          <BiSolidImage />
          <span>Add Cover Image</span>
        </button>
      )}

      {/* Modal for setting image URL */}
      <Modal
        show={showImage || showImageModal}
        onHide={() => {
          setShowImage(false), setShowImageModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className='text-grey font-16'>Set Cover Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className='d-flex justify-content-center align-items-center flex-column' style={{ height: '25vh' }}>
              <div
                className='spinner-border'
                role='status'
                style={{
                  borderColor: '#6c757d #6c757d #6c757d transparent',
                  width: '4rem',
                  height: '4rem',
                  borderWidth: '0.25rem',
                }}
              >
                <span className='sr-only'>Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className='form-group upload-modal mt-3'>
                <div className='d-flex justify-content-between align-items-center'>
                  <div className='favicon-uploader mr-3'>{renderUploadModule()}</div>
                  <div className='mr-4 text-muted font-weight-bold'>OR</div>
                  <input type='text' className='form-control' value={ImageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
                {fileSizeVal ? (
                  <p
                    className='text-danger font-12 mt-2'
                    style={{
                      marginLeft: '100px',
                    }}
                  >
                    Your files exceeds the maximum file size limit.
                  </p>
                ) : (
                  <p
                    className='text-grey font-12 mt-2'
                    style={{
                      marginLeft: '100px',
                    }}
                  >
                    {' '}
                    *File Size Limit 20MB types.
                  </p>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className='p-1'>
          <button className='btn btn-secondary' onClick={handleSave}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HoverActions;
