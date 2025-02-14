'use client';
import React from 'react';
import ParentDocument from '../parentDocument/parentDocument';
import Endpoints from '../endpoints/endpoints';
import SubDocument from '../subDocument/subDocument';
import ReduxProvider from '../../../providers/reduxProvider';

export default function Combination({ pages, invisiblePageId = '', incomingPageId = '', collectionDetails, customDomain, workerHeaders }) {
  let pageId = incomingPageId ? incomingPageId : invisiblePageId;
  return (
    <ReduxProvider>
      <div>
        {pages[pageId]?.child?.map((childId) => {
          const type = pages?.[childId]?.type || null;
          switch (type) {
            case 1:
              return <ParentDocument customDomain={customDomain} collectionDetails={collectionDetails} pages={pages} docId={childId} workerHeaders={workerHeaders} />;
            case 3:
              return <SubDocument customDomain={customDomain} collectionDetails={collectionDetails} pages={pages} subDocId={childId} workerHeaders={workerHeaders} />;
            case 4:
            case 5:
              return <Endpoints customDomain={customDomain} collectionDetails={collectionDetails} pages={pages} endpointId={childId} workerHeaders={workerHeaders} />;
            case 2:
              return <Combination customDomain={customDomain} collectionDetails={collectionDetails} pages={pages} incomingPageId={childId} workerHeaders={workerHeaders} />;
            default:
              return null;
          }
        })}
      </div>
    </ReduxProvider>
  );
}
