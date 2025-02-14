'use client';
import React, { useEffect } from 'react';
import { getCurrentOrg, getProxyToken } from '@/components/auth/authServiceV2';
import { useRouter } from 'next/navigation';
import { redirectToDashboard } from '@/components/common/utility';
import Image from 'next/image';
import './auth.scss';
import './login.scss';
import '../../../components/indexWebsite/indexWebsite.scss';
// import 'bootstrap/dist/css/bootstrap.css';

const proxyGooglereferenceMapping = {
  local: process.env.NEXT_PUBLIC_PROXY_REFERENCE_ID_LOCAL,
  test: process.env.NEXT_PUBLIC_PROXY_REFERENCE_ID_TEST,
  prod: process.env.NEXT_PUBLIC_PROXY_REFERENCE_ID_PROD,
};

const env = process.env.NEXT_PUBLIC_ENV || '';
const divId = proxyGooglereferenceMapping[env];

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    let script;

    const checkIfUserAlreadyLogin = () => {
      if (getProxyToken()) {
        const orgId = getCurrentOrg()?.id;
        router.push(`/orgs/${orgId}/dashboard`);
      } else {
        localStorage.clear();
        loadScript();
      }
    };

    const loadScript = () => {
      const configuration = {
        referenceId: proxyGooglereferenceMapping[process.env.NEXT_PUBLIC_ENV],
        success: (data) => {
          console.dir('success response', data);
        },
        failure: (error) => {
          console.error('failure reason', error);
        },
      };
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js?time=34093049';
      script.async = true;
      script.onload = () => {
        if (initVerification) {
          initVerification(configuration);
        }
      };
      document.body.appendChild(script);
    };

    checkIfUserAlreadyLogin();

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [router, proxyGooglereferenceMapping]);

  return (
    <div className='d-flex align-items-center w-100 login-parent'>
      <div className='login-section d-flex align-items-center justify-content-center flex-grow-1'>
        <div className='welcome-heading d-flex flex-column align-items-center justify-content-center'>
          <h2>Welcome to</h2>
          <h1>Techdoc</h1>
          <div id={divId}></div>
        </div>
      </div>
      <img className='feature-image pr-5' src='/feature-image.png' alt='features' width='60%' height='auto' />
    </div>
  );
};

export default LoginPage;
