import publicStoreActionsTypes from './publicStoreActionsTypes';

export function storeCurrentPublicId(currentPublicId: string) {
  return {
    type: publicStoreActionsTypes.CURRENT_PUBLIC_ID,
    payload: {
      currentPublicId,
    },
  };
}

export function storePublicEndpointData(publicEndpointData: any) {
  return {
    type: publicStoreActionsTypes.SET_PUBLIC_ENDPOINT_DATA,
    payload: {
      publicEndpointData,
    },
  };
}
