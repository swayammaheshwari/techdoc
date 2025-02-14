import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { updateCollection } from '../../redux/collectionsActions';
import { toast } from 'react-toastify';
import './domainTabContent.scss';

export default function DomainTabContent(props) {
  const collections = useSelector((state) => state.collections);

  const params = useParams();

  const dispatch = useDispatch();

  const domainInputRef = useRef();
  const pathInputRef = useRef();

  const [errorForPathAndDomain, setErrorForPathAndDomain] = useState({ domainError: false, pathError: false, subDomainWithPathError: false });

  useEffect(() => {
    if (!domainInputRef.current || !pathInputRef.current) return;
    const collectionData = collections[params?.collectionId];
    domainInputRef.current.value = collectionData?.customDomain || '';
    pathInputRef.current.value = collectionData?.path ? '/' + collectionData.path : '';
    setErrorForPathAndDomain({ domainName: false, pathError: false, subDomainWithPathError: false });
  }, [params?.collectionId]);

  function isValidDomain(domain) {
    const domainRegex = /^(?:[a-zA-Z0-9-]+\.)*[a-zA-Z]{2,}$|^$/;
    return domainRegex.test(domain);
  }

  function isValidPath(path) {
    const pathRegex = /^(\/[a-zA-Z0-9-_]+)?$/;
    return pathRegex.test(path);
  }

  function isSubdomain(domain) {
    const parts = domain.split('.');
    return parts.length > 2;
  }

  const handleSave = () => {
    const collectionData = collections[params?.collectionId];
    const domainName = domainInputRef.current.value;
    const path = pathInputRef.current.value;
    const errorData = {};
    if (!isValidDomain(domainName)) errorData.domainError = true;
    else errorData.domainError = false;
    if (!isValidPath(path)) errorData.pathError = true;
    else errorData.pathError = false;
    setErrorForPathAndDomain(errorData);
    if (errorData.domainError || errorData.pathError) return;
    if (path && !domainName) {
      errorData.domainError = true;
      setErrorForPathAndDomain(errorData);
      return;
    }
    if (path && isSubdomain(domainName)) {
      errorData.subDomainWithPathError = true;
      setErrorForPathAndDomain(errorData);
      return;
    }
    collectionData.path = pathInputRef.current.value.substring(1);
    collectionData.customDomain = domainInputRef.current.value;
    dispatch(updateCollection(collectionData, () => toast.success('Domain Configured!')));
  };

  return (
    <div className={`p-4 ${props?.selectedTab === 3 ? '' : 'd-none'}`}>
      <h3>Configure Domain</h3>
      <p className='text-secondary'>Whitelist your website using custom domain.</p>
      <h5 className='mt-4'>Domain Name</h5>
      <p className='text-secondary'>Enter your domain like: msg91.com, api.viasocket.com. Do not write msg91.com/api</p>
      <input ref={domainInputRef} placeholder='Enter Domain' className='d-flex align-items-center title-tab-input border p-2 rounded' />
      {errorForPathAndDomain.domainError && <span className='text-danger error-text'>Domain is invalid, please enter valid domain</span>}
      <h5 className='mt-4'>Path</h5>
      <p className='text-secondary'>Enter path like: /api, /help, /faq. Do not write giddh.com/api, /api/help</p>
      <input ref={pathInputRef} placeholder='Enter Path' className='d-flex align-items-center title-tab-input border p-2 rounded' />
      {errorForPathAndDomain.pathError && <span className='text-danger error-text'>Path is invalid, please enter valid path</span>}
      <br />
      <button onClick={handleSave} className='my-2 btn bg-primary text-white'>
        Save & Publish
      </button>
      <p className='text-secondary mt-4'>Note: You cannot configure path without domain.</p>
      <p className={errorForPathAndDomain.subDomainWithPathError ? 'text-danger' : 'text-secondary'}>Note: You cannot use both subdomain and path at the same time like: api.viasocket.com (domain) + /doc (path)</p>
      <p className='text-secondary'>
        To learn about how to white label a domain please visit this{' '}
        <a href='https://techdoc.walkover.in/p/White-Labelling?collectionId=2Uv_sfKTLPI3' target='_blank'>
          Help Doc
        </a>
        .
      </p>
    </div>
  );
}
