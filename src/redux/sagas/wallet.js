import { put, takeLatest, call } from 'redux-saga/effects';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { getBalanceByAddress } from '../../api/nodeRpcCall';

import { walletActions } from '../actions';

function* getWalletWorker() {
  try {
    const extensions = yield web3Enable('Liberland dapp');
    if (extensions.length) {
      const [accounts] = yield web3Accounts();
      const balance = yield call(getBalanceByAddress, accounts.address);
      yield put(walletActions.getWallet.success({ ...accounts, balance }));
    } else {
      yield put(walletActions.getWallet.failure());
    }
  } catch (e) {
    yield put(walletActions.getWallet.failure(e));
  }
}

function* getWalletWatcher() {
  try {
    yield takeLatest(walletActions.getWallet.call, getWalletWorker);
  } catch (e) {
    yield put(walletActions.getWallet.field(e));
  }
}

export {
  getWalletWatcher,
};