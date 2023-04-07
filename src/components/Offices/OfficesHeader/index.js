import React from 'react';

import Tabs from '../../Tabs';
import router from '../../../router';

const navigationList = [
  {
    route: `${router.offices.identity}`,
    title: 'Citizenship (Identity)',
  },
  {
    route: `${router.offices.companyRegistry}`,
    title: 'Company Registry',
  },
];

function OfficesHeader() {
  return <Tabs navigationList={navigationList} />;
}

export default OfficesHeader;