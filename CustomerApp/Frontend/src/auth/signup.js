import React, { useState, useEffect } from 'react';
import { Button, Container, Paper, TextField, Typography } from '@mui/material';
import { registerUser } from './firebase'; 
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import axios from 'axios'; 
import { v4 as uuidv4 } from 'uuid'; 
import MenuItem from '@mui/material/MenuItem'; 
import { toast, ToastContainer } from 'react-toastify';
import CryptoJS from 'crypto-js';
import AWS from 'aws-sdk';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { decryptDataKey, decryptData } from './decryption';
import logo from "../assets/logo.png";
import Login from './login';
function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('customer'); 
  const [step, setStep] = useState(1); 
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [contactError, setContactError] = useState('');

  AWS.config.update({
    accessKeyId: 'ASIA6A2O43PEFEQN3XGW', 
    secretAccessKey: 'efeajwJJnbdH0K/ghl/EU0ild6lcVLirNpXoU7PH', 
    sessionToken: 'FwoGZXIvYXdzEH0aDAqGT8R9KHQMOBoO7CLAAdQhGmNTyx9faNNbqtzEjRXamA1LBTNF1H6aOfPeYkkWHypmotk6AK9A87yGcmoyyV+47iJDUa/+zF1otRH90xX5BWRZSgmvYFNpPV441i2ekZj3wKHfsGNwcVpH1CnF/rUsbpMpWqDn/1UpUT7LiIY7yTwuCEgSfqwA5NCdHTbXU1dUpeTllxTQKp1U/64rRmILAm6d3Fo34BgaRC5iYyyjgEWgU9/c9//66rAS45pwsvMj9KH0S4rV9XMbifED7SiXmfCpBjItLk13kzV2Zmx+SZoOaLP2ZX2RjSB+kRD1qMN69SI4JL5bJOZJ3Gj/nz0+lHXE',
    region: 'us-east-1',  
  });

  const [kmsKeyArn] = useState('arn:aws:kms:us-east-1:963848756168:key/1a0d89cc-fe03-463e-a19a-364a7a49c878'); 
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

  const handleRegister = () => {
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

    registerUser(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log('User registered:', user);
        showToast('Registration successful', 'success');
        setStep(2);
      })
      .catch((error) => {
        console.error('Registration error:', error.message);
        showToast('Registration failed', 'error');
      });
  };

  const handleGoogleSignup = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User signed up with Google:', user);
        setEmail(user.email);
        showToast('Google signup successful', 'success');
        setStep(2);
      })
      .catch((error) => {
        console.error('Google signup error:', error.message);
        showToast('Google signup failed', 'error');
      });
  };

  const handleCompleteRegistration = () => {
    setNameError('');
    setContactError('');

    let valid = true;
    if (!name) {
      setNameError('Name is required');
      valid = false;
    }
    if (!contact) {
      setContactError('Contact is required');
      valid = false;
    }

    if (!valid) {
      return;
    }

    const params = {
      KeyId: kmsKeyArn,
      KeySpec: 'AES_256',
    };

    kmsClient.generateDataKey(params, async (err, data) => {
      if (err) {
        console.error('Error generating data key:', err);
        showToast('Registration failed', 'error');
      } else {
        const plaintextDataKey = await decryptDataKey(data.CiphertextBlob.toString('base64'), kmsClient);
        const encryptedName = CryptoJS.AES.encrypt(name, plaintextDataKey).toString();
        const encryptedContact = CryptoJS.AES.encrypt(contact, plaintextDataKey).toString();
        const encryptedEmail = CryptoJS.AES.encrypt(email, plaintextDataKey).toString();

        const userId = uuidv4();
        const userData = {
          name: encryptedName,
          contact: encryptedContact,
          role,
          userId,
          email: encryptedEmail,
        };

        axios.post('https://dd0kk3kq5f.execute-api.us-east-1.amazonaws.com/prod/signup', userData)
          .then(() => {
            console.log('User information stored to Firestore.');
            showToast('Registration completed', 'success');
            navigate('/DemoPage1');
            localStorage.setItem('userData', JSON.stringify({
              name: decryptData(encryptedName, plaintextDataKey),
              contact: decryptData(encryptedContact, plaintextDataKey),
              role,
              userId,
              email: decryptData(encryptedEmail, plaintextDataKey),
            }));
          })
          .catch((error) => {
            console.error('Error storing user information:', error.message);
            showToast('Registration failed', 'error');
          });
      }
    });
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


  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '10px 10px',
    justifyContent: 'center',
    height: '100vh'
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
  
    <Container component="main" maxWidth="xs" style={containerStyle}>
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h5">{step === 1 ? 'Sign Up' : 'Complete Registration'}</Typography>
        <form style={formStyle} noValidate>
          {step === 1 && (
            <>
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
                autoComplete="new-password"
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
                onClick={handleRegister}
              >
                Sign Up
              </Button>
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                style={submitStyle}
                onClick={handleGoogleSignup}
              >
                Sign Up with Google
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={Boolean(nameError)}
                helperText={nameError}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Contact"
                name="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                error={Boolean(contactError)}
                helperText={contactError}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Role"
                name="role"
                select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                style={submitStyle}
                onClick={handleCompleteRegistration}
              >
                Complete Registration
              </Button>
            </>
          )}
        </form>
      </Paper>
      <ToastContainer /> 
          
    <button onClick={() => navigate('/login')}>
      Switch to Login
    </button>
  
    </Container>
    
    </div>
    </div>
  );
}

export default Signup;
