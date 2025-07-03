// src/components/GlobalModal.tsx
import React, { ReactNode } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
} from "@ionic/react";
import { close, closeCircle } from "ionicons/icons";

interface GlobalModalProps {
  title: string;
  message?: string;
  content: ReactNode;
  onClose: () => void;
}

const AppModal: React.FC<GlobalModalProps> = ({
  title,
  message,
  content,
  onClose,
}) => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
                <IonIcon color="dark" icon={close} />
            </IonButton>
            </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>{message}</p>
        <>{content}</>
        {/* <IonButton expand="block" onClick={onClose}>
          Close
        </IonButton> */}
      </IonContent>
    </>
  );
};

export default AppModal;
