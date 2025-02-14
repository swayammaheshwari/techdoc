import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import { updatePage } from '../../components/pages/redux/pagesActions';
import './emojipicker.scss';

const EmojiPickerComponent = ({ pageId, setShowEmojiPicker }) => {
  const dispatch = useDispatch();

  const { page, pages } = useSelector((state) => ({
    page: state?.pages[state.tabs.activeTabId],
    pages: state.pages,
  }));

  const onRemoveIcon = () => {
    const updatedMeta = { ...page.meta, icon: null };
    const editedPage = { ...pages?.[pageId], meta: updatedMeta };
    dispatch(updatePage(editedPage));
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emoji) => {
    const updatedMeta = { ...page.meta, icon: emoji };
    const editedPage = { ...pages?.[pageId], meta: updatedMeta };
    dispatch(updatePage(editedPage));
    setShowEmojiPicker(false);
  };

  return (
    <Modal show={setShowEmojiPicker} onHide={() => setShowEmojiPicker(false)} className='icon-emoji-picker-modal'>
      <Modal.Header>
        <Modal.Title>
          <div className='d-flex align-items-center justify-content-between'>
            <span className='text-grey font-14'>Emoji Picker</span>
            {pages[pageId]?.meta?.icon && (
              <Button className='emoji-picker-remove-button font-12 bg-none text-grey rounded py-1 px-2' onClick={onRemoveIcon}>
                Remove
              </Button>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EmojiPicker onEmojiClick={(data) => onEmojiClick(data.emoji)} className='emoji-picker-component border bg-white w-100 h-100' />
      </Modal.Body>
    </Modal>
  );
};

export default EmojiPickerComponent;
