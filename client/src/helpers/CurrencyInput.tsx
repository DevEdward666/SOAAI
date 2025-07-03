import { IonInput } from '@ionic/react';
import { useState } from 'react';

const CurrencyInput = ({ label, value, onValueChange }: {
  label: string;
  value: number;
  onValueChange: (val: number) => void;
}) => {
  const formatCurrency = (num: number) =>
    num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [displayValue, setDisplayValue] = useState(formatCurrency(value));

  const handleInput = (e: CustomEvent) => {
    const raw = e.detail.value || '';
    const numeric = parseFloat(raw.replace(/,/g, ''));
    if (!isNaN(numeric)) {
      setDisplayValue(formatCurrency(numeric));
      onValueChange(numeric);
    } else {
      setDisplayValue(raw);
      onValueChange(0);
    }
  };

  return (
    <IonInput
      label={label}
      labelPlacement="stacked"
      type="text"
      placeholder={label}
      value={displayValue}
      onIonInput={handleInput}
    />
  );
};

export default CurrencyInput;