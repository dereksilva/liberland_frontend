export default {
  signIn: '/signin',
  signUp: '/signup',
  home: {
    index: '/home',
    feed: '/home/feed',
    documents: '/home/documents',
    wallet: '/home/wallet',
    voting: '/home/voting',
    profile: '/home/profile',
    legislation: '/home/legislation',
    registries: '/home/registries',
    offices: '/home/offices',
  },
  offices: {
    identity: '/home/offices/identity',
    companyRegistry: '/home/offices/company_registry',
    landRegistry: '/home/offices/land_registry',
  },
  documents: {
    myAccount: '/home/documents/my-account',
    citizenshipHistory: '/home/documents/citizenship-history',
    landOwnership: '/home/documents/land-ownership',
    courtCases: '/home/documents/court-cases',
  },
  voting: {
    congressionalAssemble: '/home/voting/congressional-assemble',
    referendum: '/home/voting/referendum',
  },
  legislation: {
    view: '/home/legislation/:tier',
  },
  wallet: {
    allTransactions: '/home/wallet/all-transactions',
    validatorsStaking: '/home/wallet/validators-staking',
    overView: '/home/wallet/overview',
  },
  registries: {
    overview: '/home/registries',
    companies: '/home/registries/companies',
    companiesCRUD: '/home/registries/companiesCRUD',
    land: '/home/registries/land',
    assets: '/home/registries/assets',
    other: '/home/registries/other',
  },
};
