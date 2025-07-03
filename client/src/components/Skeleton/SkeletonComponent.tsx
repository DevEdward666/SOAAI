import {
    IonList,
    IonListHeader,
    IonSkeletonText,
    IonItem,
    IonThumbnail,
    IonLabel,
  } from "@ionic/react";
  
  interface SkeletonComponentProps {
    loaded: boolean;
    count?: number; 
  }
  
  const SkeletonComponent: React.FC<SkeletonComponentProps> = ({
    loaded,
    count = 1,
  }) => {
    if (loaded) return null;
  
    return (
      <IonList>
        <IonListHeader>
          <IonSkeletonText animated style={{ width: "80px" }} />
        </IonListHeader>
  
        {Array.from({ length: count }).map((_, index) => (
          <IonItem key={index}>
            <IonThumbnail slot="start">
              <IonSkeletonText animated />
            </IonThumbnail>
            <IonLabel>
              <h3>
                <IonSkeletonText animated style={{ width: "80%" }} />
              </h3>
              <p>
                <IonSkeletonText animated style={{ width: "60%" }} />
              </p>
              <p>
                <IonSkeletonText animated style={{ width: "30%" }} />
              </p>
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    );
  };
  
  export default SkeletonComponent;
  