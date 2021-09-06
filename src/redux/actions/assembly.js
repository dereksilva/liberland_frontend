import { createActions } from 'redux-actions';

export const {
  addMyDraft,
  getMyProposals,
  editDraft,
  deleteProposal,
} = createActions({
  ADD_MY_DRAFT: {
    call: undefined,
    success: undefined,
    failure: undefined,
  },
  GET_MY_PROPOSALS: {
    call: undefined,
    success: undefined,
    failure: undefined,
  },
  EDIT_DRAFT: {
    call: (proposalData) => ({ data: proposalData }),
    success: undefined,
    failure: undefined,
  },
  DELETE_PROPOSAL: {
    call: (id) => ({ id }),
    success: undefined,
    failure: undefined,
  },
});
