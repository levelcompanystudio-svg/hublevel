import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import type { AuthContextType } from './auth.types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
