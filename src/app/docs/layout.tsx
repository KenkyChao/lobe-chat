import { type ReactNode } from 'react';

import NextThemeProvider from '@/layout/GlobalProvider/NextThemeProvider';

const DocsLayout = ({ children }: { children: ReactNode }) => {
  return <NextThemeProvider>{children}</NextThemeProvider>;
};

export default DocsLayout;
