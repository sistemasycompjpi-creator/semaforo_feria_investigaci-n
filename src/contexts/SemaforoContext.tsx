import { useState } from 'react';
import { SemaforoContext } from './SemaforoContextDefinition';

export const SemaforoProvider = ({ children }: { children: React.ReactNode }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);

  return (
    <SemaforoContext.Provider value={{ showCustomModal, setShowCustomModal }}>
      {children}
    </SemaforoContext.Provider>
  );
};
