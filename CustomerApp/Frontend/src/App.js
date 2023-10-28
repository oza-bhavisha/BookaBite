import React from 'react';

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "./utils/ScrollToTop";
import Router from "./Routes";


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Router/>
      </ScrollToTop>
    </BrowserRouter>
  );
}

export default App;
