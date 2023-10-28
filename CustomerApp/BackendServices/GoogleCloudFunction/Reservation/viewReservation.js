// Import necessary modules
const admin = require("firebase-admin");
const functions = require("@google-cloud/functions-framework");
const cors = require("cors");

// Load Firebase service account credentials
const serviceAccount = require("./serviceAccount.json");

// Initialize Firebase Admin SDK with the provided credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to handle the request to fetch reservations for a user
const processRequest = async (req, res) => {
  
  // Check if the method is GET, otherwise return an error
  if (req.method !== 'GET') {
    return res.status(400).json({ error: 'Invalid request method' });
  }

  try {
    // Get a Firestore database instance
    const db = admin.firestore();

    // Parse the user ID from the request query parameters
    const userId = parseInt(req.query.user_id, 10);

    // If user ID is not provided, return an error
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Query the "Reservation" collection to get reservations for the specified user
    const reservationsRef = db.collection('Reservation');
    const query = reservationsRef.where('user_id', '==', userId);
    const querySnapshot = await query.get();

    // Collect found reservations into an array
    const reservations = [];
    querySnapshot.forEach((doc) => {
      reservations.push(doc.data());
    });

    // Return found reservations
    return res.status(200).json({ message: 'Reservations found', reservations });
  } catch (error) {
    // Handle any errors during the process
    return res.status(500).json({ error: 'Error retrieving reservations' });
  }
};

// Function to wrap the main request handler with CORS handling
const wrappedProcessRequest = (req, res) => {
  cors()(req, res, () => {
    processRequest(req, res);
  });
};

// Expose the function to be accessible via HTTP with the name "getReservationsByUserId"
functions.http("getReservationsByUserId", wrappedProcessRequest);
