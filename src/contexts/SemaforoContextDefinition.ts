import { createContext } from 'react';

export interface SemaforoContextType {
  showCustomModal: boolean;
  setShowCustomModal: (show: boolean) => void;
}

export const SemaforoContext = createContext<SemaforoContextType | undefined>(undefined);
