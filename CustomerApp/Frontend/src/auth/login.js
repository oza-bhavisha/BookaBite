import React, { useState, useEffect } from 'react';
import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; 
import { auth } from './firebase';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import CryptoJS from 'crypto-js';
import AWS from 'aws-sdk';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  AWS.config.update({
    accessKeyId: 'ASIA6A2O43PEFEQN3XGW', 
    secretAccessKey: 'efeajwJJnbdH0K/ghl/EU0ild6lcVLirNpXoU7PH', 
    sessionToken: 'FwoGZXIvYXdzEH0aDAqGT8R9KHQMOBoO7CLAAdQhGmNTyx9faNNbqtzEjRXamA1LBTNF1H6aOfPeYkkWHypmotk6AK9A87yGcmoyyV+47iJDUa/+zF1otRH90xX5BWRZSgmvYFNpPV441i2ekZj3wKHfsGNwcVpH1CnF/rUsbpMpWqDn/1UpUT7LiIY7yTwuCEgSfqwA5NCdHTbXU1dUpeTllxTQKp1U/64rRmILAm6d3Fo34BgaRC5iYyyjgEWgU9/c9//66rAS45pwsvMj9KH0S4rV9XMbifED7SiXmfCpBjItLk13kzV2Zmx+SZoOaLP2ZX2RjSB+kRD1qMN69SI4JL5bJOZJ3Gj/nz0+lHXE',
    region: 'us-east-1', 
  });

  const [kmsKeyArn] = useState('arn:aws:kms:us-east-1:your-aws-account-id:key/your-key-id-or-alias'); 
  const [kmsClient, setKmsClient] = useState(null);

  useEffect(() => {
    const kms = new AWS.KMS({ region: 'us-east-1' }); 
    setKmsClient(kms);
  }, []);

  const showToast = (message, type) => {
    toast(message, {
      type, 
      position: 'top-right',
      autoClose: 5000, 
    });
  };

  const handleEmailPasswordLogin = () => {
    setEmailError('');
    setPasswordError('');

    let valid = true;
    if (!email) {
      setEmailError('Email is required');
      valid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    if (!valid) {
      return;
    }

    const params = {
      KeyId: kmsKeyArn,
      KeySpec: 'AES_256', 
    };

    kmsClient.generateDataKey(params, (err, data) => {
      if (err) {
        console.error('Error generating data key:', err);
        showToast('Login failed', 'error');
      } else {
        const encryptedDataKey = data.CiphertextBlob; 
        const plaintextDataKey = data.Plaintext; 

      
        const encryptedEmail = CryptoJS.AES.encrypt(email, plaintextDataKey).toString();

       
        makeAPIRequest(encryptedEmail, encryptedDataKey);
      }
    });

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User logged in with email and password:', user);
        showToast('Login successful', 'success');
        makeAPIRequest(email);
      })
      .catch((error) => {
        console.error('Email/password login error:', error.message);
        showToast('Login failed', 'error');
      });
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User logged in with Google:', user);
        showToast('Login with Google successful', 'success');
        makeAPIRequest(user.email);
      })
      .catch((error) => {
        console.error('Google login error:', error.message);
        showToast('Login with Google failed', 'error');
      });
  };

  const makeAPIRequest = (email) => {
    const apiUrl = 'https://dd0kk3kq5f.execute-api.us-east-1.amazonaws.com/prod/get-role';
    const requestBody = { email };

    axios
      .post(apiUrl, requestBody)
      .then((response) => {
        const data = response.data;
        console.log('API Response:', data);
        localStorage.setItem('userData', JSON.stringify(data));
        navigate('/DemoPage1');
      })
      .catch((error) => {
        console.error('API request error:', error);
      });
  };

  const paperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  };

  const formStyle = {
    width: '100%',
    marginTop: '20px',
  };

  const submitStyle = {
    margin: '20px 0',
  };

  return (
    <div>
    <Container component="main" maxWidth="xs">

      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h5">Login</Typography>
        <form style={formStyle} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(emailError)}
            helperText={emailError}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(passwordError)}
            helperText={passwordError}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            style={submitStyle}
            onClick={handleEmailPasswordLogin}
          >
          
            Sign In with Email/Password
          </Button>
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            style={submitStyle}
            onClick={handleGoogleLogin}
          >
            Sign In with Google
          </Button>
        </form>
      </Paper>

      <ToastContainer /> 
    </Container>
    </div>
  );
}

export default Login;
