import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import AceEditor from 'react-ace';
import { HTTPSnippet } from 'httpsnippet-lite';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { languages, primaryLanguages, secondaryLanguages } from '@/components/endpoints/languages';
import { getInnerText } from '@/utilities/htmlConverter';
import { IoCopyOutline } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa6';
import Languages from './languages/languages';
import { addhttps } from '@/components/endpoints/endpointUtility';
import { bodyTypesEnums } from '@/components/common/bodyTypeEnums';
import 'ace-builds';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-nord_dark';
import './publicCodeTemplate.scss';

export default function PublicCodeTemplate(props) {
  const publicEndpointData = useSelector((state) => state.publicStore.publicEndpointData);

  const editorRef = useRef();

  const [selectedLanguage, setSelectedLanguage] = useState('shell');
  const [code, setCode] = useState(null);
  const [editorHeight, setEditorHeight] = useState('');
  const [isCopy, setIsCopy] = useState(false);

  useEffect(() => {
    generateCode();
  }, [publicEndpointData, selectedLanguage]);

  useEffect(() => {
    calculateEditorHeight();
  }, [code]);

  function calculateEditorHeight() {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      const newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth();
      const maxHeight = window.innerHeight * 0.6; // 92vh in pixels
      const minHeight = Math.max(newHeight, 250);
      setEditorHeight(`${Math.min(minHeight, maxHeight)}px`);
    }
  }

  function getDataInArrayForm(content) {
    let data = [];
    Object.keys(content || {})?.forEach((key) => {
      if (!content[key].checked) return;
      data.push({ name: [getInnerText(key)], value: getInnerText(content[key]?.value) });
    });
    return data;
  }

  function generatePostData(publicBody) {
    const dataToSend = [];
    if (publicBody.type === bodyTypesEnums['application/x-www-form-urlencoded'] || publicBody?.type === bodyTypesEnums['multipart/form-data']) {
      const data = publicBody[publicBody.type];
      for (let i = 0; i < data?.length; i++) {
        if (data[i].checked === 'true' && getInnerText(data[i].key) !== '') {
          dataToSend.push({ name: getInnerText(data[i].key), value: getInnerText(data[i].value) });
        }
      }
      return {
        mimeType: publicBody?.type,
        params: dataToSend,
      };
    }
    return {
      mimeType: publicBody?.type,
      text: publicBody?.raw?.value || '',
    };
  }

  async function generateCode() {
    try {
      let request = { method: publicEndpointData?.requestType, url: addhttps(getInnerText(publicEndpointData.URL)), headers: getDataInArrayForm(publicEndpointData?.headers) };
      if (request.method.toLowerCase() != 'get') request.postData = generatePostData(publicEndpointData.body) || {};
      const snippet = new HTTPSnippet(request);
      const options = { indent: '  ' };
      const client = selectedLanguage === 'axiosNode' ? 'axios' : undefined;
      const language = selectedLanguage === 'axiosNode' ? 'node' : selectedLanguage;
      const output = await snippet.convert(language, client, options);
      setCode(decodeURI(output));
    } catch (err) {
      return 'curl --request GET \\ \n  --url https://';
    }
  }

  function handleCopy() {
    setIsCopy(true);
    setTimeout(() => {
      setIsCopy(false);
    }, 1000);
  }

  return (
    <div className='flex-grow-1 public-code-template-container mx-2'>
      <h6 className='mb-2'>Languages</h6>
      <Languages selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} {...props} />
      <div className='code-window-top d-flex justify-content-end align-items-center w-100 p-2'>
        <CopyToClipboard text={code} onCopy={handleCopy}>
          {!isCopy ? <IoCopyOutline size={18} color='white' className='cursor-pointer' /> : <FaCheck color='white' size={18} />}
        </CopyToClipboard>
      </div>
      <AceEditor
        width='100%'
        ref={editorRef}
        height={editorHeight}
        mode={languages[selectedLanguage].mode}
        theme='nord_dark'
        highlightActiveLine={false}
        focus={false}
        value={code}
        readOnly
        editorProps={{ $blockScrolling: false }}
        showGutter={false}
        wrapEnabled={true}
        onLoad={(editor) => {
          editor.setShowPrintMargin(false);
        }}
      />
      <div className='code-window-bottom p-2'></div>
    </div>
  );
}
