'use client';
import React, { useEffect, useRef, useState } from 'react';
import '../styles.scss';
import './tiptap.scss';

export default function ShowSlashMenuComponent({ editor, pathData, pathName, showSlashMenu, setShowSlashMenu, activeSlashMenuIndex, setActiveSlashMenuIndex, slashMenuPosition, searchQuery, setShowImage, setShowVideo, setShowFiles, setShowModal, linkedPage, filteredBlockTypes }) {
  const slashMenuRefs = useRef([]);
  const searchInputRef = useRef(null);

  const getSearchQuery = () => {
    if (!editor) return '';
    const { from } = editor.state.selection;
    const textBeforeCursor = editor.state.doc.textBetween(from - 50, from, ' ');
    const slashIndex = textBeforeCursor.lastIndexOf('/');
    return slashIndex !== -1 ? textBeforeCursor.slice(slashIndex + 1) : '';
  };

  useEffect(() => {
    if (showSlashMenu) {
      const handleOutsideClick = (event) => {
        if (!event.target.closest('.slash-menu')) {
          setShowSlashMenu(false);
        }
      };
      const handleNavigation = (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (activeSlashMenuIndex + 1) % filteredBlockTypes.length;
          setActiveSlashMenuIndex(nextIndex);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveSlashMenuIndex((prev) => {
            const nextIndex = (prev - 1 + filteredBlockTypes.length) % filteredBlockTypes.length;
            return nextIndex;
          });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleItemClick(filteredBlockTypes[activeSlashMenuIndex]?.type, true);
        }
      };

      window.addEventListener('keydown', handleNavigation);
      window.addEventListener('click', handleOutsideClick);
      return () => {
        window.removeEventListener('keydown', handleNavigation);
        window.removeEventListener('click', handleOutsideClick);
      };
    }
  }, [showSlashMenu, activeSlashMenuIndex, filteredBlockTypes]);

  useEffect(() => {
    if (filteredBlockTypes?.length === 1) {
      setActiveSlashMenuIndex(0);
    }
  }, [filteredBlockTypes]);

  useEffect(() => {
    slashMenuRefs.current[activeSlashMenuIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeSlashMenuIndex]);

  const insertBlock = (type) => {
    if (!editor) return;
    const { from } = editor.state.selection;

    const textBeforeSlash = editor.state.doc.textBetween(from - 1, from, ' ');

    if (textBeforeSlash === '/') {
      editor.commands.deleteRange({ from: from - 1, to: from });
    }

    switch (type) {
      case 'heading-1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading-2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading-3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'task-list':
        editor.chain().focus().toggleTaskList().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'numberedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'rule':
        editor.chain().focus().setHorizontalRule().run();
        break;
      case 'left':
      case 'right':
      case 'center':
      case 'justify':
        editor.chain().focus().setTextAlign(type).run();
        break;
      case 'linkedpages':
        editor.chain().focus().setLinkedPages(linkedPage).run();
      default:
        break;
    }

    setShowSlashMenu(false);
  };

  const handleItemClick = (type, enter) => {
    if (!editor) return;
    const { from } = editor.state.selection;
    editor.commands.deleteRange({
      from: from - getSearchQuery().length - 1,
      to: from,
    });
    switch (type) {
      case 'heading-1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading-2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading-3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'task-list':
        editor.chain().focus().toggleTaskList().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'numberedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'rule':
        editor.chain().focus().setHorizontalRule().run();
        break;
      case 'left':
      case 'right':
      case 'center':
      case 'justify':
        editor.chain().focus().setTextAlign(type).run();
        break;
      case 'image':
        setShowImage(true);
        insertBlock();
        break;
      case 'video':
        setShowVideo(true);
        insertBlock();
        break;
      case 'files':
        setShowFiles(true);
        insertBlock();
        break;
      case 'breadcrumb':
        editor.chain().focus().setBreadcrumb(pathData, pathName).run();
        insertBlock();
        break;
      case 'callout':
        editor.commands.setCallout({ type: 'important' });
        break;
      case 'linkedpages':
        setShowModal(true);
        break;
      default:
        break;
    }

    setShowSlashMenu(false);
  };

  return (
    <>
      <div
        className='slash-menu position-absolute align-items-center d-flex flex-column py-2 bg-white'
        style={{
          top: `${slashMenuPosition.top}px`,
          left: `${slashMenuPosition.left}px`,
        }}
      >
        <ul className='overflow-auto p-0 m-0 w-100'>
          {filteredBlockTypes.length === 0 ? (
            <div className='no-matches text-muted align-items-center d-flex cursor-pointer px-4 py-2'>No matches found</div>
          ) : (
            filteredBlockTypes?.map((item, index) => (
              <li key={index} className={`align-items-center d-flex cursor-pointer px-4 py-2 ${index === activeSlashMenuIndex ? 'focused-option' : ''}`} ref={(el) => (slashMenuRefs.current[index] = el)} onClick={() => handleItemClick(item.type, false)}>
                {item.icon}
                <div className='ml-4'>
                  <span className='d-flex font-14 fw-500'>{item.label}</span>
                  <span className='menu-description mt-1 font-12'>{item.description}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}
