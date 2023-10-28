import React, { useState, useEffect } from 'react';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const userId = 1;

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`https://us-central1-serverless-402614.cloudfunctions.net/viewReservation2?user_id=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setReservations(data.reservations);
        } else {
          console.error("Failed to fetch reservations");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchReservations();
  }, [userId]);

  const convertTimestampToString = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleString(); // or any other format you prefer
    }
    return timestamp; // for cases where timestamp is already a string or other types
  };

  return (
    <div className="reservation-list">
      <h1>Reservations</h1>
      <ul>
        {reservations.map(reservation => (
          <li key={reservation.reservation_id}>
            <h2>Reservation ID: {reservation.reservation_id}</h2>
            <p>Status: {reservation.reservation_status}</p>
            <p>Timestamp: {convertTimestampToString(reservation.reservation_timestamp)}</p>
            <p>Restaurant: {reservation.restaurant_name}</p>
            <p>Description: {reservation.description}</p>
            <ul>
              {reservation.food_reservation.map((food, index) => (
                <li key={index}>
                  Item ID: {food.item_id}, Quantity: {food.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReservationList;
