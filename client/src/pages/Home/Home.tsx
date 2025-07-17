import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import './Home.css';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const Home: React.FC = () => {
  const location = useLocation();

  const router = useIonRouter();
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, [router,isLoggedIn]);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar title='Home'>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
