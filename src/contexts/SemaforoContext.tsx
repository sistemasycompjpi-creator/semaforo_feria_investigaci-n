import { createContext, useState, useContext } from 'react';

interface SemaforoContextType {
  showCustomModal: boolean;
  setShowCustomModal: (show: boolean) => void;
}

const SemaforoContext = createContext<SemaforoContextType | undefined>(undefined);

export const SemaforoProvider = ({ children }: { children: React.ReactNode }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);

  return (
    <SemaforoContext.Provider value={{ showCustomModal, setShowCustomModal }}>
      {children}
    </SemaforoContext.Provider>
  );
};

export const useSemaforo = () => {
  const context = useContext(SemaforoContext);
  if (!context) {
    throw new Error('useSemaforo must be used within a SemaforoProvider');
  }
  return context;
};
