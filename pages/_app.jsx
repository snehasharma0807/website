import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Footer from '../components/footer';
import Nav from '../components/navbar';
import { initializeGA, logPage } from '../components/Analytics';

function App({ Component, pageProps }) {
  const router = useRouter();
  const activeRoute = router.pathname;

  // Admin and login pages manage their own layout (no public Nav/Footer)
  const isAdminRoute = activeRoute.startsWith('/admin') || activeRoute === '/login';

  // Support per-page getLayout — used by admin pages
  const getLayout = Component.getLayout ?? (page => page);

  // ping Google Analytics on every route change
  useEffect(() => {
    initializeGA();
    logPage();
  }, [activeRoute]);

  if (isAdminRoute) {
    return getLayout(<Component {...pageProps} />);
  }

  return (
    <div>
      <Nav />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}

export default App;
