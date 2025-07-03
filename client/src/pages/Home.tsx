import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isLoggedIn } = useAuth();
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
