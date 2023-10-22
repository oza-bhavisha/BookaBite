import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import DemoPage1 from "./views/DemoPage1";
import DemoPage2 from "./views/DemoPage2";
import NavbarLayout from "./utils/NavbarLayout";
import ReservationForm from "./views/Reservation/reservationForm";

const Router = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<NavbarLayout />}>
        <Route path="/DemoPage1" element={<DemoPage1 />} />
        <Route path="/" element={<DemoPage1 />} />
      </Route>
      <Route path="/DemoPage2" element={<DemoPage2 />} />
      <Route path ="/reservation" element={< ReservationForm/>}/>
    </Routes>
  );
};

export default Router;
