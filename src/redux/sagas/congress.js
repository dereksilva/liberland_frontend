import {
  put, takeLatest, call, cps, select,
} from 'redux-saga/effects';
import { congressActions, blockchainActions } from '../actions';
import { blockchainSelectors } from '../selectors';
import {
  applyForCongress,
  congressProposeLegislation,
  congressRepealLegislation,
  congressSendLlm,
  congressSendLlmToPolitipool,
  getCongressCandidates,
  getCongressMembers,
  getMotions,
  getRunnersUp,
  renounceCandidacy,
  voteAtMotions,
} from '../../api/nodeRpcCall';

// WORKERS

function* applyForCongressWorker() {
  const walletAddress = yield select(
    blockchainSelectors.userWalletAddressSelector,
  );

  const { errorData } = yield cps(applyForCongress, walletAddress);
  if (errorData.isError) {
    yield put(
      blockchainActions.setErrorExistsAndUnacknowledgedByUser.success(true),
    );
    yield put(blockchainActions.setError.success(errorData));
    yield put(congressActions.applyForCongress.failure(errorData));
  } else {
    yield put(congressActions.getCandidates.call());
    yield put(congressActions.applyForCongress.success());
  }
}

function* getCandidatesWorker() {
  const candidates = yield call(getCongressCandidates);
  yield put(congressActions.getCandidates.success(candidates));
}

function* getMotionsWorker() {
  const motions = yield call(getMotions);
  yield put(congressActions.getMotions.success(motions));
}

function* voteAtMotionsWorker(action) {
  const { readableProposal, index, vote } = action.payload;
  const walletAddress = yield select(
    blockchainSelectors.userWalletAddressSelector,
  );

  const { errorData } = yield cps(
    voteAtMotions,
    walletAddress,
    readableProposal,
    index,
    vote,
  );
  if (errorData.isError) {
    yield put(
      blockchainActions.setErrorExistsAndUnacknowledgedByUser.success(true),
    );
    yield put(blockchainActions.setError.success(errorData));
    yield put(congressActions.voteAtMotions.failure(errorData));
  } else {
    yield put(congressActions.getMotions.call());
    yield put(congressActions.voteAtMotions.success());
  }
}

function* congressSendLlmWorker({
  payload: {
    transferToAddress, transferAmount,
  },
}) {
  const walletAddress = yield select(
    blockchainSelectors.userWalletAddressSelector,
  );
  const { errorData } = yield cps(congressSendLlm, {
    walletAddress, transferToAddress, transferAmount,
  });
  if (errorData.isError) {
    yield put(
      blockchainActions.setErrorExistsAndUnacknowledgedByUser.success(true),
    );
    yield put(blockchainActions.setError.success(errorData));
    yield put(congressActions.congressSendLlm.failure(errorData));
  } else {
    yield put(congressActions.congressSendLlm.success());
  }
}

function* congressSendLlmToPolitipoolWorker({
  payload: {
    transferToAddress, transferAmount,
  },
}) {
  const walletAddress = yield select(
    blockchainSelectors.userWalletAddressSelector,
  );
  const { errorData } = yield cps(congressSendLlmToPolitipool, {
    walletAddress, transferToAddress, transferAmount,
  });
  if (errorData.isError) {
    yield put(
      blockchainActions.setErrorExistsAndUnacknowledgedByUser.success(true),
    );
    yield put(blockchainActions.setError.success(errorData));
    yield put(congressActions.congressSendLlmToPolitipool.failure(errorData));
  } else {
    yield put(congressActions.congressSendLlmToPolitipool.success());
  }
}

function* getMembersWorker() {
  const members = yield call(getCongressMembers);
  yield put(congressActions.getMembers.success(members));
}

function* getRunnersUpWorker() {
  const runnersUp = yield call(getRunnersUp);
  yield put(congressActions.getRunnersUp.success(runnersUp));
}

function* renounceCandidacyWorker(action) {
  const walletAddress = yield select(
    blockchainSelectors.userWalletAddressSelector,
  );

  const { errorData } = yield cps(
    renounceCandidacy,
    walletAddress,
    action.payload,
  );
  if (errorData.isError) {
    yield put(
      blockchainActions.setErrorExistsAndUnacknowledgedByUser.success(true),
    );
    yield put(blockchainActions.setError.success(errorData));
    yield put(congressActions.renounceCandidacy.failure(errorData));
  } else {
    yield put(congressActions.getMembers.call());
    yield put(congressActions.getCandidates.call());
    yield put(congressActions.renounceCandidacy.success());
  }
}

