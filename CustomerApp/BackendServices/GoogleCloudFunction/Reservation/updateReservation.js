// Import necessary modules
const admin = require("firebase-admin");
const functions = require("@google-cloud/functions-framework");
const cors = require("cors");

// Function to handle the request to update a reservation
const updateReservation = async (req, res) => {
 
  // Ensure the request method is POST, otherwise return an error
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Invalid request method' });
  }

  try {
    // Get a Firestore database instance
    const db = admin.firestore();

    // Destructure reservationId and updatedReservation from the request body
    const { reservationId, updatedReservation } = req.body;

    // Reference the reservation document using the provided reservationId
    const reservationRef = db.collection('Reservation').doc(reservationId);
    const query = reservationRef.where('reservation_id', '==', reservationId);

    // Fetch the reservation from Firestore
    const reservationSnapshot = await query.get();

    // Check if the reservation exists, if not, return an error
    if (!reservationSnapshot.exists) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Extract data from the reservation snapshot
    const reservationData = reservationSnapshot.data();

    // Calculate the time difference between the reservation time and current time
    const reservationTime = reservationData.reservation_timestamp.toDate();
    const currentTime = new Date();
    const diffInHours = (reservationTime - currentTime) / (1000 * 60 * 60);

    // If the reservation time is less than 1 hour away, disallow updates
    if (diffInHours <= 1) {
      return res.status(400).json({ error: 'Cannot update the reservation less than 1 hour before the reservation time' });
    }

    // If all conditions are met, update the reservation in Firestore
    await reservationRef.update(updatedReservation);

    // Send a success response
    return res.status(200).json({ message: 'Reservation updated' });
  } catch (error) {
    // Handle any errors during the process
    return res.status(500).json({ error: 'Error updating reservation' });
  }
};

// Function to wrap the main request handler with CORS handling
const wrappedUpdateReservation = (req, res) => {
  cors()(req, res, () => {
    updateReservation(req, res);
  });
};

// Expose the function to be accessible via HTTP with the name "updateReservation"
functions.http("updateReservation", wrappedUpdateReservation);
