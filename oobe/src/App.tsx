import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import EmbeddedApp from "./components/EmbeddedApp";
import { Routes, Route, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { APIClient } from "./api/APIClient";

function App() {
  const apiClient = useMemo(() => {
    return new APIClient();
  }, []);

  return (
    <div className="d-flex vh-100">
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>
      <section className="flex-grow-1 d-flex flex-column overflow-auto">
        <main className="flex-grow-1">
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard apiClient={apiClient} />}
            />
            <Route
              path="/hub"
              element={
                <EmbeddedApp
                  url={"https://apphub.seco.com/"}
                  title="Application Hub"
                />
              }
            />
            <Route
              path="/developer"
              element={
                <EmbeddedApp
                  url={"https://developer.seco.com/"}
                  title="Developer Center"
                />
              }
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
