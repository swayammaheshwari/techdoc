import http from './httpService';
import axios from 'axios';
import { toast } from 'react-toastify';

const publicUrl = process.env.NEXT_PUBLIC_API_URL;
const proxyUrl = process.env.NEXT_PUBLIC_PROXY_API_URL;

export async function requestAccessOrg(orgId, orgName, adminEmail, userEmail, env) {
  try {
    const response = await axios.post('https://flow.sokt.io/func/scriH8nA4UDG', {
      orgId,
      orgName,
      adminEmail,
      userEmail,
      env,
    });
    return response.data;
  } catch (error) {
    toast.error('Error requesting access to organization:');
    throw error;
  }
}

export async function getCollectionsAndPages(orgId, queryParamsString = '', isPublished) {
  if (isPublished) {
    return http.get(publicUrl + `/p/getSideBarData${queryParamsString}`);
  }
  return http.get(proxyUrl + `/orgs/${orgId}/getSideBarData${queryParamsString}`);
}

export async function moveCollectionsAndPages(moveToOrgId, collection, flag = true) {
  const { id, orgId, name } = collection;
  return http.put(proxyUrl + `/orgs/${orgId}/collections/${id}`, {
    orgId: moveToOrgId,
    name,
    collectionMoved: true,
  });
}

export function getPublishedContentByPath(queryParamsString = '') {
  return http.get(publicUrl + `/p/getPublishedDataByPath${queryParamsString}`);
}

export async function getPublishedContentByIdAndType(id, type) {
  let data = await http.get(publicUrl + `/p/pages/${id}/getPublishedData?type=${type}`);
  return type == 4 || type == 5 ? data?.data?.publishedContent || '' : data?.data?.publishedContent?.contents || '';
}

export async function runAutomation(details) {
  let data = await http.post(proxyUrl + `/run/automation`, details);
  return data;
}

export async function generateDescription(endpointIds) {
  let data = await http.post(proxyUrl + '/generate-description', { endpointIds });
  return data;
}

export default {
  getCollectionsAndPages,
  getPublishedContentByPath,
  getPublishedContentByIdAndType,
  moveCollectionsAndPages,
  runAutomation,
  generateDescription,
};
