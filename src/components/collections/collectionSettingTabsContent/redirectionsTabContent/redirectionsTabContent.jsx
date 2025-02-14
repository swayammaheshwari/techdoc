'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import Joi from 'joi';
import { addUrlWithAdditionalPath, deleteMappedUrl } from '@/components/collections/redirectionApiServices';
import { getUrlPathById, isOnPublishedPage } from '@/components/common/utility';
import { addOldUrlOfPage, deleteOldUrlOfPage } from '@/components/pages/redux/pagesActions';
import { toast } from 'react-toastify';
import { BiLogoGraphql } from 'react-icons/bi';
import { addCollectionAndPages } from '@/components/redux/generalActions';
import './redirectionsTabContent.scss';

import Protected from '@/components/common/Protected';
import { getCurrentOrg } from '@/components/auth/authServiceV2';
import Loader from '@/components/common/common/Loader';
import IconButton from '@/components/common/iconButton';

const RedirectionsTabContent = (props) => {
  const params = useParams();
  const userPathRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const orgId = getCurrentOrg()?.id;

  const { pages, collections, childIds, customDomain, path } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections,
      childIds: state?.pages?.[state.collections?.[params.collectionId]?.rootParentId]?.child || [],
      customDomain: state.collections?.[params.collectionId]?.customDomain || '',
      path: state.collections?.[params.collectionId]?.path || '',
    };
  });

  const [redirectUrls, setRedirectUrls] = useState([]);
  const [selectedPageId, setselectedPageId] = useState(null);
  const [latestUrl, setLatestUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const visiblePath = customDomain ? (path ? `https://${customDomain}/${path}/` : `https://${customDomain}/`) : `${process.env.NEXT_PUBLIC_UI_URL}/p/`;

  useEffect(() => {
    getAllPagesAndCollection();
  }, [params?.collectionId]);

  const getAllPagesAndCollection = async () => {
    addCollectionAndPages(params.orgId, isOnPublishedPage());
    loadUrls();
  };

  const addOldUrlsOfChilds = (pagesHaveOldUrls, pageId) => {
    {
      pages[pageId]?.oldUrls &&
        Object.keys(pages[pageId]?.oldUrls)?.length > 0 &&
        Object.entries(pages[pageId]?.oldUrls).forEach(([index, path]) => {
          pagesHaveOldUrls.push({ pageId, path, pathId: index });
        });
    }
    if (pages?.[pageId]?.child?.length > 0) {
      pages[pageId].child.forEach((pageId) => addOldUrlsOfChilds(pagesHaveOldUrls, pageId));
    }
  };

  const loadUrls = async () => {
    const collectionId = params.collectionId;
    const rootParentId = collections?.[collectionId]?.rootParentId;
    const rootParentChilds = pages?.[rootParentId]?.child;
    const pagesHaveOldUrls = [];
    try {
      rootParentChilds.forEach((pageId) => addOldUrlsOfChilds(pagesHaveOldUrls, pageId));
      setRedirectUrls(pagesHaveOldUrls);
    } catch (error) {
      console.error('Failed to fetch URLs:', error.message);
    }
  };

  const schema = Joi.object({
    path: Joi.string().min(1).required().trim().label('Slug').messages({
      'string.empty': 'Slug cannot be empty',
      'any.required': 'Slug is required',
    }),
    latestUrl: Joi.string().min(1).required().trim().label('Redirection URL').messages({
      'string.empty': 'Redirection URL cannot be empty',
      'any.required': 'Redirection URL is required',
    }),
  });

  const validate = (data) => {
    const options = { abortEarly: false };
    const { error } = schema.validate(data, options);
    if (!error) return null;
    const errors = {};
    for (const item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const handleAddUrl = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const path = userPathRef.current.value.trim();
    const validationErrors = validate({ path, latestUrl });
    if (validationErrors) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    if (!selectedPageId) {
      setErrors({ path: 'Please select a page to add the redirection URL' });
      setIsLoading(false);
      return;
    }
    let result;
    try {
      result = (await addUrlWithAdditionalPath(selectedPageId, params.collectionId, path)).data;
      const updatedRedirectUrls = [...redirectUrls, { pageId: result.pageId, path, pathId: result.id }];
      dispatch(addOldUrlOfPage({ pageId: result.pageId, path, pathId: result.id }));
      setRedirectUrls(updatedRedirectUrls);
      userPathRef.current.value = '';
    } catch (error) {
      console.error('Failed to create URL:', error);
      toast.error(error.response.data.msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUrl = async (indexId, pageId, pathId) => {
    deleteMappedUrl(pathId)
      .then(() => {
        dispatch(deleteOldUrlOfPage({ pageId, pathId }));
        setRedirectUrls((prev) => prev.filter((_, i) => i !== indexId));
      })
      .catch((error) => {
        console.error(error.message);
        toast.error(error.message);
      });
  };

  const setLatestUrlForPage = (id, setInUseState = true) => {
    if (setInUseState) setselectedPageId(id);
    let pathName = getUrlPathById(id, pages);
    pathName = pathName.replace('null', params.collectionId);
    if (setInUseState) setLatestUrl(pathName);
    return pathName;
  };

  const renderAllVersionOfParentPage = (versionId) => {
    const versionChilds = pages?.[versionId]?.child || [];
    return (
      <>
        {versionChilds?.length === 0 ? null : (
          <div className='mb-1'>
            <span className='version-heading text-secondary'>{pages?.[versionId]?.name}</span>
            <div className='pl-2'>{renderAllPagesOfParent(versionChilds)}</div>
          </div>
        )}
      </>
    );
  };

  const renderParentPage = (pageId) => {
    const parentPageChildIds = pages?.[pageId]?.child || [];
    return (
      <div className='mb-1'>
        <div className='page-heading-container cursor-pointer d-flex align-items-center' onClick={() => setLatestUrlForPage(pageId)}>
          <span className='mr-1 page-heading parent-page-heading text-secondary'>{pages?.[pageId]?.name}</span>
        </div>
        <div className='pl-3'>{parentPageChildIds.map((versionId) => renderAllVersionOfParentPage(versionId))}</div>
      </div>
    );
  };

  const renderSubPage = (subPageId) => {
    const subPageChildIds = pages?.[subPageId]?.child || [];
    return (
      <div className='mb-1'>
        <div className='page-heading-container cursor-pointer' onClick={() => setLatestUrlForPage(subPageId)}>
          <span className='page-heading page-heading d-flex align-items-center'>
            <span className='mr-1 page-heading page-heading text-secondary'>{pages?.[subPageId]?.name}</span>
          </span>
        </div>
        <div className='pl-2'>{renderAllPagesOfParent(subPageChildIds)}</div>
      </div>
    );
  };

  const renderEndpoint = (endpointId) => {
    const getRequestTypeIcon = () => {
      if (pages?.[endpointId]?.protocolType === 2) return <BiLogoGraphql size={12} className='graphql-icon' />;
      else {
        return (
          <div className={`${pages?.[endpointId]?.requestType}-TAB`}>
            <div className='endpoint-request-div'>{pages?.[endpointId]?.requestType}</div>
          </div>
        );
      }
    };

    return (
      <div className='mb-1 page-heading-container cursor-pointer d-flex align-items-center' onClick={() => setLatestUrlForPage(endpointId)}>
        <span className='mr-1 page-heading text-secondary'>{pages?.[endpointId]?.name}</span>
        {getRequestTypeIcon()}
      </div>
    );
  };

  const renderAllPagesOfParent = (parentChilds) => {
    return (
      <>
        {parentChilds?.map((singleId) => {
          const type = pages?.[singleId]?.type || null;
          switch (type) {
            case 1:
              return renderParentPage(singleId);
            case 3:
              return renderSubPage(singleId);
            case 4:
              return renderEndpoint(singleId);
            default:
              return null;
          }
        })}
      </>
    );
  };

  const getLatestUrl = (pageId) => {
    const path = setLatestUrlForPage(pageId, false);
    return `${visiblePath}${path}`;
  };

  const handleRedirection = (value, type) => {
    switch (type) {
      case 'slug':
        window.open(`${visiblePath}${value}?collectionId=${params.collectionId}`, '_blank');
        break;
      case 'redirection':
        window.open(value, '_blank');
        break;
      default:
        break;
    }
  };

  const renderTable = () => {
    return (
      <div className='mt-5'>
        {redirectUrls?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th className='center-heading'>Slug</th>
                <th className='center-heading'>Redirection URL</th>
                <th className='center-heading'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirectUrls.map((redirectUrlDetails, index) => {
                return (
                  <tr key={index}>
                    <td className='cursor-pointer url-path'>
                      <span title='click to open link' className='cursor-pointer url-path' onClick={(e) => handleRedirection(e.target.innerText, 'slug')}>
                        {redirectUrlDetails.path}
                      </span>
                    </td>
                    <td>
                      <span title='click to open link' className='cursor-pointer url-redirection' onClick={(e) => handleRedirection(e.target.innerText, 'redirection')}>
                        {getLatestUrl(redirectUrlDetails?.pageId)}
                      </span>
                    </td>
                    <td>
                      <IconButton onClick={() => handleDeleteUrl(index, redirectUrlDetails?.pageId, redirectUrlDetails?.pathId)}>
                        <MdDelete size={20} className=' text-danger' />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    );
  };

  return (
    <div className={`redirections p-4 h-100 flex-column align-items-start ${props?.selectedTab === 6 ? 'd-flex' : 'd-none'}`}>
      <div>
        <h3>Add Redirections</h3>
        <p className='text-secondary'>Redirection becomes useful when you need to redirect visitors from the original URL (also known as the slug) of an article to a new URL.</p>
        <p className='text-secondary'>Click on documents from left sidebar to add redirectional path to redirection URL input field.</p>
      </div>
      <div className='d-flex justify-content-start align-items-start flex-grow-1 border w-100 rounded redirections-table-container'>
        <div className='sidebar-pages-container overflow-y-auto h-100 py-4 px-2'>{renderAllPagesOfParent(childIds)}</div>
        <div className='main-container flex-grow-1 overflow-y-auto h-100 p-4'>
          <div className='form d-flex justify-content-center align-items-start gap-4'>
            <div className='d-flex justify-content-center flex-grow-1 gap-4 form-inputs'>
              <div className='d-flex flex-column flex-grow-1 gap-2'>
                <input ref={userPathRef} type='text' className=' h-100' id='part2' placeholder='Enter slug' />
                {errors.path && <small className='text-danger'>{errors.path}</small>}
                <span className='additional-info'>
                  Domain - <span className='domain-name'>{visiblePath}</span>
                </span>
              </div>
              <div className='d-flex flex-column flex-grow-1 gap-2'>
                <input size='sm' disabled type='text' className='' placeholder='Redirection URL' value={latestUrl} />
                {errors.latestUrl && <small className='text-danger'>{errors.latestUrl}</small>}
                <span className='additional-info'>Click on the documents to add the redirection URL</span>
              </div>
            </div>
            <button className='btn bg-primary text-white' onClick={handleAddUrl} disabled={isLoading}>
              {isLoading ? <Loader size='20px' color='#3498db' style={{ background: 'transparent' }} /> : 'Add'}
            </button>
          </div>
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default Protected(RedirectionsTabContent);
