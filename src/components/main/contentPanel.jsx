'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Tab, Nav } from 'react-bootstrap';
import TabContent from '../tabs/tabContent';
import CustomTabs from '../tabs/tabs';
import tabStatusTypes from '../tabs/tabStatusTypes';
import Environments from '../environments/environments';
import IconButton from '../common/iconButton.jsx';
import { addNewTab, fetchTabsFromRedux, openInNewTab, setActiveTabId } from '../tabs/redux/tabsActions';
import { getCurrentOrg, getCurrentUser } from '../auth/authServiceV2';
import { updateStateOfCurlSlider } from '../modals/redux/modalsActions.js';
import './main.scss';
import 'react-tabs/style/react-tabs.css';
import { IoCodeSlashOutline } from 'react-icons/io5';
import { SiAmazonapigateway } from 'react-icons/si';
import { MdHttp } from 'react-icons/md';
import { GrGraphQl } from 'react-icons/gr';
import customPathnameHook from '../../utilities/customPathnameHook.js';
import { sidebarOpenStatus } from '../../components/main/redux/sidebarActions';
import { RxHamburgerMenu } from 'react-icons/rx';
import emptyImage from '../../../public/assets/web/empty.png';
import Image from 'next/image';

const ContentPanel = () => {
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const dispatch = useDispatch();
  const router = useRouter();
  const location = customPathnameHook();
  const params = useParams();
  const pathname = usePathname();
  const [saveEndpointFlag, setSaveEndpointFlag] = useState(false);
  const [savePageFlag, setSavePageFlag] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState(null);

  const toggleSidebar = () => {
    dispatch(sidebarOpenStatus(!isSidebarOpen));
  };

  const { endpoints, collections, pages, tabs, historySnapshots, curlSlider, activeTabId } = useSelector((state) => ({
    endpoints: state.pages,
    collections: state.collections,
    groups: state.groups,
    versions: state.versions,
    pages: state.pages,
    tabs: state.tabs,
    historySnapshots: state.history,
    curlSlider: state.modals?.curlSlider || false,
    activeTabId: state.tabs.activeTabId,
  }));

  useEffect(() => {
    dispatch(fetchTabsFromRedux());
  }, [dispatch]);

  useEffect(() => {
    const { endpointId, pageId, historyId, collectionId, runId } = params;
    if (endpointId && endpointId !== 'new') {
      if (tabs.tabs[endpointId]) {
        if (tabs.activeTabId !== endpointId) {
          dispatch(setActiveTabId(endpointId));
        }
      } else if (endpoints && endpoints[endpointId]) {
        dispatch(
          openInNewTab({
            id: endpointId,
            type: 'endpoint',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {},
          })
        );
      }
    }

    if (pageId && pageId !== 'new') {
      if (tabs.tabs[pageId]) {
        if (tabs.activeTabId !== pageId) {
          dispatch(setActiveTabId(pageId));
        }
      } else if (pages && pages[pageId]) {
        dispatch(
          openInNewTab({
            id: pageId,
            type: 'page',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
          })
        );
      }
    } else if (pages && pages[pageId]) {
      dispatch(
        openInNewTab({
          id: pageId,
          type: 'page',
          status: tabStatusTypes.SAVED,
          previewMode: false,
          isModified: false,
          state: {},
        })
      );
    }

    if (historyId) {
      if (tabs.tabs[historyId]) {
        if (tabs.activeTabId !== historyId) {
          dispatch(setActiveTabId(historyId));
        }
      } else if (historySnapshots && historySnapshots[historyId]) {
        dispatch(
          openInNewTab({
            id: historyId,
            type: 'history',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {},
          })
        );
      }
    }

    if (collectionId && runId) {
      if (tabs.tabs[runId]) {
        if (tabs.activeTabId !== runId) {
          dispatch(setActiveTabId(runId));
        }
      } else if (runId) {
        dispatch(
          openInNewTab({
            id: runId,
            type: 'manual-runs',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: {},
          })
        );
      }
    }

    if (collectionId && !runId) {
      if (tabs.tabs[collectionId]) {
        if (tabs.activeTabId !== collectionId) {
          dispatch(setActiveTabId(collectionId));
        }
      } else if (collections && collections[collectionId]) {
        let pageType;
        if (location.pathname.split('/')[6] === 'settings') {
          pageType = 'SETTINGS';
        } else if (location.pathname.split('/')[6] === 'runs') {
          pageType = 'RUNS';
        } else if (location.pathname.split('/')[6] === 'runner') {
          pageType = 'RUNNER';
        }
        dispatch(
          openInNewTab({
            id: collectionId,
            type: 'collection',
            status: tabStatusTypes.SAVED,
            previewMode: false,
            isModified: false,
            state: { pageType },
          })
        );
      }
    }

    if (pathname === `/orgs/${params.orgId}/dashboard`) {
      const { orgId } = params;
      if (tabs?.tabsOrder?.length) {
        const { tabs: tabsData, activeTabId, tabsOrder } = tabs;

        let tabId = activeTabId;
        if (!tabsData[tabId]) tabId = tabsOrder[0];

        const tab = tabsData[tabId];
        if (tabId !== activeTabId) dispatch(setActiveTabId(tabId));

        const collectionLength = Object.keys(collections)?.length;
        if (tab?.type === 'manual-runs') {
          router.push(`/orgs/${orgId}/dashboard/collection/${tab?.state?.collectionId}/runs/${tab?.id}`);
          return;
        }
        if (collectionLength > 0) {
          router.push(tab.type !== 'collection' ? `/orgs/${orgId}/dashboard/${tab.type}/${tab.status === 'NEW' ? tabId : tabId}` : `/orgs/${orgId}/dashboard/collection/${tabId}/settings`);
        } else {
          dispatch(addNewTab());
        }
      }
    }
  }, [params]);

  const handleSaveEndpoint = (flag, tabId) => {
    setSaveEndpointFlag(flag);
    setSelectedTabId(tabId);
  };

  const handleSavePage = (flag, tabId) => {
    setSavePageFlag(flag);
    setSelectedTabId(tabId);
  };

  const handleCodeCurlClick = () => {
    dispatch(updateStateOfCurlSlider(!curlSlider));
  };

  const renderLandingDashboard = () => {
    const orgMetaType = getCurrentOrg()?.meta?.type;
    const orgMeta = getCurrentOrg()?.meta;
    if (orgMeta === null || orgMetaType === 1) {
      return (
        <>
          <div className='no-collection h-100vh d-flex flex-column justify-content-center align-items-center flex-wrap'>
            <SiAmazonapigateway size={100} className='mb-4 text-secondary' />
            <p className='mb-4 text-secondary'>Create a new request:</p>
            <div>
              <button onClick={() => dispatch(addNewTab())} className='btn text-secondary'>
                <MdHttp size={30} />
              </button>
              <button onClick={() => {}} className='btn text-secondary'>
                <GrGraphQl size={22} />
              </button>
            </div>
          </div>
        </>
      );
    } else if (orgMetaType === 0) {
      return (
        <>
          <div className='no-collection h-100 d-flex flex-column justify-content-center align-items-center flex-wrap'>
            <Image src={emptyImage} alt='TechDoc' width='300' height='auto' />
            <p className='m-0 text-grey techdoc-journey'>Begin Your Journey to Excellence in Documentation</p>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <main role='main' className='main h-100vh'>
      <Tab.Container id='left-tabs-example' defaultActiveKey={tabs.activeTabId} activeKey={tabs.activeTabId}>
        {getCurrentUser() ? (
          <>
            <div className='content-header border-bottom align-items-center w-100 d-flex flex-row position-sticky top-0 left-0'>
              <div className='mx-3 py-1 px-2 rounded cursor-pointer sidebar-open-icon' onClick={toggleSidebar} style={{ display: isSidebarOpen ? 'none' : 'block' }}>
                <RxHamburgerMenu size={16} />
              </div>

              <div className='tabs-container d-flex justify-content-between w-100 position-relative pr-2 bg-white'>
                <CustomTabs handle_save_endpoint={handleSaveEndpoint} handle_save_page={handleSavePage} />
                <div className='d-flex'>
                  <Environments />
                  {params.endpointId && tabs.tabs?.length !== 0 && (
                    <div className='d-flex justify-content-center align-items-center code-curl-icon' onClick={handleCodeCurlClick}>
                      <IconButton>
                        <IoCodeSlashOutline className='m-1' type='button' data-bs-toggle='offcanvas' data-bs-target='#offcanvasRight' aria-controls='offcanvasRight' size={18} />
                      </IconButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='content-header'>
            <div className='tabs-container d-flex'>
              <Nav variant='pills'>
                <Nav.Item className='px-0'>
                  <Nav.Link className='active'>
                    <button className='btn font-weight-bold'>Untitled</button>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </div>
        )}
        {tabs?.tabsOrder?.length === 0 ? (
          renderLandingDashboard()
        ) : (
          <div className='main-content'>
            <TabContent handle_save_endpoint={handleSaveEndpoint} handle_save_page={handleSavePage} save_endpoint_flag={saveEndpointFlag} save_page_flag={savePageFlag} selected_tab_id={selectedTabId} />
          </div>
        )}
      </Tab.Container>
    </main>
  );
};

export default ContentPanel;
