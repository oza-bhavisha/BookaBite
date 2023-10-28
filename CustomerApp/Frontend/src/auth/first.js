import React, { useState } from 'react'
import Login from './login';
import Signup from './signup';
import logo from "../assets/logo.png";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const First = () => {

    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '10px 10px',
      justifyContent: 'center',
      height: '100vh'
    };

    const backgroundStyle = {
        backgroundImage: `url('https://img.freepik.com/free-psd/chalk-italian-food-isolated_23-2150788278.jpg?w=996&t=st=1698215694~exp=1698216294~hmac=31539d2ddf91d9c22704fd02eb0c9790c7a24e572996145992c17ee604ef320f')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      };

      const logoStyle = {
        cursor: 'pointer',
        marginRight: '0px',
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
      };

  return (
    <div style={backgroundStyle}>    
    <img
    src={logo}
    alt=""
    width={200}
    onClick={() => {
      navigate("/");
    }}
    style={logoStyle}
  />
    <div style={containerStyle}>
    {isLogin ? <Login /> : <Signup />}
    <button onClick={() => setIsLogin(!isLogin)}>
      {isLogin ? 'Switch to Register' : 'Switch to Login'}
    </button>
  </div>
  </div>
  )
}

export default First