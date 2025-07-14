// src/components/GlobalModal.tsx
import React, { ReactNode, useCallback, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonInput,
  IonItem,
  IonPage,
  IonLabel,
  IonFooter,
  IonSpinner,
  IonCheckbox,
  useIonToast,
} from "@ionic/react";
import { SOADetails } from "../../interface/SOADetailsInterface";
import { useHistory, useLocation } from "react-router-dom";
import CurrencyInput from "../../helpers/CurrencyInput";
import {
  arrowBack,
  calendarClear,
  calendarClearOutline,
  close,
  closeCircle,
  save,
  saveOutline,
  trashBin,
} from "ionicons/icons";
import "./SOADetails.css";
import { doc, Firestore, updateDoc, deleteDoc } from "@firebase/firestore";
import { useFirebase } from "../../contexts/FirebaseContextType";
import ActionSheetComponent from "../Sheet/SheetComponent";
import { CreateReminder, generateAndDownloadICS } from "../../helpers/Calendar";
import {
  CapacitorCalendar,
  CalendarPermissionScope,
} from "@ebarooni/capacitor-calendar";
import { Capacitor } from "@capacitor/core";
const SOADetailsCompoenent: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const { db, userId, loading, error } = useFirebase();
  const { details } = location.state as { details: SOADetails };
  const [formData, setFormData] = useState<SOADetails>({
    ...details,
  });
  const [present] = useIonToast();
  const handleSave = useCallback(async () => {
    if (!db || !userId || !details.id) {
      console.error("Missing db, userId, or document ID");
      return;
    }

    try {
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/bankStatements`,
        details.id
      );
      if (isSubmitting) {
        return;
      }

      setSubmitting(true);
      const updatedData: Partial<SOADetails> = {
        bank_name: formData.bank_name,
        card_number: formData.card_number,
        account_holder_name: formData.account_holder_name,
        credit_limit: formData.credit_limit,
        paid: formData.paid,
        minimum_payment_due: formData.minimum_payment_due,
        statement_balance: formData.statement_balance,
        previous_balance: formData.previous_balance,
      };

      await updateDoc(docRef, updatedData);
      console.log("SOA updated successfully!");
      setSubmitting(false);
      // Optionally navigate back or show success message
    } catch (error) {
      console.error("Failed to update SOA:", error);
    }
  }, [db, userId, formData]);
  const updateField = (field: keyof SOADetails, value: any) => {
    console.log(value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleDelete = async () => {
    if (!db || !userId || !details.id) {
      console.error("Missing db, userId, or document ID");
      return;
    }

    try {
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/bankStatements`,
        details.id
      );
      await deleteDoc(docRef);
      alert("Successfully deleted");
      history.goBack();
    } catch (error) {
      console.error("Failed to delete SOA:", error);
    }
  };
  const handleSaveToCalendar = async () => {
    if (!details.id) {
      console.error("Missing db, userId, or document ID");
      return;
    }
    const platform = Capacitor.getPlatform();
    const originalDate = new Date(details.payment_due_date);
    const startDate = new Date(
      originalDate.getTime() - 5 * 24 * 60 * 60 * 1000
    ).getTime();
    const endDate = new Date(details.payment_due_date).getTime();

    try {
      if (platform === "ios" || platform === "android") {
        const hasPermission = await CapacitorCalendar.checkAllPermissions();
        if (!hasPermission.result) {
          const permission =
            await CapacitorCalendar.requestFullCalendarAccess();
          if (!permission.result) {
            alert("Permission denied to access calendar");
            return;
          }
        }

        CreateReminder({
          listId: details.id,
          title: `${details.bank_name} - ${details.card_number}`,
          startDate: startDate,
          completionDate: endDate,
        });
      } else if (platform === "web") {
        // Web fallback: generate .ics file
        const formatDate = (date: Date) =>
          date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const startDate = new Date(
          originalDate.getTime() - 5 * 24 * 60 * 60 * 1000
        );
        const endDate = new Date(details.payment_due_date);
        generateAndDownloadICS({
          listId: details.id,
          title: `SOA: ${details.bank_name} - ${details.card_number}`,
          startDate: startDate,
          completionDate: endDate,
        });
        present({
          message: 'Tap the downloaded file to add the event to your calendar.',
          duration: 3000,
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error("SOA did not save to calendar:", error);
    }
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>
              <IonIcon color="dark" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton fill="clear" id="open-action-calendar">
              <IonIcon color="primary" icon={calendarClearOutline} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton fill="clear" id="open-action-delete">
              <IonIcon color="danger" icon={trashBin} />
            </IonButton>
          </IonButtons>
          <IonTitle> Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonInput
            label="Bank Name"
            labelPlacement="stacked"
            placeholder="Bank Name"
            value={formData?.bank_name}
            onIonInput={(e) => updateField("bank_name", e.detail.value!)}
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonInput
            label="Card Holder"
            labelPlacement="stacked"
            placeholder="Card Holder"
            value={formData.account_holder_name}
            onIonInput={(e) =>
              updateField("account_holder_name", e.detail.value!)
            }
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonInput
            label="Card Number"
            labelPlacement="stacked"
            placeholder="Card Number"
            value={formData.card_number}
            onIonInput={(e) => updateField("card_number", e.detail.value!)}
          ></IonInput>
        </IonItem>
        <IonItem>
          <CurrencyInput
            label="Credit Limit"
            value={parseFloat(
              formData.credit_limit.toString().replace(/,/g, "")
            )}
            onValueChange={(val) => updateField("credit_limit", val!)}
          />
        </IonItem>

        <IonItem>
          <CurrencyInput
            label="Statement Balance"
            value={parseFloat(
              formData.statement_balance.toString().replace(/,/g, "")
            )}
            onValueChange={(val) => updateField("statement_balance", val!)}
          />
        </IonItem>
        <IonItem>
          <CurrencyInput
            label="Previous Balance"
            value={parseFloat(
              formData.previous_balance.toString().replace(/,/g, "")
            )}
            onValueChange={(val) => updateField("statement_balance", val!)}
          />
        </IonItem>
        <IonItem>
          <CurrencyInput
            label="Minimum Payment Due"
            value={parseInt(
              formData.minimum_payment_due.toString().replace(/,/g, "")
            )}
            onValueChange={(val) => updateField("minimum_payment_due", val!)}
          />
        </IonItem>
        <IonItem>
          <div className="checkbox-container-row">
            <IonCheckbox
              checked={formData?.paid}
              labelPlacement="end"
              onIonChange={(val) => updateField("paid", val.detail.checked)}
            >
              Set as PAID
            </IonCheckbox>
          </div>
        </IonItem>
        <ActionSheetComponent
          trigger="open-action-calendar"
          header="Save this to calendar"
          buttons={[
            {
              text: "Save to Calendar",
              role: "destructive",
              data: { action: "save" },
              handler: () => handleSaveToCalendar(),
            },
            {
              text: "Cancel",
              role: "cancel",
              data: { action: "cancel" },
            },
          ]}
        />
        <ActionSheetComponent
          trigger="open-action-delete"
          header="Are you sure you want to delete?"
          buttons={[
            {
              text: "Delete",
              role: "destructive",
              data: { action: "delete" },
              handler: () => handleDelete(),
            },
            {
              text: "Cancel",
              role: "cancel",
              data: { action: "cancel" },
            },
          ]}
        />
      </IonContent>
      <IonFooter className="btn-footer">
        <IonToolbar>
          <div className="btn-container-row">
            <IonButton
              className="__btn"
              expand="block"
              onClick={() => (isSubmitting ? null : history.goBack())}
            >
              {isSubmitting ? (
                <IonSpinner name="circles"></IonSpinner>
              ) : (
                <IonIcon slot="start" icon={close}></IonIcon>
              )}
              Cancel
            </IonButton>
            <IonButton
              className="__btn"
              expand="block"
              fill="outline"
              onClick={handleSave}
            >
              {isSubmitting ? (
                <IonSpinner name="circles"></IonSpinner>
              ) : (
                <IonIcon slot="start" icon={save}></IonIcon>
              )}
              {isSubmitting ? "Saving" : "Save"}
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default SOADetailsCompoenent;
