import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { Card, Dropdown, DropdownButton } from 'react-bootstrap';
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage, isOrgDocType } from '../common/utility';
import { addIsExpandedAction, setDefaultversionId } from '../../store/clientData/clientDataActions';
import pageService from '../pages/pageService';
import SubPageForm from '../subPages/subPageForm';
import SelectVersion from './selectVersion/selectVersion';
import CombinedCollections from '../combinedCollections/combinedCollections';
import IconButtons from '../common/iconButton';
import CustomModal from '../customModal/customModal';
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal';
import { MdExpandMore } from 'react-icons/md';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { hexToRgb } from '../common/utility';
import { background } from '../backgroundColor.js';
import { addPage } from '../pages/redux/pagesActions.js';
import { SlSettings } from 'react-icons/sl';
import customPathnameHook from '../../utilities/customPathnameHook.js';
import './collectionVersions.scss';
import { MdDeleteOutline } from 'react-icons/md';
import shortid from 'shortid';

const CollectionParentPages = (props) => {
  const { pages, clientData, collections, pathSlug } = useSelector((state) => {
    return {
      pages: state.pages,
      clientData: state.clientData,
      collections: state.collections,
      pathSlug: state.collections?.[Object.keys(state.collections)?.[0]]?.path || '',
    };
  });

  const params = useParams();
  const router = useRouter();
  const location = customPathnameHook();
  const versionDropDownRef = useRef(null);
  const dispatch = useDispatch();

  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [selectedVersionName, setSelectedVersionName] = useState('');
  const [defaultVersionName, setDefaultVersionName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [selectedPage, setSelectedPage] = useState({});
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [defaultVersionId, setDefaultVersionId] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [theme, setTheme] = useState('');
  const [showPageForm, setShowPageForm] = useState({ edit: false });

  useEffect(() => {
    if (!theme) setTheme(collections[props.collection_id]?.theme);
    const defaultVersion = findDefaultVersion();
    const { rootParentId } = props;
    const versionId = clientData?.[rootParentId]?.selectedVersionId;
    const versionName = clientData?.[rootParentId]?.selectedVersionName;
    if (defaultVersion) {
      setDefaultVersionName(defaultVersion?.name);
      setDefaultVersionId(defaultVersion?.id);
      versionId ? setSelectedVersionId(versionId) : setSelectedVersionId(defaultVersion?.id);
      versionName ? setSelectedVersionName(versionName) : setSelectedVersionName(defaultVersion?.name);
    }
  }, [theme, props.collection_id]);

  useEffect(() => {
    if (pages[selectedVersionId]?.name !== selectedVersionName) {
      if (selectedVersionId === defaultVersionId) setDefaultVersionName(pages[selectedVersionId]?.name);
      setSelectedVersionName(pages[selectedVersionId]?.name);
    }
  }, [pages, selectedVersionId, selectedVersionName, defaultVersionId]);

  const findDefaultVersion = () => {
    const { rootParentId } = props;
    const children = pages[rootParentId]?.child || [];
    return children.map((childId) => pages[childId]).find((page) => page?.state === 1);
  };

  const showAddPageEndpointModal = () => {
    return showAddCollectionModal && <DefaultViewModal {...props} title='Add Page' show={showAddCollectionModal} onCancel={() => setShowAddCollectionModal(false)} onHide={() => setShowAddCollectionModal(false)} selectedVersion={selectedVersionId ? selectedVersionId : defaultVersionId} pageType={3} />;
  };

  const openManageVersionModal = () => {
    return (
      showVersionForm && (
        <CustomModal modalShow={showVersionForm} onHide={() => setShowVersionForm(false)}>
          <SelectVersion parentPageId={props?.rootParentId} />
        </CustomModal>
      )
    );
  };

  const showEditPageModal = () => {
    return showPageForm.edit && <SubPageForm {...props} title='Rename' show={showPageForm.edit} onCancel={() => setShowPageForm({ ...showPageForm, edit: false })} onHide={() => setShowPageForm({ ...showPageForm, edit: false })} selectedPage={props?.rootParentId} pageType={1} />;
  };

  const closeDeleteVersionModal = () => {
    setShowDeleteModal(false);
  };

  const closeDeletePageModal = () => {
    setShowDeleteModal(false);
  };

  const handleRedirect = (id) => {
    if (isDashboardRoute({ location })) return router.push(`/orgs/${params.orgId}/dashboard/page/${id}`);
    sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id);
    let pathName = getUrlPathById(id, pages);
    pathName = isTechdocOwnDomain() ? `/p/${pathName}` : pathSlug ? `/${pathSlug}/${pathName}` : `/${pathName}`;
    router.push(pathName);
  };

  const handleToggle = (e, id) => {
    e.stopPropagation();
    const isExpanded = clientData?.[id]?.isExpanded;
    dispatch(addIsExpandedAction({ value: !isExpanded, id: id }));
  };

  const handleParentPageClick = (e, expanded) => {
    handleRedirect(props.rootParentId);
    if (!expanded) handleToggle(e, props.rootParentId);
  };

  const versionName = () => {
    const versionName = defaultVersionName?.length > 10 ? `${defaultVersionName.substring(0, 7)} ... ` : defaultVersionName;
    return pages?.[props.rootParentId]?.child?.length === 1 ? versionName : selectedVersionName?.length > 10 ? `${selectedVersionName.substring(0, 7)} ... ` : selectedVersionName;
  };

  const versionDropDown = (rootId) => {
    if (isOrgDocType()) {
      return (
        <DropdownButton className='version-dropdown' ref={versionDropDownRef} id='dropdown-basic-button' title={versionName()} onClick={(e) => e.stopPropagation()}>
          {pages[rootId].child.map((childId, index) => (
            <Dropdown.Item key={index} onClick={(e) => handleDropdownItemClick(childId, rootId)}>
              {pages[childId]?.name}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      );
    }
  };

  const openAddPageEndpointModal = async (pageId) => {
    const newPage = { name: 'Untitled', pageType: 3 };
    if (!isOrgDocType()) {
      dispatch(addPage(pages[pageId].versionId, newPage));
      dispatch(addIsExpandedAction({ value: true, id: pageId }));
    } else {
      const newPage = {
        name: 'Untitled',
        pageType: 3,
        requestId: shortid.generate(),
        state: 1,
        versionId: null,
      };
      dispatch(addPage(selectedVersionId ? selectedVersionId : defaultVersionId, newPage));
      setSelectedPage({ ...pages[pageId] });
    }
  };

  const openEditPageForm = (pageId) => {
    setShowPageForm({ edit: true });
    setSelectedPage(pageId);
  };

  const openDeletePageModal = (pageId) => {
    setShowDeleteModal(true);
    setSelectedPage({ ...pages[pageId] });
  };

  const handleDropdownItemClick = (id, rootId) => {
    const newSelectedVersionName = pages[id]?.name;
    setSelectedVersionName(newSelectedVersionName);
    setSelectedVersionId(id);
    const payload = {
      value: id,
      defaultVersionId: defaultVersionId,
      selectedVersionName: newSelectedVersionName,
      defaultVersionName: defaultVersionName,
      rootId: rootId,
    };
    dispatch(setDefaultversionId(payload));
  };

  const renderBody = (pageId) => {
    let isUserOnPublishedPage = isOnPublishedPage();
    const expanded = clientData?.[pageId]?.isExpanded ?? isUserOnPublishedPage;
    const rootId = pageId;
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === pageId ? 'selected' : isDashboardRoute && params.pageId === pageId ? 'selected' : '';
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW);
    let collectionId = pages?.[idToRender]?.collectionId ?? null;
    var collectionTheme = collections[collectionId]?.theme;
    const dynamicColor = hexToRgb(collectionTheme, 0.15);
    const staticColor = background['background_hover'];

    const backgroundStyle = {
      backgroundImage: (isHovered || isSelected) && isOnPublishedPage() ? `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}), linear-gradient(to right, ${staticColor}, ${staticColor})` : '',
    };

    return (
      <div className='hm-sidebar-outer-block my-1' key={pageId}>
        <div className='sidebar-accordion position-relative versionBoldHeading' id='child-accordion'>
          <button tabIndex={-1} className={`px-0 rounded w-100 d-flex align-items-center border-0 position-relative text-left justify-content-between ${expanded ? 'expanded' : ''}`}>
            <div className={`active-select d-flex align-items-center justify-content-between rounded my-1 ${isSelected ? ' selected text-dark' : ''} text-secondary `} style={backgroundStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              <div className='d-flex align-items-end cl-name' onClick={(e) => handleParentPageClick(e, expanded)}>
                <div className='d-flex td-name ml-1 align-items-center'>
                  <span className={`versionChovron icon-header d-flex justify-content-center`} onClick={(e) => handleToggle(e, props.rootParentId)}>
                    <IconButtons variant='sm'>{<MdExpandMore size={13} className={`collection-icons-arrow d-none `} />}</IconButtons>
                    {pages[pageId]?.meta?.icon ? <span className='collection-icons d-inline'>{pages[pageId]?.meta?.icon}</span> : <IoDocumentTextOutline size={18} className='collection-icons d-inline' />}
                  </span>
                  <div
                    className={`d-flex align-items-center name-parent-page `}
                    draggable={!isUserOnPublishedPage}
                    onDragOver={props.handleOnDragOver}
                    onDragStart={() => props.onDragStart(pageId)}
                    onDrop={(e) => props.onDrop(e, pageId)}
                    onDragEnter={(e) => props.onDragEnter(e, pageId)}
                    onDragEnd={(e) => props.onDragEnd(e)}
                    style={props.draggingOverId === pageId ? { border: '3px solid red' } : null}
                  >
                    <div className={`text-truncate d-inline fw-500 `}>{pages[pageId]?.name}</div>
                    {versionDropDown(rootId)}
                  </div>
                </div>
              </div>

              {isDashboardRoute({ location }, true) && !collections[props.collection_id]?.importedFromMarketPlace ? (
                <div className='sidebar-item-action align-items-center d-flex'>
                  <div className='d-flex align-items-center' onClick={() => openAddPageEndpointModal(selectedVersionId || defaultVersionId)}>
                    <IconButtons>
                      <FiPlus />
                    </IconButtons>
                  </div>
                  <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <IconButtons>
                      <BsThreeDots />
                    </IconButtons>
                  </div>
                  <div className='dropdown-menu dropdown-menu-right'>
                    <div className='dropdown-item d-flex align-items-center' onClick={() => openEditPageForm(pageId)}>
                      <FiEdit2 color='var(--icon-color-dark-grey)' size={16} /> Rename
                    </div>
                    {isOrgDocType() && (
                      <div className='dropdown-item d-flex align-items-center' onClick={() => setShowVersionForm(true)}>
                        <SlSettings color='var(--icon-color-dark-grey)' size={16} /> Manage Version
                      </div>
                    )}
                    <div className='dropdown-item d-flex align-items-center text-danger delete-parent-btn' onClick={() => openDeletePageModal(pageId)}>
                      <MdDeleteOutline size={16} /> Delete
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </button>
          {expanded ? (
            <div className='version-collapse'>
              <Card.Body>
                <div className='linkWrapper versionPages'>
                  {pages[pages[props.rootParentId].child?.length === 1 ? defaultVersionId : selectedVersionId]?.child?.length !== 0 ? <CombinedCollections {...props} level={0} page_id={pageId} rootParentId={pages[props.rootParentId].child?.length === 1 ? defaultVersionId : selectedVersionId} /> : <span className='no-page fw-500 pl-5 mt-1 mb-2 d-block'>No pages inside</span>}
                </div>
              </Card.Body>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      {showAddPageEndpointModal()}
      {showEditPageModal()}
      {showVersionForm && openManageVersionModal()}
      {showDeleteModal && pageService.showDeletePageModal(props, closeDeleteVersionModal, 'Delete Version', `Are you sure you want to delete this Version?All your subpages and endpoints present in this version will be deleted.`)}
      {showDeleteModal && pageService.showDeletePageModal(props, closeDeletePageModal, 'Delete Page', `Are you sure you want to delete this pages? All your versions,subpages and endpoints present in this page will be deleted.`, selectedPage)}
      {renderBody(props.rootParentId)}
    </React.Fragment>
  );
};

export default CollectionParentPages;
