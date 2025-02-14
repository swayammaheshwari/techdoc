'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import ContentPanel from './contentPanel';
import SideBarV2 from './sideBarV2';
import OnlineStatus from '../onlineStatus/onlineStatus';
import { getCurrentUser } from '../auth/authServiceV2';
import NoCollectionIcon from '../../../public/assets/icons/collection.svg';
import CollectionForm from '../collections/collectionForm';
import CustomModal from '../customModal/customModal';
import ShortcutModal from '../shortcutModal/shortcutModal';
import Protected from '../common/Protected';
import useExposeReduxState from '@/utilities/useExposeReduxState';
import { updateMode } from '../../store/clientData/clientDataActions';
import 'react-toastify/dist/ReactToastify.css';
import './main.scss';

const MainV2 = () => {
  useExposeReduxState();
  const params = useParams();
  const collections = useSelector((state) => state.collections);
  const dispatch = useDispatch();

  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [showAddCollectionPage, setShowAddCollectionPage] = useState(true);
  const [showShortcutModal, setShowShortcutModal] = useState(false);

  useEffect(() => {
    const checkSessionToken = sessionStorage.getItem('sessionToken');

    if (checkSessionToken) dispatch(updateMode({ mode: true }));
    else dispatch(updateMode({ mode: false }));

    window.addEventListener('keydown', addShortCutForShortcutModal);

    return () => {
      window.removeEventListener('keydown', addShortCutForShortcutModal);
    };
  }, []);

  const setVisitedOrgs = () => {
    const orgId = params.orgId;
    const org = {};
    org[orgId] = true;
    window.localStorage.setItem('visitedOrgs', JSON.stringify(org));
  };

  const showCollectionDashboard = () => {
    if (!getCurrentUser()) return false;
    const collectionLength = Object.keys(collections)?.length;
    const orgId = params.orgId;
    const temp = JSON.parse(window.localStorage.getItem('visitedOrgs'));
    return !(temp && temp[orgId]) && collectionLength === 0 && showAddCollectionPage;
  };

  const renderLandingDashboard = () => (
    <div className='no-collection d-flex flex-column justify-content-center align-items-center flex-grow-1'>
      <img src={NoCollectionIcon} alt='' />
      <p className='mb-4 text-grey'>Add your first collection for API testing and Public API Doc</p>
      <button onClick={() => setShowAddCollectionModal(true)} className='btn btn-primary'>
        + Add collection
      </button>
      <p className='mt-3 text-grey'>Or</p>
      <div
        className='text-grey cursor-pointer'
        onClick={() => {
          setVisitedOrgs();
          setShowAddCollectionPage(false);
        }}
      >
        Try Out Without a Collection
      </div>
    </div>
  );

  const addShortCutForShortcutModal = async () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if ((isMac && event.metaKey && event.key === '/') || (!isMac && event.ctrlKey && event.key === '/')) {
      event.preventDefault();
      handleShortcutModal();
    }
  };

  const handleAddNewClick = () => {
    setShowAddCollectionModal((prev) => !prev);
  };

  const handleShortcutModal = () => {
    setShowShortcutModal((prev) => !prev);
  };

  return (
    <React.Fragment>
      <div className='custom-main-container min-h-100vh w-100'>
        <OnlineStatus />
        <div className='main-panel-wrapper w-100 h-100 d-flex'>
          <SideBarV2 />
          {showCollectionDashboard() ? renderLandingDashboard() : <ContentPanel />}
        </div>
      </div>
      <CustomModal size='sm' modalShow={showAddCollectionModal} hideModal={handleAddNewClick}>
        <CollectionForm title='Add new Collection' onHide={handleAddNewClick} />
      </CustomModal>
      <CustomModal size='sm' modalShow={showShortcutModal} onHide={handleShortcutModal}>
        <ShortcutModal hideModal={handleShortcutModal} />
      </CustomModal>
    </React.Fragment>
  );
};

export default Protected(MainV2);
