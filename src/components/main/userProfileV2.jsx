'use client';
import React, { useState, forwardRef } from 'react';
import { Button, Dropdown, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Avatar from 'react-avatar';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentOrg } from '../auth/authServiceV2';
import { switchOrg, fetchOrganizations, leaveOrganization } from '../../services/orgApiService';
import { toast } from 'react-toastify';
import { closeAllTabs } from '../tabs/redux/tabsActions';
import { onHistoryRemoved } from '../history/redux/historyAction';
import { IoIosArrowDown } from 'react-icons/io';
import CollectionForm from '../collections/collectionForm';
import { FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import ImportCollectionModal from '../collections/importCollection/importColectionModel';
import CustomModal from '../customModal/customModal';
import { isOrgDocType, removeFromLocalStorage } from '../common/utility';
import { FaCheck } from 'react-icons/fa6';
import { IoExit } from 'react-icons/io5';
import ConfirmationModal from '../common/confirmationModal';
import './userProfile.scss';
import { MdOutlineKeyboardDoubleArrowLeft } from 'react-icons/md';
import { sidebarOpenStatus } from '../../components/main/redux/sidebarActions';
import IconButton from '../common/iconButton';

const UserProfile = () => {
  const router = useRouter();

  const historySnapshot = useSelector((state) => state.history);
  const tabs = useSelector((state) => state.tabs);
  const organizationList = useSelector((state) => state.organizations.orgList);
  const currentUser = useSelector((state) => state.users.currentUser);
  const mode = useSelector((state) => state?.clientData?.mode || false);
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [modalForTabs, setModalForTabs] = useState(false);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentOrg, setCurrentOrg] = useState('');
  const [openLeaveModal, setOpenLeaveModal] = useState(false);
  const [orgToLeave, setOrgToLeave] = useState(null);
  const [show, setUserProfileShow] = useState(false);
  const toggleSidebar = () => {
    dispatch(sidebarOpenStatus(!isSidebarOpen));
  };

  const toggleModal = async () => {
    setShowModal(!showModal);
    if (!showModal) await fetchOrganizations();
  };

  const handleAddNewClick = () => {
    setShowNewCollectionModal((prev) => !prev);
  };

  const handleImportClick = () => {
    setShowImportModal((prev) => !prev);
  };

  const userProfilehandleShow = () => setUserProfileShow(true);

  const renderAvatarWithOrg = (onClick, ref1) => {
    const currentOrg = getCurrentOrg();
    const firstLetterCapital = currentOrg.is_readable ? currentOrg?.meta?.companyName?.[0].toUpperCase() : currentOrg?.name?.[0].toUpperCase();
    return (
      <div className='menu-trigger-box d-flex align-items-center justify-content-between w-100 rounded gap-2 p-1 m-1'>
        <div
          ref={ref1}
          className='org-button d-flex position-relative align-items-center cursor-pointer flex-grow-1 gap-2'
          onClick={(e) => {
            e.preventDefault();
            onClick(e);
            userProfilehandleShow();
          }}
        >
          <div className='avatar-org rounded' size={15}>
            {firstLetterCapital}
          </div>
          <div className='org-name text-secondary'>{currentOrg.is_readable ? currentOrg?.meta?.companyName : currentOrg?.name || null}</div>
          <IoIosArrowDown size={16} className='text-secondary' />
        </div>
        <IconButton className='text-black rounded cursor-pointer text-center sidebar-close-icon' onClick={toggleSidebar}>
          <MdOutlineKeyboardDoubleArrowLeft size={20} />
        </IconButton>
        <div className='add-button d-flex align-items-center'>
          {isOrgDocType() && (
            <button className='border-0 btn btn-light py-1 px-2 text-secondary shadow font-12 fw-500' onClick={handleImportClick}>
              Import
            </button>
          )}
          <ImportCollectionModal
            show={showImportModal}
            onClose={() => {
              handleImportClick();
            }}
          />
          <CustomModal size='sm' modalShow={showNewCollectionModal} hideModal={handleAddNewClick}>
            <CollectionForm title='Add new Collection' onHide={handleAddNewClick} />
          </CustomModal>
        </div>
      </div>
    );
  };

  const handleCreateOrganizationClick = () => router.push('/onBoarding');

  const renderUserDetails = () => {
    const email = currentUser.email;
    return (
      <div className='profile-details border-bottom px-3 d-flex align-items-center justify-content-between py-2'>
        <div className='d-flex align-items-center'>
          <div className='user-icon mr-2'>
            <FiUser size={12} />
          </div>
          <div className='profile-details-user-name'>
            <span className='profile-details-label-light font-12'>{email}</span>
          </div>
        </div>
      </div>
    );
  };

  const openAccountAndSettings = () => {
    const orgId = getCurrentOrg()?.id;
    router.push(`/orgs/${orgId}/invite`);
  };

  const renderInviteTeam = () => {
    return (
      <div className='invite-user cursor-pointer mt-1 p-1' onClick={openAccountAndSettings}>
        <span className='members'>Members</span>
      </div>
    );
  };

  const renderAddWorkspace = () => {
    return (
      <div className='invite-user cursor-pointer mb-2 p-1' onClick={handleCreateOrganizationClick}>
        <span className='members'>Add Workspace</span>
      </div>
    );
  };

  const handleOrgClick = (org, selectedOrg) => {
    toggleModal();
    const tabIdsToClose = tabs.tabsOrder;
    setCurrentOrg(org);
    if (org.id === selectedOrg.id) {
      setModalForTabs(false);
      toast.error('This organization is already selected');
    } else {
      router.push(`/orgs/${org?.id}/dashboard`);
    }
  };

  const showTooltips = () => {
    return (
      <Tooltip className='font-12 text-secondary'>
        <span>Leave</span>
      </Tooltip>
    );
  };

  const leaveOrg = (id) => {
    setOpenLeaveModal(true);
    setOrgToLeave(id);
  };

  const renderLeaveModal = () => {
    return openLeaveModal && <ConfirmationModal show={openLeaveModal} onHide={() => setOpenLeaveModal(false)} proceed_button_callback={() => leaveOrganization(orgToLeave, router)} title={'Are you sure you want to leave this organization?'} submitButton='Leave' rejectButton='Cancel' />;
  };

  const getOrgTypeLabel = (org) => {
    if (org?.meta?.companyId) {
      return 'SSO';
    } else if (org?.meta?.type === 0) {
      return 'DOC';
    } else if (org?.meta === null || org?.meta?.length === 0 || org?.meta?.type === 1) {
      return 'API';
    }
    return '';
  };

  const renderOrgListDropdown = () => {
    const selectedOrg = getCurrentOrg();
    return (
      <div className='org-listing-container justify-content-center d-flex overflow-y-auto overflow-x-hidden scrollbar-width-none'>
        <div className='org-listing-column d-flex flex-column gap-1 w-100 mt-2'>
          {!mode ? (
            organizationList?.map((org, key) => (
              <div key={key} className='d-flex name-list cursor-pointer px-2 justify-content-between align-items-center'>
                <div className='org-collection-name d-flex gap-3 align-items-center' onClick={() => handleOrgClick(org, selectedOrg)}>
                  <Avatar className='avatar-org' name={org.is_readable ? org?.meta?.companyName : org.name} size={32} />
                  <span className={`org-listing-button ${org.id === selectedOrg?.id ? 'selected-org' : ''}`}>{org?.is_readable ? org?.meta?.companyName : org.name}</span>
                  <span className='chip text-white d-flex align-items-center justify-content-center bg-dark font-weight-bold'>{getOrgTypeLabel(org)}</span>
                </div>
                {org?.id !== selectedOrg?.id && !org?.is_readable && (
                  <OverlayTrigger placement='bottom' overlay={showTooltips()}>
                    <span className='leave-icon invisible d-flex align-items-center cursor-pointer' onClick={() => leaveOrg(org.id)}>
                      <IoExit size={20} />
                    </span>
                  </OverlayTrigger>
                )}
                {org.id === selectedOrg?.id && (
                  <span className='check'>
                    <FaCheck />
                  </span>
                )}{' '}
              </div>
            ))
          ) : (
            <div className='d-flex name-list cursor-pointer'>
              <div className='org-collection-name d-flex'>
                <Avatar className='mr-2 avatar-org' name={selectedOrg.is_readable ? selectedOrg.meta.companyName : selectedOrg.name} size={32} />
                <span className={`org-listing-button mr-1 selected-org`}>{selectedOrg?.is_readable ? selectedOrg.meta.companyName : selectedOrg.name}</span>
                <span className='chip'>{getOrgTypeLabel(selectedOrg)}</span>
              </div>
              <span className='check'>
                <FaCheck />
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleTrashClick = () => {
    const currentOrgId = getCurrentOrg().id;
    router.push(`/orgs/${currentOrgId}/trash`);
  };

  const renderTrash = () => {
    return (
      <div className='profile-details cursor-pointer p-1' onClick={handleTrashClick}>
        <span className='trash mr-2'>Trash</span>
      </div>
    );
  };

  const handleLogout = () => {
    router.push('/logout');
  };

  const renderLogout = () => {
    return (
      <div className='profile-details cursor-pointer p-1' onClick={() => handleLogout()}>
        <span className='logout mr-2'> Logout</span>
      </div>
    );
  };

  const renderAddCollection = () => {
    return (
      <div className='collection cursor-pointer p-1' onClick={handleAddNewClick}>
        <span className='add-collection mr-2'>Add collection</span>
      </div>
    );
  };

  const handleClose = () => {
    setModalForTabs(false);
    setShowModal(false);
    setUserProfileShow(false);
  };

  const handleTabsandHistory = async (value) => {
    const tabIdsToClose = tabs.tabsOrder;
    const history = historySnapshot;

    if (value === 'yes') {
      dispatch(closeAllTabs(tabIdsToClose));
      removeFromLocalStorage(tabIdsToClose);
      dispatch(onHistoryRemoved(history));
      switchOrg(currentOrg.id);
      redirectToDashboard(currentOrg.id, router);
    } else if (value === 'no') {
      setModalForTabs(false);
      setShowModal(false);
    }
  };

  const showModalForTabs = () => {
    if (!modalForTabs) {
      return null;
    }
    return (
      <Modal show={modalForTabs} onHide={handleClose} className='mt-4'>
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>Save Tabs!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontWeight: '500' }}>If you switch organization all the tabs and history will be deleted!</Modal.Body>
        <Modal.Footer>
          <Button className='btn btn-danger btn-lg mr-2' onClick={() => handleTabsandHistory('yes')}>
            Yes
          </Button>
          <Button className='btn btn-secondary outline btn-lg' variant='secondary' onClick={() => handleTabsandHistory('no')}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <>
      <div className='profile-menu'>
        <Dropdown
          className='d-flex align-items-center'
          onToggle={async (isOpen) => {
            if (isOpen) {
              await fetchOrganizations();
            }
          }}
        >
          <Dropdown.Toggle
            as={forwardRef(({ onClick }, ref) => {
              return renderAvatarWithOrg(onClick, ref);
            })}
            id='dropdown-custom-components'
          />
        </Dropdown>
        <Modal show={show} onHide={handleClose} className='user-profile-modal'>
          <Modal.Body className='p-0'>
            {renderUserDetails()}
            <div className='profile-listing-container overflow-y-auto overflow-x-hidden scrollbar-width-none'>
              {renderOrgListDropdown()}
              <div className=' py-2'>
                {!mode && (
                  <>
                    <div>{renderAddWorkspace()}</div>
                    <hr className='p-0 m-0' />
                  </>
                )}
                {!getCurrentOrg()?.is_readable && <div>{renderInviteTeam()}</div>}
                <div>{renderTrash()}</div>
                <div>{renderAddCollection()}</div>
                {!mode && <div>{renderLogout()}</div>}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
      {modalForTabs ? showModalForTabs() : ''}
      {renderLeaveModal()}
    </>
  );
};

export default UserProfile;
