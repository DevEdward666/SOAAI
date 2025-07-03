import { IonActionSheet } from '@ionic/react';

interface ActionButton {
  text: string;
  role?: 'cancel' | 'destructive' | string;
  data?: any;
  icon?: string;
  handler?: () => void;
}

interface DynamicActionSheetProps {
  header: string;
  buttons: ActionButton[];
  trigger?: string;
  isOpen?: boolean;
  onDidDismiss?: () => void;
}

const ActionSheetComponent: React.FC<DynamicActionSheetProps> = ({
  header,
  buttons,
  trigger,
  isOpen,
  onDidDismiss,
}) => {
  return (
    <IonActionSheet
      header={header}
      buttons={buttons}
      trigger={trigger}
      isOpen={isOpen}
      onDidDismiss={onDidDismiss}
    />
  );
};

export default ActionSheetComponent;
