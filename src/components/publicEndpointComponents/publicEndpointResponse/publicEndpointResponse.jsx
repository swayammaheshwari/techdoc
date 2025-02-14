import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import AceEditor from 'react-ace';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { IoCopyOutline } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa6';
import 'ace-builds';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-nord_dark';
import './publicEndpointResponse.scss';

const statusColor = {
  warning: '#ffc107',
  danger: '#dc3545',
  success: 'green',
  info: '#17a2b8',
  secondary: '#637288',
};

const tabsSlug = {
  response: 'Response',
  headers: 'Headers',
};

function Response(props) {
  function getMode() {
    try {
      if (JSON.parse(props?.endpointResponse)) return 'json';
    } catch (error) {
      return 'markdown';
    }
  }

  return (
    <AceEditor
      ref={props?.editorRef}
      height={props?.editorHeight}
      style={{ fontFamily: 'monospace', width: 'auto', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}
      className='border-none'
      mode={getMode()}
      theme='github'
      value={props?.endpointResponse || ''}
      readOnly
      setOptions={{
        readOnly: true,
        showLineNumbers: true,
        highlightActiveLine: false,
        highlightGutterLine: false,
        cursorStyle: 'hidden',
        behavioursEnabled: false,
      }}
      editorProps={{ $blockScrolling: false }}
      wrapEnabled={true}
      onLoad={(editor) => {
        editor.setShowPrintMargin(false);
      }}
    />
  );
}

function Headers() {
  const responseHeaders = useSelector((state) => state?.publicStore?.publicEndpointData?.response?.responseHeaders || {});
  const requestHeaders = useSelector((state) => state?.publicStore?.publicEndpointData?.response?.requestHeaders || {});
  return (
    <div className='px-2 headers-container'>
      <div className='mb-2'>
        <p className='mb-2 fw-500 text-secondary header-title'>Response Headers</p>
        {Object.keys(responseHeaders).length === 0 ? (
          <div className='d-flex align-items-center'>No response headers are present</div>
        ) : (
          <table class='m-0 w-100 border rounded'>
            <tbody>
              {Object.keys(responseHeaders).map((key) => {
                if (typeof responseHeaders[key] === 'object') return null;
                return (
                  <tr className='border'>
                    <td className='border p-2'>{key}</td>
                    <td className='border p-2'>{responseHeaders[key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className='mt-4 mb-2'>
        <p className='mb-2 fw-500 text-secondary header-title'>Request Headers</p>
        {Object.keys(requestHeaders).length === 0 ? (
          <div className='d-flex align-items-center'>No request headers are present</div>
        ) : (
          <table class='m-0 w-100 border rounded'>
            <tbody>
              {Object.keys(requestHeaders).map((key) => {
                return (
                  <tr className='border'>
                    <td className='border p-2'>{key}</td>
                    <td className='border p-2'>{requestHeaders[key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function PublicEndpointResponse(props) {
  const response = useSelector((state) => state?.publicStore?.publicEndpointData?.response || '');

  const editorRef = useRef();
  const responseRef = useRef();

  const [isCopied, setIsCopied] = useState();
  const [editorHeight, setEditorHeight] = useState();
  const [endpointResponse, setEndpointResponse] = useState('');
  const [currentTab, setCurrentTab] = useState(tabsSlug.response);

  useEffect(() => {
    generateResponseData();
    setCurrentTab(tabsSlug.response);
  }, [response]);

  useEffect(() => {
    calculateEditorHeight();
    if (endpointResponse && responseRef?.current) setTimeout(() => responseRef?.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [endpointResponse]);

  function calculateEditorHeight() {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      let newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth();
      newHeight = Math.max(newHeight, '300');
      setEditorHeight(newHeight);
    }
  }

  function generateResponseData() {
    if (typeof response?.data === 'object' && response?.data) {
      const responseObj = JSON.stringify(response?.data || {}, null, 2);
      setEndpointResponse(responseObj);
      if (responseRef?.current) setTimeout(() => responseRef?.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }
    setEndpointResponse(response?.data);
    if (responseRef?.current) setTimeout(() => responseRef?.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    return;
  }

  function handleCopy() {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }

  function getColorOfStatus() {
    if (response?.status > 100 && response?.status < 199) return statusColor.info;
    if (response?.status > 199 && response?.status < 300) return statusColor.success;
    if (response?.status > 299 && response?.status < 400) return statusColor.warning;
    if (response?.status > 399 && response?.status < 600) return statusColor.danger;
    return statusColor.secondary;
  }

  function handleSelectedTab(slug) {
    setCurrentTab(slug);
  }

  function getStyle(slug) {
    if (slug === currentTab) return { background: props?.collectionTheme, color: 'white' };
    return {};
  }

  if (!response?.data) return null;

  return (
    <div className='my-4'>
      <div className='d-flex justify-content-between align-items-center mb-2'>
        <h6>Response</h6>
        <div className='d-flex justify-content-between align-items-center'>
          <div onClick={() => handleSelectedTab(tabsSlug.response)} style={getStyle(tabsSlug.response)} className='border tab-response p-2 cursor-pointer'>
            {tabsSlug.response}
          </div>
          <div onClick={() => handleSelectedTab(tabsSlug.headers)} style={getStyle(tabsSlug.headers)} className='border tab-header p-2 cursor-pointer'>
            {tabsSlug.headers}
          </div>
        </div>
      </div>
      <div ref={responseRef} className='public-endpoint-response-container border rounded' style={{ background: props?.themeShadedColor }}>
        <div className='response-details d-flex justify-content-end align-items-center p-1'>
          <span className='response-details-items mx-2'>
            Time: <span className='text-secondary'>{response?.duration || 0}ms</span>
          </span>
          <span className='response-details-items mx-2'>
            Status: <span style={{ color: getColorOfStatus() }}>{response?.status || 400}</span>
          </span>
          {currentTab === tabsSlug.response && (
            <CopyToClipboard text={endpointResponse} onCopy={handleCopy}>
              {!isCopied ? <IoCopyOutline size={14} className='cursor-pointer mx-2' /> : <FaCheck className='mx-2' size={14} />}
            </CopyToClipboard>
          )}
        </div>
        {currentTab === tabsSlug.response ? <Response editorRef={editorRef} endpointResponse={endpointResponse} editorHeight={editorHeight} /> : <Headers />}
      </div>
    </div>
  );
}
