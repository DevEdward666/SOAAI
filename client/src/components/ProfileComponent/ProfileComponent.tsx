import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonImg,
  IonPage,
  IonSpinner,
  IonText,
  IonToolbar,
} from "@ionic/react";
import Card from "../Card/Card";
import "./ProfileComponent.css";
import ProfileImage from "../../../public/assets/default-image.png";
import { useAuth } from "../../contexts/AuthContext";
import { logOut, save } from "ionicons/icons";
const SegmentComponent: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <IonContent>
        <Card
          render={(data) => (
            <div className="card-row">
              <div className="card-details">
                <IonImg
                  src={ProfileImage}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="card-details">
                <IonText className="card-title">{""}</IonText>
                <IonText className="card-text-info">
                  Fullname: {user?.fullName}
                </IonText>
                <IonText className="card-text-info">
                  Statement Balance: ₱{""}
                </IonText>
              </div>
            </div>
          )}
          data={undefined}
        />
      </IonContent>

      <IonFooter className="btn-footer">
        <IonToolbar>
          <div className="btn-container-row">
            <IonButton className="__btn" expand="block" onClick={() => logout()}>
              <IonIcon slot="start" icon={logOut}></IonIcon>
              Logout
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </div>
  );
};

export default SegmentComponent;
