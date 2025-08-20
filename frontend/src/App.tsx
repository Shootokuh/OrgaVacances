

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import TripList from "./components/TripList";
import TripDetails from "./components/TripDetails";
import BudgetPage from "./components/BudgetPage";
import CalendarPage from "./components/CalendarPage";
import CheckListWrapper from "./components/CheckListWrapper";
import AuthPortal from "./components/AuthPortal";
import ResetPassword from "./components/ResetPassword";
import "./styles/AuthPortal.css";
import { useState } from "react";




function App() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        {!token ? (
          <Route path="/*" element={<AuthPortal setToken={setToken} />} />
        ) : (
          <>
            <Route path="/" element={<TripList />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/trip/:id/budget" element={<BudgetPage />} />
            <Route path="/trip/:id/checklist" element={<CheckListWrapper />} />
            <Route path="/trip/:id/calendar" element={<CalendarPage />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
