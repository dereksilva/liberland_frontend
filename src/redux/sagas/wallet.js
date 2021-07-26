import { put, takeLatest, call } from 'redux-saga/effects';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { getBalanceByAddress, sendTransfer } from '../../api/nodeRpcCall';

import { walletActions } from '../actions';

function* getWalletWorker() {
  try {
    const extensions = yield web3Enable('Liberland dapp');
    if (extensions.length) {
      const [accounts] = yield web3Accounts();
      const balances = yield call(getBalanceByAddress, accounts.address);
      yield put(walletActions.getWallet.success({ ...accounts, balances }));
    } else {
      yield put(walletActions.getWallet.failure());
    }
  } catch (e) {
    yield put(walletActions.getWallet.failure(e));
  }
}

function* sendTransferWorker(action) {
  try {
    yield sendTransfer(action.payload);
    yield put(walletActions.sendTransfer.success);
    yield put(walletActions.getWallet.call);
  } catch (e) {
    yield put(walletActions.sendTransfer.failure(e));
  }
}

function* getWalletWatcher() {
  try {
    yield takeLatest(walletActions.getWallet.call, getWalletWorker);
  } catch (e) {
    yield put(walletActions.getWallet.failure(e));
  }
}

function* sendTransferWatcher() {
  try {
    yield takeLatest(walletActions.sendTransfer.call, sendTransferWorker);
  } catch (e) {
    yield put(walletActions.sendTransfer.failure(e));
  }
}

export {
  getWalletWatcher,
  sendTransferWatcher,
};
