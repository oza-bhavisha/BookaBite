import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from "./auth/login";
import Signup from "./auth/signup";
import First from "./auth/first";
import DemoPage1 from './views/DemoPage1';
import DemoPage2 from './views/DemoPage2';
import NavbarLayout from './utils/NavbarLayout';
import RestaurantDetails from './list-restaurant/RestaurantDetails';
import RestaurantList from './list-restaurant/RestaurantList';
import './list-restaurant/styles.css';
import Footer from './utils/Footer';

const Router = () => {
  const location = useLocation();

  return (
    <>
    <NavbarLayout /> 
    <Routes location={location} key={location.pathname}>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/first" element={<First />} />
      <Route path="/DemoPage1" element={<DemoPage1 />} />
      <Route path="/DemoPage2" element={<DemoPage2 />} />
      <Route path="/restaurantList" element={<RestaurantList />} />
      <Route path="/restaurant/:id" element={<RestaurantDetails />} />
    </Routes>
    <Footer />
    </>
  );
};

export default Router;
