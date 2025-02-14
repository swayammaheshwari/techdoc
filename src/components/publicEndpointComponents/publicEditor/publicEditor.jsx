import React from 'react';
import { getInnerText } from '@/utilities/htmlConverter';

export default function PublicEditor(props) {
  const text = getInnerText(props?.htmlData);

  if (text?.length === 0) return null;

  return <div className='tiptap' dangerouslySetInnerHTML={{ __html: props?.htmlData }} />;
}
