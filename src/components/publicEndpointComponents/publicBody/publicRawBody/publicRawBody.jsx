import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AceEditor from 'react-ace';
import { storePublicEndpointData } from '@/store/publicStore/publicStoreActions';
import { debounce } from 'lodash';
import PublicRawBodyDescription from './publicRawBodyDescription/publicRawBodyDescription';
import 'ace-builds';
import './publicRawBody.scss';

export default function PublicRawBody(props) {
  const { publicBody, publicEndpointData } = useSelector((state) => {
    return {
      publicBody: state?.publicStore?.publicEndpointData?.body,
      publicEndpointData: state.publicStore.publicEndpointData,
    };
  });

  const dispatch = useDispatch();

  const editorRef = useRef();

  const editorChange = debounce(storeBodyValue, 500);

  const [editorHeight, setEditorHeight] = useState('350px');

  useEffect(() => {
    handleHeightOfEditor(editorRef.current?.editor?.getSession()?.getValue());
  }, []);

  function storeBodyValue(editorValue) {
    const endpointData = publicEndpointData;
    endpointData.body.raw.value = editorValue;
    dispatch(storePublicEndpointData(endpointData));
  }

  function handleEditorChange(editorValue) {
    editorChange(editorValue);
  }

  function handleHeightOfEditor() {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      const lineHeight = editor.renderer.lineHeight;
      const lineCount = editor.session.getLength();
      const contentHeight = lineCount * lineHeight;
      let newHeight = Math.min(contentHeight, 500);
      newHeight = Math.max(newHeight, 350);
      setEditorHeight(`${newHeight}px`);
    }
  }

  return (
    <React.Fragment>
      {props.selectedTab ? (
        <div className='public-editor-container h-100 rounded'>
          <AceEditor
            ref={editorRef}
            height={editorHeight}
            className='public-raw-editor'
            mode='json'
            theme='github'
            value={publicBody?.raw?.value || ''}
            onChange={handleEditorChange}
            style={{ fontFamily: 'monospace', background: props?.themeShadedColor, width: 'auto' }}
            onLoad={(editor) => {
              editor.setShowPrintMargin(false);
            }}
          />
        </div>
      ) : (
        <PublicRawBodyDescription themeShadedColor={props?.themeShadedColor} collectionTheme={props?.collectionTheme} />
      )}
    </React.Fragment>
  );
}
