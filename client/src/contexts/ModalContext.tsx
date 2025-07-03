// src/context/ModalContext.tsx
import { IonModal } from '@ionic/react';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextProps {
  showModal: (component: ReactNode) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);

  const showModal = (component: ReactNode) => setModalContent(component);
  const hideModal = () => setModalContent(null);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent && (
        <IonModal isOpen={!!modalContent} onDidDismiss={hideModal}>
          {modalContent}
        </IonModal>
      )}
    </ModalContext.Provider>
  );
};
