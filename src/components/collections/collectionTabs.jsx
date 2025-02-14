'use client';
import React, { useState } from 'react';
import PublishCollectionTabContent from './collectionSettingTabsContent/publishCollectionTabContent/publishCollectionTabContent';
import AddTitleTabContent from './collectionSettingTabsContent/addTitleTabContent/addTitleTabContent';
import AddLogoAndThemeTabContent from './collectionSettingTabsContent/addLogoAndThemeTabContent/addLogoAndThemeTabContent';
import DomainTabContent from './collectionSettingTabsContent/domainTabContent/domainTabContent';
import HeaderAndFooterTabContent from './collectionSettingTabsContent/headerAndFooterTabContent/headerAndFooterTabContent';
import GoogleTagManagerTabContent from './collectionSettingTabsContent/googleTagManagerTabContent/googleTagManagerTabContent';
import RedirectionsTabContent from './collectionSettingTabsContent/redirectionsTabContent/redirectionsTabContent';
import SelectEnviornmentTabContent from './collectionSettingTabsContent/selectEnviornmentTabContent/selectEnvironmentTabContent';
import PublishSidebar from '../publishSidebar/publishSidebar';
import PublishDocsReview from '../publishDocs/publishDocsReview';
import './collectionTabs.scss';

const tabSlab = ['Publish Collection', 'Add Title', 'Logo And Theme', 'Domain', 'Header And Footer', 'Bulk Publish', 'Redirections', 'Google Tag Manager', 'Public Environment'];

const CollectionTabs = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className='w-100 h-100 d-flex justify-content-center'>
      <div className='collection-setting-tabs-sidebar py-2 px-4 d-flex flex-column align-items-center h-100 py-2'>
        <div className='d-flex flex-column justify-content-center my-4'>
          {tabSlab.map((tabName, index) => (
            <p className={`fw-500 text-secondary py-1 px-2 my-1 cursor-pointer tab-slab rounded ${selectedTab === index ? 'selected-setting-tab' : ''}`} onClick={() => setSelectedTab(index)}>
              {tabName}
            </p>
          ))}
          <div className='saperation-ruler w-100 my-4'></div>
          <p className={`fw-500 text-secondary py-1 px-2 my-1 cursor-pointer tab-slab rounded ${selectedTab === 9 ? 'selected-setting-tab' : ''}`} onClick={() => setSelectedTab(9)}>
            User Feedbacks
          </p>
        </div>
      </div>
      <div className='collection-setting-tab-content w-100 p-2'>
        <PublishCollectionTabContent selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <AddTitleTabContent selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <AddLogoAndThemeTabContent selectedTab={selectedTab} />
        <HeaderAndFooterTabContent selectedTab={selectedTab} />
        <DomainTabContent selectedTab={selectedTab} />
        {selectedTab === 5 && <PublishSidebar selectedTab={selectedTab} />}
        <RedirectionsTabContent selectedTab={selectedTab} />
        <GoogleTagManagerTabContent selectedTab={selectedTab} />
        <PublishDocsReview selectedTab={selectedTab} />
        <SelectEnviornmentTabContent selectedTab={selectedTab} />
      </div>
    </div>
  );
};

export default CollectionTabs;
