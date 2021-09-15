import { web3Accounts, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';
import prettyNumber from '../utils/prettyNumber';
import matchPowHelper from '../utils/matchPowHelper';
import truncate from '../utils/truncate';

import citizenAddressList from '../constants/citizenAdressList';

const { ApiPromise, WsProvider } = require('@polkadot/api');

const provider = new WsProvider(process.env.REACT_APP_NODE_ADDRESS);

// TODO: Need refactor when blockchain node update
const getBalanceByAddress = async (address) => {
  try {
    const api = await ApiPromise.create({ provider });
    const {
      data: { free: previousFree },
    } = await api.query.system.account(address);
    const api2 = await ApiPromise.create({
      provider,
      types: {
        StakingLedger: {
          stash: 'AccountId',
          total: 'Compact<Balance>',
          active: 'Compact<Balance>',
          unlocking: 'Vec<UnlockChunk>',
          claimedRewards: 'Vec<EraIndex>',
          polkaAmount: 'Compact<Balance>',
          liberAmount: 'Compact<Balance>',
        },
      },
    });
    const ledger = await api2.query.stakingPallet.ledger(address);
    let polkaAmount = 0;
    let liberAmount = 0;
    let totalAmount = 0;
    if (ledger.toString() !== '') {
      const ledgerObj = JSON.parse(ledger.toString());
      polkaAmount = ledgerObj.polkaAmount;
      liberAmount = ledgerObj.liberAmount;
      totalAmount = ledgerObj.total;
    }
    return ({
      liberstake: {
        amount: liberAmount,
      },
      polkastake: {
        amount: polkaAmount,
      },
      liquidMerits: {
        amount: parseInt(previousFree.toString(), 10) - totalAmount,
      },
      totalAmount: {
        amount: parseInt(previousFree.toString(), 10),
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return {};
  }
};

const sendTransfer = async (payload) => {
  const { account_to, amount } = payload;
  const api = await ApiPromise.create({ provider });
  const allAccounts = await web3Accounts();
  const account = allAccounts[0];

  const transferExtrinsic = api.tx.balances.transfer(account_to, (amount * (10 ** 12)));
  const injector = await web3FromSource(account.meta.source);
  transferExtrinsic.signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
    if (status.isInBlock) {
      // eslint-disable-next-line no-console
      console.log(`Completed at block hash #${status.asInBlock.toString()}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Current status: ${status.type}`);
    }
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.log(':( transaction failed', error);
  });
};

const stakeToPolkaBondAndExtra = async (payload, callback) => {
  try {
    const { values: { amount }, isUserHaveStake } = payload;
    const api = await ApiPromise.create({ provider });
    const allAccounts = await web3Accounts();
    const account = allAccounts[0];

    const transferExtrinsic = isUserHaveStake
      ? await api.tx.stakingPallet.bondExtra(amount * (10 ** 12))
      : await api.tx.stakingPallet.bond(account.address, (amount * (10 ** 12)), 'Staked');

    const injector = await web3FromSource(account.meta.source);
    // eslint-disable-next-line max-len
    await transferExtrinsic.signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
      if (status.isFinalized) {
        // eslint-disable-next-line no-console
        console.log(`isFinalized at block hash #${status.asFinalized.toString()}`);
        callback(null, 'done');
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(':( transaction failed', error);
      callback(error);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    callback(e);
  }
};

const stakeToLiberlandBondAndExtra = async (payload, callback) => {
  try {
    const { values: { amount }, isUserHaveStake } = payload;
    const api = await ApiPromise.create({ provider });
    const allAccounts = await web3Accounts();
    const account = allAccounts[0];

    const transferExtrinsic = isUserHaveStake
      ? await api.tx.stakingPallet.liberlandBondExtra(amount * (10 ** 12))
      : await api.tx.stakingPallet.liberlandBond(account.address, (amount * (10 ** 12)), 'Staked');

    const injector = await web3FromSource(account.meta.source);
    // eslint-disable-next-line max-len
    await transferExtrinsic.signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
      if (status.isFinalized) {
        // eslint-disable-next-line no-console
        console.log(`Finalized at block hash #${status.asFinalized.toString()}`);
        callback(null, 'done');
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.log(':( transaction failed', error);
      callback(error);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    callback(e);
  }
};

const applyMyCandidacy = async (callback) => {
  const allAccounts = await web3Accounts();
  const accountAddress = allAccounts[0].address;

  const api = await ApiPromise.create({ provider });
  if (accountAddress) {
    const injector = await web3FromAddress(accountAddress);
    await api.tx.assemblyPallet
      .addCandidate()
      .signAndSend(accountAddress, { signer: injector.signer }, ({ status }) => {
        if (status.isFinalized) {
          // eslint-disable-next-line no-console
          console.log(`Finalized at block hash #${status.asFinalized.toString()}`);
          callback(null, 'done');
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.log(':( transaction failed', error);
        callback(error);
      });
  }
};

const getCandidacyListRpc = async () => {
  try {
    const api = await ApiPromise.create({
      provider,
      types: {
        Candidate: {
          pasportId: 'Vec<u8>',
        },
      },
    });
    const candidatesList = await api.query.assemblyPallet.candidatesList();
    // eslint-disable-next-line no-console
    // console.log('candidatesList', JSON.parse(candidatesList.toString()));
    return JSON.parse(candidatesList.toString());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

const sendElectoralSheetRpc = async (electoralSheet, callback) => {
  const allAccounts = await web3Accounts();
  const accountAddress = allAccounts[0].address;
  const dataForNode = await electoralSheet.map((el) => ({ pasportId: el.id }));
  const api = await ApiPromise.create({
    provider,
    types: {
      Candidate: {
        pasportId: 'Vec<u8>',
      },
      AltVote: 'VecDeque<Candidate>',
    },
  });
  if (accountAddress) {
    const injector = await web3FromAddress(accountAddress);
    await api.tx.assemblyPallet
      .vote(dataForNode)
      .signAndSend(accountAddress, { signer: injector.signer }, ({ status }) => {
        if (status.isFinalized) {
          // eslint-disable-next-line no-console
          console.log(`Finalized at block hash #${status.asFinalized.toString()}`);
          callback(null, 'done');
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.log(':( transaction failed', error);
        callback(error);
      });
  }
};

const setIsVotingInProgressRpc = async () => {
  try {
    const api = await ApiPromise.create({ provider });
    const isVotingInProgress = await api.query.assemblyPallet.votingState();
    // eslint-disable-next-line no-console
    console.log('isVotingInProgress', isVotingInProgress.toString());
    return (isVotingInProgress.toString());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

const getMinistersRpc = async () => {
  try {
    const api = await ApiPromise.create({
      provider,
      types: {
        Candidate: {
          pasportId: 'Vec<u8>',
        },
        votingPower: 'u64',
        Minister: 'BTreeMap<Candidate>, <votingPower>',
      },
    });
    const ministersList = JSON.parse(await api.query.assemblyPallet.currentMinistersList());
    // eslint-disable-next-line no-console
    // console.log('ministersList', ministersList);

    const api3 = await ApiPromise.create({ provider });
    const liberStakeAmount = await api3.query.assemblyPallet.liberStakeAmount();
    // eslint-disable-next-line no-console
    // console.log('liberStakeAmount', liberStakeAmount.toString());

    const assemblyStakeAmount = await api.query.assemblyPallet.assemblyStakeAmount();
    // eslint-disable-next-line no-console
    console.log('assemblysStakeAmount assemblysStakeAmount', assemblyStakeAmount.toString());

    let finaleObject = [];
    let i = 1;
    for (const prop in ministersList) {
      if (Object.prototype.hasOwnProperty.call(ministersList, prop)) {
        finaleObject = [...finaleObject, {
          id: i,
          place: i,
          deputies: truncate(JSON.parse(prop).pasportId, 10),
          supported: `${prettyNumber(ministersList[prop])}`,
          // eslint-disable-next-line max-len
          power: ((matchPowHelper(ministersList[prop]) * 100) / matchPowHelper(liberStakeAmount)).toFixed(2),
        }];
        i += 1;
      }
    }
    return finaleObject;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return [];
};

const sendLawProposal = async (hash, callback) => {
  const allAccounts = await web3Accounts();
  const accountAddress = allAccounts[0].address;

  const api = await ApiPromise.create({
    provider,
    types: {
      law_hash: 'Hash',
      LawType: {
        _enum: ['ConstitutionalChange', 'Edict'],
      },
    },
  });

  if (accountAddress) {
    const injector = await web3FromAddress(accountAddress);
    await api.tx.assemblyPallet
      .proposeLaw(hash, 'ConstitutionalChange')
      .signAndSend(accountAddress, { signer: injector.signer }, ({ status }) => {
        if (status.isFinalized) {
          // eslint-disable-next-line no-console
          console.log(`Finalized at block hash #${status.asFinalized.toString()}`);
          callback(null, 'done');
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.log(':( transaction failed', error);
        callback(error);
      });
  }
};

const getLawHashes = async () => {
  try {
    const api = await ApiPromise.create({ provider });
    const laws = await api.query.assemblyPallet.laws();

    return JSON.parse(laws.toString());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

const getUserRoleRpc = async () => {
  try {
    const allAccounts = await web3Accounts();
    const accountAddress = allAccounts[0].address;

    if (!citizenAddressList.includes(accountAddress)) return { non_citizen: 'non_citizen' };

    const api = await ApiPromise.create({
      provider,
      types: {
        Candidate: {
          pasportId: 'Vec<u8>',
        },
      },
    });
    const api2 = await ApiPromise.create({
      provider,
      types: {
        PassportId: '[u8; 32]',
      },
    });
    const ministersList = JSON.stringify(await api.query.assemblyPallet.currentMinistersList());
    const passportId = await api2.query.identityPallet.passportIds(accountAddress);

    // eslint-disable-next-line no-console
    console.log('ministersList', ministersList);

    if (ministersList.includes(passportId.toString())) {
      return {
        assemblyMember: 'assemblyMember',
        citizen: 'citizen',
      };
    }
    return { citizen: 'citizen' };
  } catch (e) {
  // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

const getPeriodAndVotingDurationRpc = async () => {
  try {
    const api = await ApiPromise.create({ provider });
    const assemblyElectionPeriod = api.consts.assemblyPallet.assemblyElectionPeriod.toNumber();
    // eslint-disable-next-line no-console
    console.log('AssemblyElectionPeriod', assemblyElectionPeriod);

    const assemblyVotingDuration = api.consts.assemblyPallet.assemblyVotingDuration.toNumber();
    // eslint-disable-next-line no-console
    console.log('assemblyVotingDuration', assemblyVotingDuration);

    return { assemblyVotingDuration, assemblyElectionPeriod };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

const getStatusProposalRpc = async (hash, callback) => {
  try {
    const proposalSatuses = {
      InProgress: 1,
      Approved: 2,
      Declined: 3,
    };
    const api = await ApiPromise.create({
      provider,
      types: {
        lawHash: 'Hash',
        LawState: {
          _enum: ['Approved', 'InProgress', 'Declined'],
        },
        LawType: {
          _enum: ['ConstitutionalChange', 'Edict'],
        },
        Law: {
          state: 'LawState',
          lawType: 'LawType',
        },
      },
    });
    const proposalStatus = await api.query.assemblyPallet.laws(hash);
    callback(null, proposalSatuses[JSON.parse(proposalStatus).state]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

const getCurrentBlockNumberRpc = async () => {
  try {
    const api = await ApiPromise.create({ provider });
    const bestNumber = await api.derive.chain.bestNumber();
    return (bestNumber.toNumber());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

const getLiberStakeAmountRpc = async () => {
  try {
    const api = await ApiPromise.create({ provider });
    const liberStakeAmount = await api.query.assemblyPallet.liberStakeAmount();
    // eslint-disable-next-line no-console
    console.log('liberStakeAmount', liberStakeAmount.toString());
    return (matchPowHelper(liberStakeAmount.toString()));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error', e);
  }
  return null;
};

export {
  getBalanceByAddress,
  sendTransfer,
  stakeToPolkaBondAndExtra,
  stakeToLiberlandBondAndExtra,
  applyMyCandidacy,
  getCandidacyListRpc,
  sendElectoralSheetRpc,
  setIsVotingInProgressRpc,
  getMinistersRpc,
  getUserRoleRpc,
  sendLawProposal,
  getLawHashes,
  getPeriodAndVotingDurationRpc,
  getStatusProposalRpc,
  getCurrentBlockNumberRpc,
  getLiberStakeAmountRpc,
};
