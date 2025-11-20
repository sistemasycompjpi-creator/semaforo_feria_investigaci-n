import { useContext } from 'react';
import { SemaforoContext } from './SemaforoContextDefinition';

export const useSemaforo = () => {
  const context = useContext(SemaforoContext);
  if (!context) {
    throw new Error('useSemaforo must be used within a SemaforoProvider');
  }
  return context;
};
