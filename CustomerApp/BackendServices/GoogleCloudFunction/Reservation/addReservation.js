// Importing required Firebase Admin SDK and CORS modules
const admin = require("firebase-admin");
const cors = require("cors");

// Importing Firebase service account credentials
const serviceAccount = require("./serviceAccount.json");

// Initializing Firebase Admin SDK with the credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to handle the addition of a new reservation
const processRequest = async (req, res) => {
 
  // Ensuring the HTTP method is POST
  if (req.method !== 'POST') {
      return res.status(400).json({ error: 'Invalid request method' });
  }

  try {
      const db = admin.firestore();
      const newReservation = req.body; // Extracting the reservation details from the request body

      // Adding the new reservation data to the "Reservation" collection
      const reservationsRef = db.collection('Reservation');
      const docRef = await reservationsRef.add(newReservation);

      // Responding with a success message and the document ID of the newly added reservation
      return res.status(201).json({ message: 'Reservation added', id: docRef.id });
  } catch (error) {
      // Handling any errors that occur during the addition of the reservation
      return res.status(500).json({ error: 'Error adding reservation' });
  }
};

// Wrapping the main function with CORS middleware to handle cross-origin requests
const wrappedProcessRequest = (req, res) => {
    cors()(req, res, () => {
        processRequest(req, res);
    });
};

// Exposing the function as an HTTP endpoint named "addReservation"
functions.http("addReservation", wrappedProcessRequest);
