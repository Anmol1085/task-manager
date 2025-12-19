import type { AppProps } from 'next/app';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import '../src/app_disabled/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  // Professional Dark Theme (Handled by globals.css)
  const currentTheme = '';

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        <motion.div
          key={router.pathname}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`page-transition min-h-screen ${currentTheme} transition-colors duration-500`}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </QueryClientProvider>
  );
}
