import Sidebar from "./components/Sidebar";
import "./App.css";
import EmbeddedApp from "./components/EmbeddedApp";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="d-flex vh-100">
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>
      <section className="flex-grow-1 d-flex flex-column overflow-auto">
        <main className="flex-grow-1 bg-light">
          <Routes>
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
          </Routes>
        </main>
      </section>
    </div>
  );
}

export default App;
