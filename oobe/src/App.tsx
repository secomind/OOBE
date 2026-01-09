import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import EmbeddedApp from "./components/EmbeddedApp";
import { Routes, Route, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { APIClient } from "./api/APIClient";
import DemoApp from "./pages/DemoApp";
import TestingTool from "./pages/TestingTool";
import SmartBuilding from "./pages/SmartBuilding";
import Medical from "./pages/Medical";
import IndustrialAutomation from "./pages/IndustrialAutomation";
import SmartAlertManagement from "./pages/SmartAlertManagement";
import MedicalAlertManagement from "./pages/MedicalAlertManagement";
import IndustrialAlertManagement from "./pages/IndustrialAlertManagement";
import { useLocation } from "react-router-dom";
import SmartLoby from "./pages/SmartLobby";
import VideoPlayerTestTool from "./pages/VideoPlayerTestTool";
import RGBPatternTestTool from "./pages/RGBPatternTestTool";
import SampleIntegrityCheck from "./pages/SampleIntegrityCheck";
import SmartClinical from "./pages/SmartClinical";
import QualityInspection from "./pages/QualityInspection";

const HIDE_SIDEBAR_ROUTES = [
  "/medical-alert-management",
  "/smart-alert-management",
  "/industrial-alert-management",
  "/smart-loby",
  "/smart-building",
  "/medical",
  "/industrial",
  "/rgb-pattern-test-tool",
  "/sample-integrity-check",
  "/smart-clinical",
  "/quality-inspection",
];

function App() {
  const apiClient = useMemo(() => {
    return new APIClient();
  }, []);
  const location = useLocation();
  const hideSidebar = HIDE_SIDEBAR_ROUTES.includes(location.pathname);

  return (
    <div className="d-flex vh-100">
      {!hideSidebar && <Sidebar />}

      <section className="flex-grow-1 d-flex flex-column overflow-auto">
        <main className="flex-grow-1">
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard apiClient={apiClient} />}
            />
            <Route path="/demo" element={<DemoApp />} />
            <Route path="/tool" element={<TestingTool />} />
            <Route path="/smart-building" element={<SmartBuilding />} />
            <Route path="/medical" element={<Medical />} />
            <Route path="/industrial" element={<IndustrialAutomation />} />
            <Route path="/smart-loby" element={<SmartLoby />} />
            <Route
              path="/smart-alert-management"
              element={<SmartAlertManagement apiClient={apiClient} />}
            />
            <Route
              path="medical-alert-management"
              element={<MedicalAlertManagement apiClient={apiClient} />}
            />
            <Route
              path="industrial-alert-management"
              element={<IndustrialAlertManagement apiClient={apiClient} />}
            />
            <Route path="/video-player" element={<VideoPlayerTestTool />} />
            <Route
              path="/rgb-pattern-test-tool"
              element={<RGBPatternTestTool />}
            />
            <Route path="/quality-inspection" element={<QualityInspection />} />
            <Route
              path="/sample-integrity-check"
              element={<SampleIntegrityCheck />}
            />
            <Route
              path="/smart-clinical"
              element={<SmartClinical apiClient={apiClient} />}
            />
            <Route
              path="/connect"
              element={
                <EmbeddedApp
                  url={
                    "https://developer.seco.com/clea-os/version-kirkstone_1-10-00/get_started/requirements"
                  }
                  title="Connect to Clea"
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </section>
    </div>
  );
}

export default App;
