import React from "react";
import "./Card.css"
import { IonCard } from "@ionic/react";
interface CardProps<T> {
  data: T;
  render: (item: T) => React.ReactNode;
  onClick?: (item: T) => void;
}

function Card<T>({ data, render, onClick}: CardProps<T>) {
  return (
    <IonCard
      className="card-info"
      onClick={() => onClick?.(data)}
    >
      {render(data)}
    </IonCard>
  );
}

export default Card;
