import React from 'react';
import { useRouter } from 'next/navigation';
import { IoIosClose } from 'react-icons/io';
import CustomModal from '../customModal/customModal';

const invalidOrgModal = ({ invalidOrg, sso, ssoName }) => {
  const router = useRouter();
  return (
    <CustomModal size='sm' modalShow={invalidOrg || sso} onHide={() => router.push('/login')}>
      <div className='modal-content'>
        <div className='modal-header'>
          <h5 className='modal-title'>{sso ? 'Access Denied' : 'Invalid Organisation'}</h5>
          <button type='button' className='close p-0' data-dismiss='modal' aria-label='Close' onClick={() => router.push('/login')}>
            <IoIosClose />
          </button>
        </div>
        <div className='modal-body border-bottom'>{sso ? `You do not have access to ${ssoName} Organisation. Please contact the administrator to request access.` : 'Organisation you are trying to access does not exist.'}</div>
      </div>
    </CustomModal>
  );
};
export default invalidOrgModal;
