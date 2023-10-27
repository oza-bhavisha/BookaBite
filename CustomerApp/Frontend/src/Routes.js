import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import DemoPage1 from "./views/DemoPage1";
import DemoPage2 from "./views/DemoPage2";
import NavbarLayout from "./utils/NavbarLayout";

import Login from "./auth/login";
import Signup from "./auth/signup";
import First from "./auth/first";

export function isLoggedIn() {
  const token = localStorage.getItem("userData");
  return token !== null;
}

export function Auth({ children }) {
  return isLoggedIn() ? children : null;
}


const Router = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<NavbarLayout />}>
      <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/first" element={<First />} />
          <Route path="/*" element={<Navigate to="/first" />} />
          <Route path = '/DemoPage1' element = <Auth><DemoPage1/></Auth> />
          <Route path = '/DemoPage2' element = <Auth><DemoPage2/></Auth> />
      </Route>
    </Routes>
  );
};

export default Router;
