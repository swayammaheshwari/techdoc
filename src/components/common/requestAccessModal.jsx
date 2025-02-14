import React from 'react';
import CustomModal from '../customModal/customModal';
import { IoIosClose } from 'react-icons/io';

const requestAccessModal = ({ showModal, handleCancel, handleRequestAccess }) => {
  return (
    <CustomModal size='sm' modalShow={showModal} onHide={handleCancel}>
      <div className='modal-content'>
        <div className='modal-header'>
          <h5 className='modal-title'>Access Control</h5>
          <button type='button' className='close p-0' data-dismiss='modal' aria-label='Close' onClick={handleCancel}>
            <IoIosClose />
          </button>
        </div>
        <div className='modal-body border-bottom'>You do not have access to this Organisation.</div>
        <div>
          <button className='btn btn-secondary m-3 btn-sm' type='button' onClick={handleRequestAccess}>
            Request Access
          </button>
          <button className='btn btn-secondary mt-3 mb-3 btn-sm' type='button' onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default requestAccessModal;
