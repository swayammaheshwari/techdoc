import React, { useEffect } from 'react';
import { languages, primaryLanguages, secondaryLanguages } from '@/components/endpoints/languages';
import { BsThreeDots } from 'react-icons/bs';
import IconButton from '@/components/common/iconButton';
import { hexToRgb } from '@/components/common/utility';
import './languages.scss';

export default function Languages(props) {
  useEffect(() => {
    const root = document.documentElement;
    const rgbForm = hexToRgb(props?.collectionTheme, 0.7);
    root.style.setProperty('--language-theme-color', rgbForm);
  }, []);

  function getLanguageName(languageName) {
    if (languageName === 'axiosNode') return 'AXIOS';
    return languageName.toUpperCase();
  }

  function changeLanguage(languageName) {
    props?.setSelectedLanguage(languageName);
  }

  function chooseSecondaryLanguage(languageName) {
    props?.setSelectedLanguage(languageName);
  }

  return (
    <div className='my-3 d-flex justify-content-between align-items-center'>
      {primaryLanguages.map((languageName) => {
        const LanguageIcon = languages[languageName].imagePath;
        return (
          <button onClick={() => changeLanguage(languageName)} is-selected={props?.selectedLanguage === languageName ? 'true' : 'false'} className='language-card d-flex flex-column align-items-center p-2 mr-2 rounded cursor-pointer'>
            <LanguageIcon width='28' height='28' />
            <span className='language-name my-1'>{getLanguageName(languageName)}</span>
          </button>
        );
      })}
      <div className='dropdown d-flex flex-column align-items-center p-2 rounded cursor-pointer'>
        <div id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
          <IconButton>
            <BsThreeDots color='black' size={22} />
          </IconButton>
        </div>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {secondaryLanguages.map((languageName) => {
            const LanguageIcon = languages[languageName].imagePath;
            return (
              <div onClick={() => chooseSecondaryLanguage(languageName)} className='d-flex justify-content-start align-items-center cursor-pointer py-2 px-0 dropdown-item'>
                <LanguageIcon className='mx-1' width='18' height='18' />
                <span className='language-name'>{getLanguageName(languageName)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
