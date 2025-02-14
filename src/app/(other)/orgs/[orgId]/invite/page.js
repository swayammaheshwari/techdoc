'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentOrg, getCurrentUser } from '@/components/auth/authServiceV2';
import { toast } from 'react-toastify';
import { inviteMembers, removeUser } from '@/services/orgApiService';
import { useSelector, useDispatch } from 'react-redux';
import { addNewUserData, removeUserData } from '@/components/auth/redux/usersRedux/userAction';
import { inviteuserMail } from '@/components/common/apiUtility';
import { redirectToDashboard } from '@/components/common/utility';
import { MdEmail } from 'react-icons/md';
import { FaUserCog } from 'react-icons/fa';
import { IoIosRemoveCircle, IoMdSettings } from 'react-icons/io';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import GenericModal from '@/components/main/GenericModal';
import Protected from '@/components/common/Protected';
import './inviteTeam.scss';

function InviteTeam() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestOrgId, setRequestOrgId] = useState('');

  const router = useRouter();
  const inputRef = useRef(null);
  const orgId = getCurrentOrg()?.id;

  const { users, currentUserEmail, currentOrg } = useSelector((state) => ({
    users: state.users.usersList,
    currentUserEmail: state.users.currentUser.email,
    currentOrg: state.organizations.currentOrg,
  }));

  useEffect(() => {
    setRequestEmail(searchParams.get('email'));
    setRequestOrgId(searchParams.get('orgId'));
  }, [searchParams]);

  useEffect(() => {
    if (getCurrentOrg()?.is_readable) router.push(`/orgs/${orgId}/dashboard`);
    if (typeof window.SendDataToChatbot === 'function') {
      const userId = getCurrentUser()?.id;
      window.SendDataToChatbot({
        bridgeName: 'LandingPage',
        threadId: `${userId}`,
        variables: {
          senderEmail: currentUserEmail,
          organizationName: currentOrg?.name,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (requestEmail) {
      setShowModal(true);
      setEmail(requestEmail);
    }
  }, [requestEmail]);

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const handleBack = () => {
    redirectToDashboard(orgId, router);
  };

  const handleInviteClick = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setEmail('');
  };
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendInvite(e);
  };

  const handleRemoveMember = async (userId) => {
    setLoading(true);
    try {
      const response = await removeUser(userId);
      if (response?.status == 'success' || response?.status == '200') {
        toast.success('User removed successfully');
        dispatch(removeUserData(userId));
      }
    } catch (error) {
      toast.error('Error removing member');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!validateEmail(email)) {
        toast.error('Invalid email format');
        return;
      }
      const extractedName = email.substring(0, email.indexOf('@')).replace(/[^a-zA-Z]/g, '');
      const response = await inviteMembers(extractedName, email);
      if (response?.status === 'success' || response?.status.toString().startsWith('2')) {
        dispatch(addNewUserData([response?.data?.data]));
        handleCloseModal();
        await inviteuserMail(email);
      }
    } catch (error) {
      toast.error('Cannot proceed at the moment. Please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white manage-member-team-page min-h-100vh p-4'>
      <button className='dashboard-back-button btn bg-none py-1 px-2 rounded border font-12' onClick={handleBack}>
        Go Back
      </button>
      <nav className='manage-team-navbar d-flex align-items-center justify-content-between my-3'>
        <h1 className='m-0'>Members</h1>
        <button className='btn font-12 border d-flex align-items-center rounded gap-1 py-2 px-3 bg-color-primary text-white' onClick={handleInviteClick}>
          Invite Member
        </button>
      </nav>
      <GenericModal email={email} validateEmail={validateEmail} handleKeyPress={handleKeyPress} inputRef={inputRef} setEmail={setEmail} handleSendInvite={handleSendInvite} handleCloseModal={handleCloseModal} showModal={showModal} onHide={handleCloseModal} title='Add Member' showInputGroup loading={loading} />
      <table className='manage-team-table w-100'>
        <thead>
          <tr>
            <th>
              <div className='d-flex align-items-center gap-1'>
                <MdEmail size={18} />
                <span>Email</span>
              </div>
            </th>
            <th>
              <div className='d-flex align-items-center gap-1 justify-content-center'>
                <FaUserCog size={18} />
                <span>Role</span>
              </div>
            </th>
            <th>
              <div className='d-flex align-items-center gap-1 justify-content-center'>
                <IoMdSettings size={18} />
                <span>Action</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(users).map(([key, user]) => (
            <tr key={key}>
              <td>{user?.email}</td>
              <td width='30%' className='text-center'>
                Admin
              </td>
              <td width='30%' className='text-center'>
                {user?.id !== getCurrentUser()?.id && (
                  <OverlayTrigger placement='right' overlay={<Tooltip>remove user</Tooltip>}>
                    <IoIosRemoveCircle onClick={() => handleRemoveMember(user?.id)} className='text-danger icon-button cursor-pointer' size={18} />
                  </OverlayTrigger>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Protected(InviteTeam);
