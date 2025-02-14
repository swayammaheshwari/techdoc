import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { TwitterPicker } from 'react-color';
import { BsUpload } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { updateCollection } from '../../redux/collectionsActions';
import './addLogoAndThemeTabContent.scss';

const colors = ['#4CAF50', '#FF5722', '#FFC107', '#2196F3', '#9C27B0', '#E91E63', '#DD755E', '#333333'];

export default function AddLogoAndThemeTabContent(props) {
  const collections = useSelector((state) => state.collections);

  const params = useParams();

  const dispatch = useDispatch();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [binaryFile, setBinaryFile] = useState(null);
  const [color, setColor] = useState('#333333');

  const logoUrlInputRef = useRef();

  useEffect(() => {
    if (!logoUrlInputRef.current) return;
    const collectionData = collections[params?.collectionId];
    logoUrlInputRef.current.value = collectionData?.docProperties?.defaultLogoUrl || '';
    setBinaryFile(collectionData?.favicon || '');
    setColor(collectionData?.theme || '');
  }, [params?.collectionId]);

  const handleReaderLoaded = (readerEvt) => {
    const binaryString = readerEvt.target.result;
    setBinaryFile(window.btoa(binaryString));
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new window.FileReader();
      reader.onload = handleReaderLoaded;
      reader.readAsBinaryString(selectedFile);
    }
    setUploadedFile(selectedFile || null);
  };

  const handleChangeComplete = (color) => {
    setColor(color.hex);
  };

  const handleRemoveIcon = () => {
    setBinaryFile('');
  };

  const handleSave = () => {
    const collectionData = collections[params?.collectionId];
    collectionData.favicon = uploadedFile;
    collectionData.docProperties.defaultLogoUrl = logoUrlInputRef?.current?.value || '';
    collectionData.theme = color;
    collectionData.favicon = binaryFile;
    dispatch(updateCollection(collectionData, () => toast.success('Saved & Published Successfuly')));
  };

  return (
    <div className={`p-4 ${props?.selectedTab === 2 ? '' : 'd-none'}`}>
      <h3>Add Logo</h3>
      <p className='text-secondary'>Logo will be visible at the sidebar and browser tab.</p>
      <div className='d-flex align-items-center'>
        {!binaryFile ? (
          <div className='border rounded p-4 cursor-pointer upload-icon-container'>
            <label htmlFor='upload-button'>
              <BsUpload size={20} className='cursor-pointer' />
            </label>
            <input type='file' id='upload-button' disabled={isDisabled} style={{ display: 'none' }} accept='.png' onChange={(e) => onFileChange(e)} />
          </div>
        ) : (
          <img src={`data:image/png;base64,${binaryFile}`} height='70' width='70' alt='data' />
        )}
        <span className='text-secondary mx-4'>OR</span>
        <input ref={logoUrlInputRef} placeholder='Enter Logo URL' className='d-flex align-items-center title-tab-input border p-4 rounded' />
      </div>
      {binaryFile && (
        <button onClick={handleRemoveIcon} className='my-2 favicon-remove-btn btn btn-danger text-white'>
          Remove Icon
        </button>
      )}
      <br />
      <br />
      <h3 className='mt-4'>Add Theme</h3>
      <p className='text-secondary'>Theme will only be visible for API Documentation</p>
      <div className='d-flex align-items-center'>
        <TwitterPicker color={color} onChangeComplete={handleChangeComplete} colors={colors} />
      </div>
      <br />
      <br />
      <button onClick={handleSave} className='mt-4 btn bg-primary text-white'>
        Save & Publish
      </button>
    </div>
  );
}
