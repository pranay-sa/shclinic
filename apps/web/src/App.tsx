import { Navigate, Route, Routes } from "react-router-dom";
import { FrontdeskPortalLayout } from "@/modules/frontdesk/layout/FrontdeskPortalLayout";
import { CalendarPage } from "@/modules/frontdesk/pages/CalendarPage";
import { DoctorsSchedulePage } from "@/modules/frontdesk/pages/DoctorsSchedulePage";
import { LabCollectionSlotsPage } from "@/modules/frontdesk/pages/LabCollectionSlotsPage";
import { MedicalRecordsPage } from "@/modules/frontdesk/pages/MedicalRecordsPage";
import { PatientProfilePage } from "@/modules/frontdesk/pages/PatientProfilePage";
import { PatientsDirectoryPage } from "@/modules/frontdesk/pages/PatientsDirectoryPage";
import { BillingCheckoutPage } from "@/modules/frontdesk/pages/BillingCheckoutPage";
import { BillingPage } from "@/modules/frontdesk/pages/BillingPage";
import { FrontdeskHomePage } from "@/modules/frontdesk/pages/FrontdeskHomePage";
import { LoginPage } from "@/modules/frontdesk/pages/LoginPage";
import { OthersHubPage } from "@/modules/frontdesk/pages/OthersHubPage";
import { PatientEnrollmentDataPage } from "@/modules/frontdesk/pages/PatientEnrollmentDataPage";
import { QueueBoardPage } from "@/modules/frontdesk/pages/QueueBoardPage";
import { RegistrationFormsDataPage } from "@/modules/frontdesk/pages/RegistrationFormsDataPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/frontdesk" element={<FrontdeskPortalLayout />}>
        <Route index element={<Navigate to="/frontdesk/home" replace />} />
        <Route path="home" element={<FrontdeskHomePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="lab/collection-slots" element={<LabCollectionSlotsPage />} />
        <Route path="doctors" element={<DoctorsSchedulePage />} />
        <Route path="patients/profile/:patientId" element={<PatientProfilePage />} />
        <Route path="patients" element={<PatientsDirectoryPage />} />
        <Route path="queue" element={<QueueBoardPage />} />
        <Route path="billing/checkout" element={<BillingCheckoutPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="others/registration-forms" element={<RegistrationFormsDataPage />} />
        <Route path="others/patient-enrollment" element={<PatientEnrollmentDataPage />} />
        <Route path="others" element={<OthersHubPage />} />
        <Route path="*" element={<Navigate to="/frontdesk/home" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
