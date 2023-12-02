import React, { useState, useEffect } from "react";
import { Button, Container, Paper, TextField, Typography } from "@mui/material";
import { registerUser } from "./firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import MenuItem from "@mui/material/MenuItem";
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Signup() {
  const [selectedImage, setSelectedImage] = useState(null); // State to store the selected image file

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("Restaurant");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [contactError, setContactError] = useState("");
  const [locationError, setLocationError] = useState("");

  const showToast = (message, type) => {
    toast(message, {
      type,
      position: "top-right",
      autoClose: 5000,
    });
  };
  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]); // Stores the selected file
  };
  const handleRegister = () => {
    setEmailError("");
    setPasswordError("");

    let valid = true;
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (!valid) {
      return;
    }

    registerUser(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log("User registered:", user);
        showToast("Registration successful", "success");
        setStep(2);
      })
      .then(()=>{
        axios.post("https://xam0fmzd13.execute-api.us-east-1.amazonaws.com/prod/newRestaurantsignup",{
          email:email
        })
      })
      .catch((error) => {
        console.log(error);
        console.error("Registration error:", error.message);
        showToast("Registration failed", "error");
      });
  };

  const handleGoogleSignup = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User signed up with Google:", user);
        setEmail(user.email);
        showToast("Google signup successful", "success");
        setStep(2);
   
      })
      .catch((error) => {
        console.log(error);
        console.error("Google signup error:", error.message);
        showToast("Google signup failed", "error");
      });
  };

  const handleCompleteRegistration = async () => {
    let imageUrl = '';

    if (!selectedImage) {
      showToast("Please select an image to upload.", "warning");
      return; // Stop the registration process if no image is selected
    }
    try {
      imageUrl = await handleImageUpload(); // This will upload the image and return the URL
     console.log(imageUrl);
    } catch (error) {
      
    }


    setNameError("");
    setContactError("");
    setLocationError("");

    let valid = true;
    if (!name) {
      setNameError("Name is required");
      valid = false;
    }
    if (!contact) {
      setContactError("Contact is required");
      valid = false;
    }
    if (!location) {
      setLocationError("Location is required");
      valid = false;
    }
    if (!valid) {
      return;
    }
    const userId = uuidv4();
 // Generate a unique restaurant ID
 const generateReservationId = () => {
  const timestamp = Date.now(); // current timestamp
  const randomDigits = Math.floor(Math.random() * 1000); // Generate a random three-digit number
  return Number(`${timestamp}${randomDigits}`);
}
const restaurantId = generateReservationId();
 // Create the restaurant data object to send to the DynamoDB Lambda
 const restaurantData = {
   restaurant_id: restaurantId,
   restaurant_name: name,
   restaurant_location: location, 
   img_url: imageUrl
 };
 console.log(restaurantData)
 try {
   // Save restaurant details to DynamoDB via  Lambda (API gateway)
   const dynamoResponse = await axios.post(
     "https://aqs85q6n1m.execute-api.us-east-1.amazonaws.com/prod/dynamoUpload",
     restaurantData,
     {
       headers: {
         'Content-Type': 'application/json'
       }
     }
   );

   console.log("Restaurant information stored to DynamoDB:", dynamoResponse.data);
   showToast("Registration completed", "success");
 } catch (error) {
   console.error("Error saving restaurant information to DynamoDB:", error.message);
   showToast("Error saving restaurant details. Registration not completed.", "error");
 }

    const userData = {
      name,
      contact,
      role,
      userId,
      email,
      imageUrl,
      location,
      restaurantId
    };

    axios
      .post(
        "https://aqs85q6n1m.execute-api.us-east-1.amazonaws.com/prod/signup",
        userData
      )
      .then((response) => {
        console.log("User information stored to Firestore.");
        showToast("Registration completed", "success");

        localStorage.setItem("userData", JSON.stringify(userData));
        navigate("/RestaurantAvailabilityForm");
      })
      .catch((error) => {
        console.error("Error storing user information:", error.message);
        showToast("Registration failed", "error");
      });
  };
  const encodeImageFileAsURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      showToast("Please select an image to upload.", "warning");
      return;
    }

    try {
      const base64 = await encodeImageFileAsURL(selectedImage);
      console.log(base64)
      // Calling Lambda endpoint
      const response = await axios({
        method: 'post',
        url: ' https://oblbtb4rq7.execute-api.us-east-1.amazonaws.com/dev/uploadImage',
       //This is Raman's account url url: 'https://aqs85q6n1m.execute-api.us-east-1.amazonaws.com/prod/s3uploadlambda', // The  API Gateway endpoint
        data: JSON.stringify({
          image: base64.split(',')[1], // Remove the data URI prefix
          filename: selectedImage.name, // Include the original file name
          contentType: selectedImage.type, // Include the content type of the file
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // The Lambda function should return the URL of the uploaded image
      return response.data.imageUrl; // Make sure this matches the key in the Lambda's response
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast("Error uploading image.", "error");
    }
  };
  const backgroundStyle = {
    backgroundImage: `url('https://img.freepik.com/free-psd/chalk-italian-food-isolated_23-2150788278.jpg?w=996&t=st=1698215694~exp=1698216294~hmac=31539d2ddf91d9c22704fd02eb0c9790c7a24e572996145992c17ee604ef320f')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const logoStyle = {
    cursor: "pointer",
    marginRight: "0px",
    position: "absolute",
    top: "10px",
    left: "10px",
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "10px 10px",
    justifyContent: "center",
    height: "100vh",
  };

  const paperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
  };

  const formStyle = {
    width: "100%",
    marginTop: "20px",
  };

  const submitStyle = {
    margin: "20px 0",
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
            <Typography variant="h5">
              {step === 1 ? "Sign Up" : "Complete Registration"}
            </Typography>
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
                  label="Location"
                  name="location"
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  error={Boolean(locationError)} 
                  helperText={locationError}
                />
                <TextField
                          variant="outlined"
                          margin="normal"
                          required
                          fullWidth
                          label="Role"
                          name="role"
                          value="Restaurant" // Static value set to "Restaurant"
                          InputProps={{
                            readOnly: true, // This makes the field read-only
                            disabled: true, // This disables the field so it can't be interacted with
                          }}
                        />

                  <input
                    accept="image/*"
                    type="file"
                    onChange={handleImageChange}
                  />
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

          <button onClick={() => navigate("/login")}>Switch to Login</button>
        </Container>
      </div>
    </div>
  );
}

export default Signup;
