import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import TripList from "./components/TripList";
import TripDetails from "./components/TripDetails";
import BudgetPage from "./components/BudgetPage";
import CheckListWrapper from "./components/CheckListWrapper";

function App() {
  return (
    <BrowserRouter>
      <Header /> {/* Le header reste affiché partout */}
      <Routes>
        <Route path="/" element={<TripList />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/trip/:id/budget" element={<BudgetPage />} />
        <Route path="/trip/:id/checklist" element={<CheckListWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
