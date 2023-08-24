import { createSelector } from 'reselect';

const validatorReducer = (state) => state.validator;

export const isLoading = createSelector(
  validatorReducer,
  (reducer) => reducer.loading,
);

export const pendingRewards = createSelector(
  validatorReducer,
  (reducer) => reducer.pendingRewards,
);

export const info = createSelector(
  validatorReducer,
  (reducer) => reducer.info,
);