import publicStoreActionsTypes from './publicStoreActionsTypes';

type stateType = {
  currentPublicId: string;
  publicEndpointData: any;
};

type actionType = {
  type: string;
  payload: any;
};

const initialState: stateType = {
  currentPublicId: '',
  publicEndpointData: {},
};

export default function publicStoreReducer(state: stateType = initialState, action: actionType) {
  switch (action.type) {
    case publicStoreActionsTypes.CURRENT_PUBLIC_ID:
      return { ...state, currentPublicId: action.payload.currentPublicId };
    case publicStoreActionsTypes.SET_PUBLIC_ENDPOINT_DATA:
      return { ...state, publicEndpointData: { ...action.payload.publicEndpointData } };
    default:
      return state;
  }
}
