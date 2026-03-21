import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';
import { MobileMenuProvider } from '@/context/MobileMenuContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <MobileMenuProvider>
          <Component {...pageProps} />
        </MobileMenuProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;

