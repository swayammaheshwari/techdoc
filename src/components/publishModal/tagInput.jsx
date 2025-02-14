import React, { useEffect, useState } from 'react';
import './tagInput.scss';
import { updateEndpoint, updatePage } from '../pages/redux/pagesActions';
import { useDispatch, useSelector } from 'react-redux';

const TagInput = ({ pageId, tags, setTags }) => {
  const { pages, page, activeTabId } = useSelector((state) => ({
    pages: state.pages,
    page: state?.pages[state.tabs.activeTabId],
    activeTabId: state.tabs.activeTabId,
  }));

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addTag = () => {
    if (inputValue.trim()) {
      const newTags = [...tags, inputValue.trim()];
      setTags(newTags);
      setInputValue('');
      setIsExpanded(true);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addTag();
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);
    if (updatedTags?.length === 0) {
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`tag-input-container overflow-y-auto overflow-x-hidden scrollbar-width-thin border ${isFocused || tags?.length > 0 ? 'focused' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className='tag-list d-flex'>
        <p className='font-12 m-0 p-2 d-flex flex-wrap gap-2'>
          {tags.map((tag, index) => (
            <span key={index} className='border p-1 bg-white'>
              {tag}
              <span className='tag-remove ml-2 cursor-pointer' onClick={() => handleRemoveTag(index)}>
                &times;
              </span>
              {index < tags.length - 1 ? '' : ''}
            </span>
          ))}
        </p>
        <input className='tag-input-field p-1 font-14' type='text' value={inputValue} onChange={handleInputChange} onKeyDown={handleInputKeyDown} onBlur={handleInputBlur} onFocus={handleFocus} />
      </div>
    </div>
  );
};

export default TagInput;
