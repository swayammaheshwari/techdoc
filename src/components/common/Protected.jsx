'use-client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { getCurrentOrg, getProxyToken, getUserData } from '../auth/authServiceV2';
import { redirectToDashboard, removeFromLocalStorage } from './utility';
import { fetchOrgDetail, switchOrg } from '@/services/orgApiService';
import { closeAllTabs } from '../tabs/redux/tabsActions';
import { onHistoryRemoved } from '../history/redux/historyAction';
import { getCollectionsAndPages, requestAccessOrg } from '@/services/generalApiService';
import { setCookie } from '../../components/common/utility';
import RequestAccessModal from '../../components/common/requestAccessModal';
import InvalidOrgModal from '../../components/common/invalidOrgModal';
import { addUserData, setCurrentUser } from '../auth/redux/usersRedux/userAction';
import { updateMode } from '@/store/clientData/clientDataActions';
import { setCurrentorganization, setOrganizationList } from '../auth/redux/organizationRedux/organizationAction';
import generalActionsTypes from '../redux/generalActionTypes';
import jwt from 'jsonwebtoken';

const Protected = (WrappedComponent) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [invalidOrg, setInvalidOrg] = useState(false);
    const [sso, setSSO] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [ssoName, setSSOName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const dispatch = useDispatch();

    const tabs = useSelector((state) => state?.tabs);
    const historySnapshot = useSelector((state) => state.history);

    const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL;

    useEffect(() => {
      if (typeof window !== 'undefined' && !localStorage.getItem('token') && !sessionStorage.getItem('sessionToken')) {
        const url = new URL(window.location.href);
        const queryParams = url.search;
        setCookie('redirectionUrl', pathname + queryParams, 2);
        router.replace('/login');
      } else {
        getUserDataFromToken();
      }
    }, []);

    const getUserDataFromToken = async () => {
      const checkSessionToken = sessionStorage.getItem('sessionToken');
      if (checkSessionToken) dispatch(updateMode({ mode: true }));
      else dispatch(updateMode({ mode: false }));
      const token = getProxyToken();
      const users = await getUserData(token);
      if (users) dispatch(addUserData(users));
      const response = await fetch(`${proxyUrl}/getDetails`, {
        headers: { proxy_auth_token: token },
      });
      const data = await response.json();
      const userInfo = data.data[0];
      if (process.env.NEXT_PUBLIC_ENV === 'local') {
        const userData = users[0];
        let techdocToken = jwt.sign({ user: userData }, process.env.NEXT_PUBLIC_API_SECRET_KEY, { expiresIn: '48h' });
        localStorage.setItem('techdoc_auth', techdocToken);
      }
      dispatch(setCurrentUser(userInfo));
      dispatch(setOrganizationList(userInfo.c_companies));
      dispatch(setCurrentorganization(userInfo.currentCompany));
      checkCurrentOrg(userInfo);
    };

    const checkCurrentOrg = async (users) => {
      if (window?.location?.pathname?.includes('/onBoarding')) return setLoading(false);
      const currentOrgId = getCurrentOrg()?.id;
      const requestedOrgId = Number(params?.orgId);
      const organizationDetails = await fetchOrgDetail(requestedOrgId);
      if (organizationDetails?.length === 0) {
        setLoading(false);
        setInvalidOrg(true);
        return;
      }
      const orgData = organizationDetails?.[0];
      const userBelongsToSsoOrg = users.c_companies.some((company) => company.id == requestedOrgId);
      if (orgData?.is_readable && !userBelongsToSsoOrg) {
        setSSO(true);
        setSSOName(orgData?.meta?.companyName);
        setLoading(false);
        return;
      }
      setOrgName(orgData?.name);
      setAdminEmail(orgData?.email);
      const usersList = users?.c_companies;
      const email = users?.email;
      setUserEmail(email);

      const { pages, collections } = await pagesAndCollectionData(requestedOrgId);
      dispatch({
        type: generalActionsTypes.ADD_COLLECTIONS,
        data: collections,
      });
      dispatch({ type: generalActionsTypes.ADD_PAGES, data: pages });

      const userBelongsToOrg = usersList.some((user) => user.id == requestedOrgId);
      if (!userBelongsToOrg) {
        setShowModal(true);
        setLoading(false);
        return;
      }

      if (requestedOrgId != currentOrgId) {
        const tabsToClose = tabs.tabsOrder;
        removeFromLocalStorage(tabsToClose);
        dispatch(closeAllTabs(tabsToClose));
        dispatch(onHistoryRemoved(historySnapshot));
        await switchOrg(requestedOrgId);
      }
      correctURL(pages, collections);
    };

    const pagesAndCollectionData = async (orgId) => {
      try {
        const response = await getCollectionsAndPages(orgId, '', false);
        const pages = response.data.pages;
        const collections = response.data.collections;
        return { pages, collections };
      } catch (err) {
        throw err;
      }
    };

    const correctURL = (pages, collections) => {
      let browserURL = '';
      if (typeof window !== 'undefined') browserURL = window.location.href;
      const url = new URL(browserURL);
      const queryParams = url.search;
      const pathSegments = url.pathname.split('/').filter(Boolean);
      let contentType = '';
      let contentId = '';

      pathSegments.forEach((segment, index) => {
        if (['page', 'collection', 'endpoint', 'history', 'invite', 'trash', 'onBoarding'].includes(segment)) {
          contentType = segment;
          contentId = pathSegments[index + 1];
        }
      });

      let isValidPage = false;
      let isValidCollection = false;
      let isValidHistory = false;

      switch (contentType) {
        case 'page':
        case 'endpoint':
          Object.values(pages).forEach((page) => {
            if (page.id === contentId) {
              contentType = page.type === 4 ? 'endpoint' : 'page';
              isValidPage = true;
            }
          });
          break;
        case 'history':
          Object.values(historySnapshot).forEach((history) => {
            if (history.id === contentId) {
              isValidHistory = true;
            }
          });
          break;
        case 'collection':
          Object.values(collections).forEach((collection) => {
            if (collection.id === contentId) {
              isValidCollection = true;
            }
          });
          break;
        default:
          break;
      }

      pathSegments.forEach((segment, index) => {
        if (segment === contentId) {
          pathSegments[index - 1] = contentType;
        }
      });

      const newUrl = '/' + pathSegments.join('/') + queryParams;

      if (isValidPage || isValidCollection || isValidHistory || ['invite', 'trash', 'onBoarding'].includes(contentType)) {
        router.push(newUrl);
        setLoading(false);
      } else {
        redirectToDashboard(params?.orgId, router);
        setLoading(false);
      }
    };

    const handleRequestAccess = async () => {
      const orgId = params?.orgId;
      const env = process.env.NEXT_PUBLIC_ENV;
      try {
        await requestAccessOrg(orgId, orgName, adminEmail, userEmail, env);
        router.push('/login');
      } catch (error) {
        throw new Error('Something wrong with handleRequestAccess');
      }
    };

    const handleCancel = () => {
      router.push('/login');
    };

    return (
      <React.Fragment>
        {loading ? (
          <div className='custom-loading-container'>
            <progress className='pure-material-progress-linear w-25' />
          </div>
        ) : (
          <React.Fragment>
            {invalidOrg || sso ? <InvalidOrgModal invalidOrg={invalidOrg} sso={sso} ssoName={ssoName} /> : <RequestAccessModal showModal={showModal} handleCancel={handleCancel} handleRequestAccess={handleRequestAccess} />}
            <WrappedComponent {...props} />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };
};

export default Protected;
