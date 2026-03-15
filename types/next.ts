import type { NextPage } from 'next';
import type React from 'react';

export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};