function* congressProposeLegislationWorker({ payload: { index, legislationContent } }) {
  const walletAddress = yield select(
    blockchainSelectors.userWalletAddressSelector,
  );

  const tier = 1; // International Treaty
  const { errorData } = yield cps(congressProposeLegislation, tier, index, legislationContent, walletAddress);
  if (errorData.isError) {
    yield put(
      blockchainActions.setErrorExistsAndUnacknowledgedByUser.success(true),
    );
    yield put(blockchainActions.setError.success(errorData));
    yield put(congressActions.congressProposeLegislation.failure(errorData));
  } else {
    yield put(congressActions.congressProposeLegislation.success());
    yield put(congressActions.getMotions.call());
  }
}

function* congressRepealLegislationWorker({ payload: { tier, index } }) {
  const walletAddress = yield select(
    blockchainSelectors.userWalletAddressSelector,
  );

  const { errorData } = yield cps(congressRepealLegislation, tier, index, walletAddress);
  if (errorData.isError) {
    yield put(
      blockchainActions.setErrorExistsAndUnacknowledgedByUser.success(true),
    );
    yield put(blockchainActions.setError.success(errorData));
    yield put(congressActions.congressRepealLegislation.failure(errorData));
  } else {
    yield put(congressActions.congressRepealLegislation.success());
    yield put(congressActions.getMotions.call());
  }
}

// WATCHERS

export function* applyForCongressWatcher() {
  try {
    yield takeLatest(
      congressActions.applyForCongress.call,
      applyForCongressWorker,
    );
  } catch (e) {
    yield put(congressActions.applyForCongress.failure(e));
  }
}

export function* getCandidatesWatcher() {
  try {
    yield takeLatest(
      congressActions.getCandidates.call,
      getCandidatesWorker,
    );
  } catch (e) {
    yield put(congressActions.getCandidates.failure(e));
  }
}

export function* getMotionsWatcher() {
  try {
    yield takeLatest(congressActions.getMotions.call, getMotionsWorker);
  } catch (e) {
    yield put(congressActions.getMotions.failure(e));
  }
}

export function* voteAtMotionsWatcher() {
  try {
    yield takeLatest(congressActions.voteAtMotions.call, voteAtMotionsWorker);
  } catch (e) {
    yield put(congressActions.voteAtMotions.failure(e));
  }
}

export function* congressSendLlmWatcher() {
  try {
    yield takeLatest(
      congressActions.congressSendLlm.call,
      congressSendLlmWorker,
    );
  } catch (e) {
    yield put(congressActions.congressSendLlm.failure(e));
  }
}

export function* congressSendLlmToPolitipoolWatcher() {
  try {
    yield takeLatest(
      congressActions.congressSendLlmToPolitipool.call,
      congressSendLlmToPolitipoolWorker,
    );
  } catch (e) {
    yield put(congressActions.congressSendLlmToPolitipool.failure(e));
  }
}

export function* getMembersWatcher() {
  try {
    yield takeLatest(
      congressActions.getMembers.call,
      getMembersWorker,
    );
  } catch (e) {
    yield put(congressActions.getMembers.failure(e));
  }
}

export function* renounceCandidacyWatcher() {
  try {
    yield takeLatest(
      congressActions.renounceCandidacy.call,
      renounceCandidacyWorker,
    );
  } catch (e) {
    yield put(congressActions.renounceCandidacy.failure(e));
  }
}

export function* getRunnersUpWatcher() {
  try {
    yield takeLatest(congressActions.getRunnersUp.call, getRunnersUpWorker);
  } catch (e) {
    yield put(congressActions.getRunnersUp.failure(e));
  }
}
export function* congressProposeLegislationWatcher() {
  try {
    yield takeLatest(
      congressActions.congressProposeLegislation.call,
      congressProposeLegislationWorker,
    );
  } catch (e) {
    yield put(congressActions.congressProposeLegislation.failure(e));
  }
}

export function* congressRepealLegislationWatcher() {
  try {
    yield takeLatest(
      congressActions.congressRepealLegislation.call,
      congressRepealLegislationWorker,
    );
  } catch (e) {
    yield put(congressActions.congressRepealLegislation.failure(e));
  }
}
