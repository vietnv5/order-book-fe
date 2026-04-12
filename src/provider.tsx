import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ShopProvider } from '@/contexts/ShopContext';

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShopProvider>
        {children}
      </ShopProvider>
    </AuthProvider>
  );
}
