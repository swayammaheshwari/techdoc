import httpService from '../../services/httpService';

const exportEnvironmentApi = async (environmentId, orgId) => {
  try {
    const response = await httpService.post(`${process.env.NEXT_PUBLIC_PROXY_API_URL}/orgs/${orgId}/export/environment/${environmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error calling export environment API:', error);
    throw error;
  }
};

export default exportEnvironmentApi;
