'use client';
import React, { useEffect } from 'react';
import httpService from '@/services/httpService';
import { store } from '@/store/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateMode } from '../../../../store/clientData/clientDataActions';
import { toast } from 'react-toastify';
import { deleteCookie, redirectToDashboard } from '../../../../components/common/utility';

const profileKey = 'profile';
const apiURL = process.env.NEXT_PUBLIC_PROXY_API_URL;

async function getDataFromBackendAndSetDataToLocalStorage(authToken, router) {
  try {
    const response = await httpService.get(`${apiURL}/p/get-sso-token?auth_token=${encodeURIComponent(authToken)}`);
    return response;
  } catch (e) {
    if (e?.response?.status === 301) {
      const { data } = e.response;
      const sessionTokenKey = 'sessionToken';
      sessionStorage.setItem(sessionTokenKey, data.token);
      store.dispatch(updateMode({ mode: true }));
      localStorage.setItem(profileKey, JSON.stringify(data.user));
      redirectToDashboard(data?.company?.id, router);
      return;
    } else {
      console.error('Error:', e);
      throw e;
    }
  }
}

function SSOService() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        localStorage.clear();
        deleteCookie('redirectionUrl');
        const authToken = searchParams.get('auth_token');
        if (authToken) {
          await getDataFromBackendAndSetDataToLocalStorage(authToken, router);
        } else {
          toast.error('server error!');
          router.push('/');
        }
      } catch (err) {
        localStorage.clear();
        router.push('/');
      }
    };

    fetchData();
  }, [router, searchParams]);

  return (
    <div className='custom-loading-container'>
      <progress className='pure-material-progress-linear w-25' />
    </div>
  );
}

export default SSOService;
