import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import { useSelector } from 'react-redux';

const DisplayEndpointUserData = ({ currentEndpointId }) => {
  const { pages, users, activeTabId, tabs } = useSelector((state) => ({
    pages: state.pages,
    users: state.users?.usersList,
    activeTabId: state.tabs.activeTabId,
    tabs: state.tabs.tabs,
  }));
  const updatedById = pages?.[currentEndpointId]?.updatedBy;
  const createdAt = pages?.[currentEndpointId]?.createdAt ? moment(pages[currentEndpointId].createdAt).fromNow() : null;
  const lastModified = pages?.[currentEndpointId]?.updatedAt ? moment(pages[currentEndpointId].updatedAt).fromNow() : null;

  const user = users?.find((user) => user.id === updatedById);

  if (tabs[activeTabId]?.status !== 'NEW') {
    return (
      <div className='d-flex justify-content-center'>
        <OverlayTrigger
          placement='bottom'
          overlay={
            <Tooltip id='edited-by-tooltip'>
              {lastModified && (
                <div className='font-12 text-secondary'>
                  <div>
                    <span> Updated by </span>
                    <span className='font-weight-bold text-white'>{user?.name}</span>
                    <span>&nbsp;{lastModified}</span>
                  </div>
                  <div>
                    <span>Created by </span>
                    <span className='font-weight-bold text-white'>{user?.name}</span>
                    <span>&nbsp;{createdAt}</span>
                  </div>
                </div>
              )}
            </Tooltip>
          }
        >
          <button className='text-black-50 btn p-0 d-flex justify-content-center'>Edited {lastModified}</button>
        </OverlayTrigger>
      </div>
    );
  }

  return null;
};

export default DisplayEndpointUserData;
