'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import AuthHydrator from '@/components/AuthHydrator';
import { ToastProvider } from '@/components/ui/Toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthHydrator>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthHydrator>
    </Provider>
  );
}
