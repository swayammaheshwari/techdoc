import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage, isOrgDocType } from '../common/utility.js';
import groupsService from './subPageService.jsx';
import CombinedCollections from '../combinedCollections/combinedCollections.jsx';
import { addIsExpandedAction } from '../../store/clientData/clientDataActions.js';
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal.jsx';
import SubPageForm from './subPageForm.jsx';
import { MdExpandMore } from 'react-icons/md';
import IconButtons from '../common/iconButton.jsx';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { hexToRgb } from '../common/utility';
import { background } from '../backgroundColor.js';
import { addPage } from '../pages/redux/pagesActions.js';
import customPathnameHook from '../../utilities/customPathnameHook.js';
import './subpages.scss';
import { MdDeleteOutline } from 'react-icons/md';

const SubPage = (props) => {
  const { pages, clientData, collections, organizations, pathSlug } = useSelector((state) => ({
    pages: state.pages,
    clientData: state.clientData,
    collections: state.collections,
    organizations: state.organizations,
    pathSlug: state.collections?.[Object.keys(state.collections)?.[0]]?.path || '',
  }));

  const dispatch = useDispatch();

  const router = useRouter();
  const params = useParams();
  const location = customPathnameHook();

  const [showSubPageForm, setShowSubPageForm] = useState({
    addPage: false,
    edit: false,
    share: false,
  });
  const [theme, setTheme] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    if (!theme) {
      setTheme(collections[props.collection_id]?.theme);
    }
  }, [theme, collections, props.collection_id]);

  const handleHover = (hovered) => {
    setIsHovered(hovered);
  };
  const handleHovers = (hover) => {
    setIsHover(hover);
  };

  const showEditPageModal = () => {
    return (
      showSubPageForm.edit && (
        <SubPageForm
          {...props}
          title='Rename'
          show={showSubPageForm.edit}
          onCancel={() => {
            setShowSubPageForm(false);
          }}
          onHide={() => {
            setShowSubPageForm(false);
          }}
          selectedPage={props?.rootParentId}
          pageType={3}
        />
      )
    );
  };

  const openEditSubPageForm = () => {
    setShowSubPageForm({ edit: true });
  };

  const openDeleteSubPageModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteGroupModal = () => {
    setShowDeleteModal(false);
  };

  const openAddSubPageModal = async (subPageId) => {
    const newPage = { name: 'Untitled', pageType: 3 };
    dispatch(addPage(pages[subPageId].id, newPage));
    dispatch(addIsExpandedAction({ value: true, id: subPageId }));
  };

  const showAddPageEndpointModal = () => {
    return showAddCollectionModal && <DefaultViewModal {...props} title='Add Sub Page' show={showAddCollectionModal} onCancel={() => setShowAddCollectionModal(false)} onHide={() => setShowAddCollectionModal(false)} selectedPage={props?.rootParentId} pageType={3} />;
  };

  const renderBody = (subPageId) => {
    const isUserOnPublishedPage = isOnPublishedPage();
    const isUserOnTechdocOwnDomain = isTechdocOwnDomain();
    const expanded = clientData?.[subPageId]?.isExpanded ?? isUserOnPublishedPage;
    const isSelected = isUserOnPublishedPage && isUserOnTechdocOwnDomain && sessionStorage.getItem('currentPublishIdToShow') === subPageId ? 'selected' : isDashboardRoute && params.pageId === subPageId ? 'selected' : '';
    const idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW);
    const collectionId = pages?.[idToRender]?.collectionId ?? null;
    const collectionTheme = collections[collectionId]?.theme;
    const dynamicColor = hexToRgb(collectionTheme, 0.15);
    const staticColor = background['background_hover'];

    const backgroundStyle = {
      backgroundImage: (isHovered || isSelected) && isOnPublishedPage() ? `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}), linear-gradient(to right, ${staticColor}, ${staticColor})` : '',
    };

    return (
      <div className='sidebar-accordion position-relative accordion' id='child-accordion'>
        <button tabIndex={-1} className={`px-0 rounded w-100 d-flex align-items-center border-0 position-relative text-left justify-content-between ${expanded ? 'expanded' : ''}`}>
          <div className={`active-selected d-flex justify-content-between align-items-center rounded ${isSelected ? ' selected text-dark' : ''} text-secondary `} style={backgroundStyle} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
            <div
              draggable={!isUserOnPublishedPage}
              onDragOver={props.handleOnDragOver}
              onDragStart={() => props.onDragStart(subPageId)}
              onDrop={(e) => props.onDrop(e, subPageId)}
              onDragEnter={(e) => props.onDragEnter(e, subPageId)}
              onDragEnd={(e) => props.onDragEnd(e)}
              style={
                props.draggingOverId === subPageId
                  ? {
                      border: '3px solid red',
                      paddingLeft: `${props?.level * 8}px`,
                    }
                  : { paddingLeft: `${props?.level * 8}px` }
              }
              className={`d-flex cl-name ml-1 name-sub-page`}
              onClick={(e) => {
                handleRedirect(subPageId);
                if (!expanded) {
                  handleToggle(e, subPageId);
                }
              }}
            >
              <span className={`versionChovron icon-header d-flex justify-content-center `} onClick={(e) => handleToggle(e, subPageId)}>
                <IconButtons variant='sm'>{<MdExpandMore size={13} className={`collection-icons-arrow d-none `} />}</IconButtons>
                {pages[subPageId]?.meta?.icon ? <span className='collection-icons d-inline'>{pages[subPageId]?.meta?.icon}</span> : <IoDocumentTextOutline size={18} className='collection-icons d-inline' />}
              </span>
              <div className={`sidebar-accordion-item d-inline sub-page-header text-truncate fw-500 `}>{pages[subPageId]?.name}</div>
            </div>

            {isDashboardRoute({ location }, true) && !collections[props.collection_id]?.importedFromMarketPlace ? (
              <div className='sidebar-item-action align-items-center d-flex'>
                <div onClick={() => openAddSubPageModal(subPageId)} className='d-flex align-items-center'>
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
                  <div className='dropdown-item d-flex align-items-center' onClick={() => openEditSubPageForm(pages[subPageId])}>
                    <FiEdit2 color='gray' /> Rename
                  </div>
                  <div className='dropdown-item d-flex align-items-center text-danger delete-subpage-btn' onClick={() => openDeleteSubPageModal(subPageId)}>
                    <MdDeleteOutline size={15} /> Delete
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </button>
        {expanded && (
          <div className='linkWrapper versionPages'>
            <Card.Body>{pages[props.rootParentId]?.child?.length > 0 ? <CombinedCollections level={props?.level} {...props} /> : <span className='no-page fw-500 pl-5 mt-1 mb-2 d-block'>No pages inside</span>}</Card.Body>
          </div>
        )}
      </div>
    );
  };

  const handleRedirect = (id) => {
    if (isDashboardRoute({ location })) router.push(`/orgs/${params.orgId}/dashboard/page/${id}`);
    else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id);
      let pathName = getUrlPathById(id, pages);
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : pathSlug ? `/${pathSlug}/${pathName}` : `/${pathName}`;
      router.push(pathName);
    }
  };

  const handleToggle = (e, id) => {
    e.stopPropagation();
    const isExpanded = clientData?.[id]?.isExpanded;
    dispatch(addIsExpandedAction({ value: !isExpanded, id: id }));
  };

  return (
    <>
      {showAddPageEndpointModal()}
      {showEditPageModal()}
      {showDeleteModal && groupsService.showDeleteGroupModal(props, closeDeleteGroupModal, 'Delete Page', `Are you sure you wish to delete this page? All your pages and endpoints present in this page will be deleted.`, pages[props.rootParentId])}
      <div className='linkWith'>{renderBody(props.rootParentId)}</div>
    </>
  );
};

export default SubPage;
