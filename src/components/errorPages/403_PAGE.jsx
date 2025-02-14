import React from 'react';
import { useRouter } from 'next/navigation';

function ERROR_403_PAGE() {
  const router = useRouter();
  const message = this.props.location.error?.response?.data;
  return (
    <div className='text-center errorPage'>
      <h4>Access Forbidden</h4>
      {message ? <h3>{message}</h3> : <h3>You do not have access to this entity. Please ask organization admin to give access.</h3>}
      <button onClick={() => router.push('/')}>Return to Dashboard</button>
    </div>
  );
}

export default ERROR_403_PAGE;
