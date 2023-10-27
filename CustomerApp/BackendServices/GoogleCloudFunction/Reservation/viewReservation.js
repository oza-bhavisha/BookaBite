const admin = require("firebase-admin");
const functions = require("@google-cloud/functions-framework");
const cors = require("cors");


const serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to handle the request
const processRequest = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(400).json({ error: 'Invalid request method' });
  }

  try {
    const db = admin.firestore();

     const userId = parseInt(req.query.user_id, 10);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Query the "Reservation" collection to get reservations for the specified user
    const reservationsRef = db.collection('Reservation');
    const query = reservationsRef.where('user_id', '==', userId);
    const querySnapshot = await query.get();

    const reservations = [];
    querySnapshot.forEach((doc) => {
      reservations.push(doc.data());
    });

    return res.status(200).json({ message: 'Reservations found', reservations });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving reservations' });
  }
};


const wrappedProcessRequest = (req, res) => {
  cors()(req, res, () => {
    processRequest(req, res);
  });
};

functions.http("getReservationsByUserId", wrappedProcessRequest);
