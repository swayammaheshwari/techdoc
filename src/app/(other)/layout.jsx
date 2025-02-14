import NavigationSetter from '../../utilities/history';
import Providers from '../../providers/providers';
import Head from 'next/head';

export const metadata = {
  title: 'Techdoc',
  description: 'Manage Docs & Build API Documentation',
};

export default function RootLayout({ children }) {
  return (
    <>
      <head>
        <link rel='icon' href='/favicon.svg' />
      </head>
      <Providers>{children}</Providers>
      <NavigationSetter />
    </>
  );
}
