import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import AceEditor from 'react-ace';
import { defaultHeader, defaultFooter } from '@/components/codeEditor/defaultBlock';
import { updateCollection } from '../../redux/collectionsActions';
import IconButton from '@/components/common/iconButton';
import { toast } from 'react-toastify';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import './headerAndFooterTabContent.scss';

export default function HeaderAndFooterTabContent(props) {
  const collections = useSelector((state) => state.collections);

  const params = useParams();

  const dispatch = useDispatch();

  const [code, setCode] = useState({ headerCode: '', footerCode: '' });

  useEffect(() => {
    const collectionData = collections[params?.collectionId];
    setCode({ headerCode: collectionData?.docProperties?.defaultHeader, footerCode: collectionData?.docProperties?.defaultFooter });
  }, [params?.collectionId]);

  const handleChange = (editorValue, slug) => {
    setCode({ ...code, [slug]: editorValue });
  };

  const handleLoadSampleCode = (slug) => {
    setCode({ ...code, [slug]: slug === 'headerCode' ? defaultHeader : defaultFooter });
  };

  function handleSaveAndPublish() {
    const collectionData = collections[params?.collectionId];
    collectionData.docProperties = { ...collectionData.docProperties, defaultFooter: code.footerCode, defaultHeader: code.headerCode };
    dispatch(updateCollection(collectionData, () => toast.success('Saved & Published Successfuly')));
  }

  return (
    <div className={`p-4 header-footer-container ${props?.selectedTab === 4 ? '' : 'd-none'}`}>
      <h3>Header And Footer</h3>
      <p className='text-secondary'>Add header & footer to your website.</p>
      <div className='d-flex justify-content-between align-items-start mt-4'>
        <div className='flex-grow-1 header-footer-main-container'>
          <div className='d-flex justify-content-between align-items-center'>
            <h5>Header</h5>
            <IconButton onClick={() => handleLoadSampleCode('headerCode')}>
              <span className='text-secondary'>Load example header</span>
            </IconButton>
          </div>
          <AceEditor
            placeholder='Write header html or load example header'
            width='100%'
            className='border rounded'
            mode='html'
            theme='github'
            onChange={(editorValue) => handleChange(editorValue, 'headerCode')}
            value={code.headerCode}
            onLoad={(editor) => {
              editor.setShowPrintMargin(false);
            }}
          />
          <div className='d-flex justify-content-between align-items-center mt-4'>
            <h5>Footer</h5>
            <IconButton onClick={() => handleLoadSampleCode('footerCode')}>
              <span className='text-secondary'>Load example footer</span>
            </IconButton>
          </div>
          <AceEditor
            placeholder='Write footer html or load example footer'
            width='100%'
            className='border rounded'
            mode='html'
            theme='github'
            onChange={(editorValue) => handleChange(editorValue, 'footerCode')}
            value={code.footerCode}
            onLoad={(editor) => {
              editor.setShowPrintMargin(false);
            }}
          />
          <button onClick={handleSaveAndPublish} className='mt-4 btn bg-primary text-white'>
            Save & Publish
          </button>
        </div>
        <div className='flex-grow-1 mx-3 preview-main-container'>
          <h5>Preview</h5>
          <div className='d-flex flex-column align-items-center justify-content-between border rounded h-100 overflow-auto'>
            {code.headerCode || code.footerCode ? (
              <>
                <div dangerouslySetInnerHTML={{ __html: code.headerCode }} className='header-preview w-100'></div>
                <div dangerouslySetInnerHTML={{ __html: code.footerCode }} className='footer-preview w-100'></div>
              </>
            ) : (
              <div className='text-secondary h-100 d-flex justify-content-center align-items-center'>Write html to see preview here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
