import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "./utils/ScrollToTop";
import Login from "./auth/login";
import Signup from "./auth/signup";
import First from "./auth/first";
import DemoPage1 from "./views/DemoPage1";
import DemoPage2 from "./views/DemoPage2";
import RestaurantMenu from "./views/menu/ReservationMenu";
export function isLoggedIn() {
  const token = localStorage.getItem("userData");
  return token !== null;
}

export function Auth({ children }) {
  return isLoggedIn() ? children : null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/first" element={<First />} />
          <Route path= "/RestaurantMenu" element ={<RestaurantMenu/>} />

          {/* <Route path="/*" element={<Navigate to="/first" />} /> */}
          <Route path = '/DemoPage1' element = <Auth><DemoPage1/></Auth> />
          <Route path = '/DemoPage2' element = <Auth><DemoPage2/></Auth> />

        </Routes>
      </ScrollToTop>
    </BrowserRouter>
  );
}

export default App;
