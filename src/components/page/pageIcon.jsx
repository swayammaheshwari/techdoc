import React from 'react';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { getClickPosition } from '@/components/common/utility';

const PageIcon = ({ icon, toggleEmojiPicker }) => {
  const handleClick = (event) => {
    toggleEmojiPicker();
    getClickPosition(event);
  };

  return (
    <button
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        width: '50px',
        height: '60px',
        lineHeight: '60px',
      }}
      onClick={handleClick}
    >
      {icon ? <span style={{ fontSize: '32px' }}>{icon}</span> : <IoDocumentTextOutline size={38} className='collection-icons d-inline' />}
    </button>
  );
};

export default PageIcon;
