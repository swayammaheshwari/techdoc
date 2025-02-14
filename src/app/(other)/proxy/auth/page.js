'use client';
import React, { useEffect } from 'react';
import { switchOrg } from '@/services/orgApiService';
import { useRouter, useSearchParams } from 'next/navigation';
import { redirectToDashboard } from '@/components/common/utility';

const tokenKey = 'token';
const profileKey = 'profile';
const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL;

async function getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken, router) {
  localStorage.setItem(tokenKey, proxyAuthToken);
  try {
    const response = await fetch(`${proxyUrl}/getDetails`, {
      headers: { proxy_auth_token: proxyAuthToken },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const userInfo = data.data[0];
    localStorage.setItem(profileKey, JSON.stringify(userInfo));
    const currentOrgId = userInfo.currentCompany?.id;
    if (currentOrgId) await switchOrg(currentOrgId);
    redirectToDashboard(currentOrgId, router, true);
  } catch (e) {
    console.error('Error:', e);
  }
}

function AuthServiceV2() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const proxyAuthToken = searchParams.get('proxy_auth_token');
        if (proxyAuthToken) {
          await getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken, router);
        }
      } catch (err) {
        router.push('/logout');
      }
    };
    fetchData();
  }, [router]);

  return (
    <div className='custom-loading-container'>
      <progress className='pure-material-progress-linear w-25' />
    </div>
  );
}

export default AuthServiceV2;
