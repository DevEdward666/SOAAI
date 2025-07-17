import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { chatbubbleEllipses, home, person } from "ionicons/icons";
import React from "react";
import { Redirect, Route } from "react-router";
// Components

import  SOADetailsCompoenent  from "./components/Details/SOADetails";
// Pages
import Home from "./pages/Home/Home";

// Contexts
import { UserProvider } from "./contexts/UserContext";

import { AuthProvider } from "./contexts/AuthContext";
import { PetProvider } from "./contexts/PetContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ReportProvider } from "./contexts/ReportContext";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/* Theme variables */
import "./theme/variables.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import { ModalProvider } from "./contexts/ModalContext";
import { FirebaseProvider } from "./contexts/FirebaseContextType";
import Profile from "./pages/Profile/Profile";

// Initialize Ionic
setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <UserProvider>
        <ModalProvider>
        <FirebaseProvider>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                {/* Main Tab Routes */}
                <Route exact path="/home" component={Home} />
                <Route exact path="/profile" component={Profile} />

                <Route exact path="/register" component={Register} />
                {/* Default Route */}
                <Route exact path="/">
                  <Redirect to="/login" />
                </Route>
              </IonRouterOutlet>

              <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/home">
                  <IonIcon icon={home} />
                  <IonLabel>Home</IonLabel>
                </IonTabButton>
                <IonTabButton tab="messages" href="/messages">
                  <IonIcon icon={chatbubbleEllipses} />
                  <IonLabel>Messages</IonLabel>
                </IonTabButton>
                <IonTabButton tab="profile" href="/profile">
                  <IonIcon icon={person} />
                  <IonLabel>Profile</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>

            {/* Non-Tab Routes */}
            <Route path="/soa-details" component={SOADetailsCompoenent} exact />
            <Route exact path="/login" component={Login} />
          </IonReactRouter>
          </FirebaseProvider>
        </ModalProvider>
      </UserProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
