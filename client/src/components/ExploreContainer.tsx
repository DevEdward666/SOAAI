import { useCallback, useEffect, useState } from "react";
import "./ExploreContainer.css";
import Tesseract from "tesseract.js";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { convertPDFModel } from "../models/user.model";
import { ListOfSOADetails, PieChartSOAData, SOADetails } from "../interface/SOADetailsInterface";
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  IonContent,
  IonButton,
  IonText,
  IonSpinner,
  useIonViewWillEnter,
  IonSegmentContent,
  IonSegmentView,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import {
  add,
  chevronUpCircle,
  cloudUploadOutline,
  colorPalette,
  globe,
  analytics,
  eyeOffOutline,
  eyeOutline,
  lockClosed,
  save,
} from "ionicons/icons";
import AppModal from "./Modal/Modal";
import { useModal } from "../contexts/ModalContext";
import * as pdfjsLib from "pdfjs-dist";
import pdfJSWorkerURL from "pdfjs-dist/build/pdf.worker?url";
import { initializeApp, FirebaseApp } from "@firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  Auth,
} from "@firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  Firestore,
  doc,
  getDoc,
  getDocs,
} from "@firebase/firestore";
import { useFirebase } from "../contexts/FirebaseContextType";
import Card from "./Card/Card";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJSWorkerURL;
import { useHistory } from "react-router-dom";
import SegmentComponent from "./Segment/SegmentComponent";
import SkeletonComponent from "./Skeleton/SkeletonComponent";
import SpendingChart from "./SpendingChart/SpendingChart";
const ExploreContainer: React.FC = () => {
  const { showModal, hideModal } = useModal();
  const { db, userId, loading, error } = useFirebase();
  const [segmentValue, setSegmentValue] = useState("pending");
  const [spendingData, setSpendingData] = useState<PieChartSOAData>({ data: [],ChartTitle:"" });
  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassword = useCallback(() => {
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }, [showPassword]);

  const handleOpenModal = () => {
    showModal(
      <AppModal
        title="SOA Analyzer"
        content={<SOAModalContent />}
        onClose={hideModal}
      />
    );
  };
  const SOAModalContent = () => {
    const [file, setFile] = useState<File | null>(null);
    const [filepassword, setPassword] = useState(null);
    const [hasPassword, sethasPassword] = useState<boolean>(false);
    const [text, setText] = useState("");
    const [parsedData, setParsedData] = useState<ListOfSOADetails | null>();
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const { uploadPDF } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

    const [formData, setFormData] = useState<convertPDFModel>({
      password: "",
      file: undefined,
    });

    // Run only once on component mount
    const saveSOADetailsToFirestore = async (soaData: SOADetails): Promise<void> => {
      if (!db || !userId) {
        console.error("Firestore DB or User ID not available.");
        setError("Database not ready or user not authenticated.");
        setSaving(false);
        return;
      }

      setError(null);

      try {
        const appId = import.meta.env.VITE_FIREBASE_APP_ID;
        setSaving(true);
        const userBankStatementsCollection = collection(
          db,
          `artifacts/${appId}/users/${userId}/bankStatements`
        );
        const docRef = await addDoc(userBankStatementsCollection, soaData);
        hideModal();
        setSaving(false);
      } catch (e: any) {
        console.error("Error adding document: ", e);
        setError(`Failed to save SOA details: ${e.message || "Unknown error"}`);
        setSaving(false);
      } finally {
      }
    };
    const handleFileChange = async (event: any) => {
      if (event.target.files && event.target.files.length > 0) {
        const File = event.target.files[0];
        if (!File) {
          console.error("No file selected");
          return;
        } else {
          setFile(File);
          const arrayBuffer = await File.arrayBuffer();
          try {
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            sethasPassword(false);
          } catch (error: any) {
            if (error?.name === "PasswordException") {
              if (error.code === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
                sethasPassword(true);
              }
            } else {
              console.error("Error reading PDF:", error);
            }
          }
          const { name, value } = event.target;
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      }
    };

    const handleExtract = useCallback(async () => {
      if (!file) return;
      if (!loading) {
        setLoading(true);
        let payload: convertPDFModel = {
          file: file,
          password: filepassword ?? "",
        };
        const response = await uploadPDF(payload);
        if (response) {
          setLoading(false);
          setParsedData(response);
          console.log(response.data)
          saveSOADetailsToFirestore(response.data)
        }
      }
    }, [file, filepassword, loading]);

    const handlePassword = (e: any) => {
      setPassword(e.target.value);
    };
    return (
      <IonContent className="ion-padding">
        {hasPassword ? (
          <>
            {" "}
            <div className="input-1">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                onInput={(e: any) => handlePassword(e)}
              />
              <span className="material-symbols-outlined">
                <IonIcon
                  slot="end"
                  icon={lockClosed}
                  aria-hidden="true"
                ></IonIcon>
                {/* <IonIcon
          onClick={() => handleShowPassword()}
          className="show-hide-icon"
          slot="end"
          aria-hidden="true"
          icon={showPassword ? eyeOutline : eyeOffOutline}
        ></IonIcon> */}
              </span>
            </div>
          </>
        ) : null}

        <div className="file-upload-container">
          <label htmlFor="file-upload" className="file-upload-label">
            {file && <p className="file-name">Selected file: {file?.name}</p>}{" "}
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          <IonButton color="medium" expand="block">
            <IonIcon icon={cloudUploadOutline} slot="start" />
            Choose File (.pdf)
          </IonButton>
        </div>

        <IonButton color="medium" expand="block" onClick={handleExtract}>
          {loading ? (
            <IonSpinner name="circles"></IonSpinner>
          ) : (
            <IonIcon icon={analytics} slot="start" />
          )}
          {loading ? "Processing..."  : saving ? "Saving Data...": "Analyze & Save"}
        </IonButton>
{/* 
        {parsedData && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Extracted Data</h2>
            <p>
              <strong>Bank:</strong> {parsedData.data.bank_name}
            </p>
            <p>
              <strong>Card Holder:</strong>{" "}
              {parsedData.data.account_holder_name}
            </p>
            <p>
              <strong>Card Number:</strong> {parsedData.data.card_number}
            </p>

            <p>
              <strong>Credit Limit:</strong> {parsedData.data.credit_limit}
            </p>
            <p>
              <strong>Statement Date:</strong> {parsedData.data.statement_date}
            </p>
            <p>
              <strong>Statement Due Date:</strong>{" "}
              {parsedData.data.payment_due_date}
            </p>

            <p>
              <strong>Statement Balance:</strong>{" "}
              {parsedData.data.statement_balance}
            </p>
            <p>
              <strong>Previous Balance:</strong>{" "}
              {parsedData.data.previous_balance}
            </p>
            <p>
              <strong>Minimum Payment Due:</strong>{" "}
              {parsedData.data.minimum_payment_due}
            </p>
            <IonButton
              color="medium"
              expand="block"
              onClick={() => saveSOADetailsToFirestore(parsedData.data)}
            >
              <IonIcon icon={save} slot="start" />
              {saving ? "Saving..." : "Save to Firebase"}
            </IonButton>
          </div>
        )} */}
      </IonContent>
    );
  };
  const [soaList, setSoaList] = useState<SOADetails[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const history = useHistory();
  const [loaded, setLoaded] = useState(false);

  const fetchSOA = async () => {
    if (!db || !userId) {
      setFetchError("Database or User ID not available");
      setFetchLoading(false);
      return;
    }

    try {
      setSoaList([]);
      setLoaded(false);
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      const userBankStatementsCollection = collection(
        db,
        `artifacts/${appId}/users/${userId}/bankStatements`
      );

      const snapshot = await getDocs(userBankStatementsCollection);
      const list: SOADetails[] = [];

      snapshot.forEach((doc) => {
        list.push({ ...(doc.data() as SOADetails), id: doc.id });
      });
      setSoaList(list);
      setLoaded(true);
    } catch (err) {
      console.error("Error fetching SOA details:", err);
      setFetchError("Failed to fetch SOA details.");
    } finally {
      setFetchLoading(false);
    }
  };
  useEffect(() => {
    fetchSOA();
  }, [db, userId]);
  useIonViewWillEnter(() => {
    fetchSOA();
  });
  const handleOpenSOADetials = (details: SOADetails) => {
    history.push("/soa-details", { details });
  };
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await fetchSOA();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      event.detail.complete();
    }
  };
  const segmentOptions = [
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
  ];
  
useEffect(() => {
  if (!soaList) return;

  const grouped: { [category: string]: number } = {};

  soaList.forEach((item) => {
    const category = item.bank_name ?? 'Others';
    grouped[category] = (grouped[category] || 0) + parseFloat(item.statement_balance.toString().replace(/,/g, ""));
  });

  const chartData = Object.entries(grouped).map(([category, amount]) => ({
    category,
    amount,
  }));

  setSpendingData({ data: chartData,ChartTitle:"Spendings by bank" });
}, [soaList]);
  return (
    <IonContent>
         <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
      <div className="p-4 max-w-xl mx-auto">
      <SpendingChart data={spendingData.data!} ChartTitle={spendingData.ChartTitle} />
        <SegmentComponent
          options={segmentOptions}
          selected={segmentValue}
          onChange={setSegmentValue}
        />
         <SkeletonComponent loaded={loaded} count={3} />
        <IonSegmentView>
          <IonSegmentContent id="pending">
            {" "}
            {soaList.filter(x=> !x.paid).map((item, idx) => (
              <Card
                key={idx}
                data={item}
                render={(data) => (
                  <div className="card-details">
                    <IonText className="card-title">{data.bank_name}</IonText>
                    <IonText className="card-text-info">
                      Payment Due Date:{" "}
                      {new Date(data.payment_due_date).toLocaleDateString()}
                    </IonText>
                    <IonText className="card-text-info">
                      Statement Balance: ₱
                      {data.statement_balance.toLocaleString()}
                    </IonText>
                  </div>
                )}
                onClick={(item) => handleOpenSOADetials(item)}
              />
            ))}
          </IonSegmentContent>
          <IonSegmentContent id="paid">
          {soaList.filter(x=> x.paid).map((item, idx) => (
              <Card
                key={idx}
                data={item}
                render={(data) => (
                  <div className="card-details">
                    <IonText className="card-title">{data.bank_name}</IonText>
                    <IonText className="card-text-info">
                      Payment Due Date:{" "}
                      {new Date(data.payment_due_date).toLocaleDateString()}
                    </IonText>
                    <IonText className="card-text-info">
                      Statement Balance: ₱
                      {data.statement_balance.toLocaleString()}
                    </IonText>
                  </div>
                )}
                onClick={(item) => handleOpenSOADetials(item)}
              />
            ))}
          </IonSegmentContent>
        </IonSegmentView>

       
      </div>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={handleOpenModal}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
    </IonContent>
  );
};

export default ExploreContainer;
