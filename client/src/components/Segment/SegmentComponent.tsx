import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';

interface SegmentOption {
  label: string;
  value: string;
}

interface ISegmentInterface {
  options: SegmentOption[];
  selected: string;
  onChange: (value: string) => void;
}

const SegmentComponent: React.FC<ISegmentInterface> = ({ options, selected, onChange }) => {
    return (
        <IonSegment
          value={selected}
          onIonChange={(e) => {
            if (e.detail.value) {
              onChange(e.detail.value.toString());
            }
          }}
        >
          {options.map((option) => (
            <IonSegmentButton key={option.value} value={option.value} contentId={option.value}>
              <IonLabel>{option.label}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
        
      );
};

export default SegmentComponent;
