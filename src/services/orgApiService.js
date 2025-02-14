'use client';
import http from './httpService';
import { redirectToDashboard } from '@/components/common/utility';
import { getOrgList, getCurrentOrg, getDataFromProxyAndSetDataToLocalStorage } from '@/components/auth/authServiceV2';
import { toast } from 'react-toastify';
import { store } from '@/store/store';
import { removeOrganizationById, setCurrentorganization, setOrganizationList } from '@/components/auth/redux/organizationRedux/organizationAction';
const apiBaseUrl = process.env.NEXT_PUBLIC_PROXY_API_URL;
const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL;

export function getOrgUpdatedAt(orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`);
}

export async function fetchOrgDetail(orgId) {
  try {
    let url = `${apiBaseUrl}/proxy/getOrgDetails?orgId=${orgId}`;
    const response = await http.get(url);
    return response?.data;
  } catch (error) {
    console.error('Fetching organizations failed:', error);
  }
}

export async function fetchOrganizations() {
  try {
    const response = await http.get(`${proxyUrl}/getCompanies`);
    store.dispatch(setOrganizationList(response?.data?.data?.data));
  } catch (error) {
    console.error('Fetching organizations failed:', error);
  }
}

export async function leaveOrganization(orgId, router) {
  try {
    const response = await http.post(`${proxyUrl}/inviteAction/leave`, {
      company_id: orgId,
    });
    if (orgId == getCurrentOrg()?.id) {
      const newOrg = getOrgList()?.[0]?.id;
      switchOrg(newOrg, true, router);
    }
    if (response.status === 200) {
      store.dispatch(removeOrganizationById(orgId));
      toast.success('Organization removed successfully!');
    }
  } catch (error) {
    console.error('Leaving organization failed:', error);
    toast.error('Error in leaving organization');
  }
}

export function updateOrgDataByOrgId(OrgId) {
  const data = getOrgList();
  let currentOrganisation;
  const targetIndex = data.findIndex((obj) => obj.id === OrgId);
  currentOrganisation = data[targetIndex];
  store.dispatch(setCurrentorganization(currentOrganisation));
}

export async function switchOrg(orgId) {
  try {
    const data = await http.post(proxyUrl + '/switchCompany', {
      company_ref_id: orgId,
    });
    updateOrgDataByOrgId(data?.data?.data?.company_ref_id);
  } catch (error) {
    console.error('Error while calling switchCompany API:', error);
  }
}

async function createOrganizationAndRunCode() {
  toast.success('Organization Successfully Created');
}

export async function createOrg(name, type) {
  const data = { company: { name, meta: { type } } };
  try {
    const newOrg = await http.post(proxyUrl + '/createCompany', data);
    await getDataFromProxyAndSetDataToLocalStorage(null, false);
    updateOrgDataByOrgId(newOrg?.data?.data?.id);
    await http.post(proxyUrl + '/switchCompany', {
      company_ref_id: newOrg?.data?.data?.id,
    });
  } catch (e) {
    toast.error(e?.response?.data?.message ? e?.response?.data?.message : 'Something went wrong');
    throw e;
  }
}

export async function updateOrg(name, type, router) {
  try {
    const data = { company: { name, meta: { type } } };
    const updateOrg = await http.post(proxyUrl + '/{featureId}/updateDetails', data);
    await getDataFromProxyAndSetDataToLocalStorage(null, false);
    updateOrgDataByOrgId(updateOrg?.data?.data?.id);
    toast.success('Organization Successfully Created');
    await switchOrg(updateOrg?.data?.data?.id);
    redirectToDashboard(updateOrg?.data?.data?.id, router);
  } catch (e) {
    toast.error(e?.response?.data?.message ? e?.response?.data?.message : 'Something went wrong');
  }
}

export async function inviteMembers(name, email) {
  try {
    const data = {
      user: {
        name: name,
        email: email,
      },
    };
    const res = await http.post(proxyUrl + '/addUser', data);
    toast.success('User added successfully');
    return res;
  } catch (e) {
    console.error(e);
    toast.error('Cannot proceed at the moment. Please try again later');
  }
}

export async function removeUser(userId) {
  const id = getCurrentOrg()?.id;
  try {
    const data = {
      userId,
      company_id: id,
    };
    const result = await http.post(`${apiBaseUrl}/proxy/removeUser`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return result;
  } catch (e) {
    console.error(e);
    toast.error('Cannot proceed at the moment. Please try again later');
  }
}
