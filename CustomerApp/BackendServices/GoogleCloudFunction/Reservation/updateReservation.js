const admin = require("firebase-admin");
const functions = require("@google-cloud/functions-framework");
const cors = require("cors");

// Function to handle the request to update the reservation
const updateReservation = async (req, res) => {
 
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Invalid request method' });
  }

  try {
    const db = admin.firestore();
    const { reservationId, updatedReservation } = req.body;

    // Check if reservation exists
    const reservationRef = db.collection('Reservation').doc(reservationId);
    const query = reservationRef.where('reservation_id', '==', reservationId);
    const reservationSnapshot = await query.get();

    if (!reservationSnapshot.exists) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservationData = reservationSnapshot.data();


    const reservationTime = reservationData.reservation_timestamp.toDate();
    const currentTime = new Date();
    const diffInHours = (reservationTime - currentTime) / (1000 * 60 * 60);

    if (diffInHours <= 1) {
      return res.status(400).json({ error: 'Cannot update the reservation less than 1 hour before the reservation time' });
    }

    // If conditions are met, update the reservation
    await reservationRef.update(updatedReservation);

    return res.status(200).json({ message: 'Reservation updated' });
  } catch (error) {
    return res.status(500).json({ error: 'Error updating reservation' });
  }
};


const wrappedUpdateReservation = (req, res) => {
  cors()(req, res, () => {
    updateReservation(req, res);
  });
};
functions.http("updateReservation", wrappedUpdateReservation);
