import React, { useState } from "react";
import { Grid, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import img1 from "../../assets/vec2.jpeg";
import Login from "../../auth/login";
import Signup from "../../auth/signup";

const DemoPage1 = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '10px 0',
  };

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "65vh" }}
      >
        {/* <Typography variant="h5">Demo page with Navbar Layout</Typography> */}
        {/* <img
          src={img1}
          alt="Your Description"
          style={{ textAlign: "center" }}
          width={400}
        /> */}

        <div style={containerStyle}>
        {isLogin ? <Login /> : <Signup />}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </button>

      </div>
      </Grid>
    </>
  );
};

export default DemoPage1;