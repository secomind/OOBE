import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <div className="d-flex vh-100">
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>
      <section className="flex-grow-1 d-flex flex-column overflow-auto">
        <main className="flex-grow-1 p-3 bg-light"></main>
      </section>
    </div>
  );
}

export default App;
