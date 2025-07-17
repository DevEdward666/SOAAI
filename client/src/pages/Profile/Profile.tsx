import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./Profile.css";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { useLocation, useHistory } from "react-router";
import ProfileComponent from "../../components/ProfileComponent/ProfileComponent";

const Profile: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { isLoggedIn } = useAuth();
  const router = useIonRouter();
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, [router,isLoggedIn]);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar title="Profile">
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ProfileComponent />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
