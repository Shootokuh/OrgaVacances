

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
import { useEffect, useState } from "react";
import { apiFetch } from "./utils/api";
import { auth } from "./utils/firebase";





function App() {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(auth.currentUser);
  const [checkingToken, setCheckingToken] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Vérifie le token côté backend dès qu'on a un utilisateur Firebase
  useEffect(() => {
    if (!firebaseUser) return;
    setCheckingToken(true);
    apiFetch("/api/users/me")
      .then(res => {
        setCheckingToken(false);
        if (!res.ok) throw new Error('Unauthorized');
      })
      .catch(() => {
        // Token invalide côté backend : on déconnecte tout
        localStorage.removeItem('token');
        auth.signOut();
        setFirebaseUser(null);
        setCheckingToken(false);
      });
  }, [firebaseUser]);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        {!firebaseUser || checkingToken ? (
          <Route path="/*" element={<AuthPortal setToken={() => {}} />} />
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
