import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

const ReservationPage = () => {
  const [reservation, setReservation] = useState({
    no_of_people: '',
    reservation_timestamp: '',
    food_reservation: [],
    rating: '',
    description: '',
    updated_by: 1, 
    updated_date: new Date().toISOString(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'food_reservation_item_id' || name === 'food_reservation_quantity') {
      const [field, index] = name.split('_');
      const updatedFoodReservation = [...reservation.food_reservation];
      updatedFoodReservation[index] = {
        ...updatedFoodReservation[index],
        [field]: value,
      };
      setReservation({
        ...reservation,
        food_reservation: updatedFoodReservation,
      });
    } else {
      setReservation({
        ...reservation,
        [name]: value,
      });
    }
  };

  const handleAddFoodReservation = () => {
    setReservation({
      ...reservation,
      food_reservation: [
        ...reservation.food_reservation,
        {
          item_id: '',
          quantity: '',
        },
      ],
    });
  };

  const addReservation = async () => {
    try {
      const response = await fetch('https://us-central1-serverless-402614.cloudfunctions.net/function-3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservation),
      });

      if (response.ok) {
        // Reservation successfully added
        console.log('Reservation added successfully');
      } else {
        console.error('Error adding reservation');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Reservation Form</h1>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="No. of People"
              name="no_of_people"
              value={reservation.no_of_people}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Reservation Timestamp"
              name="reservation_timestamp"
              value={reservation.reservation_timestamp}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        {reservation.food_reservation.map((food, index) => (
          <div key={index}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={`Food Reservation (Item ${index + 1} - Item ID)`}
                  name={`food_reservation_item_id_${index}`}
                  value={food.item_id}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={`Food Reservation (Item ${index + 1} - Quantity)`}
                  name={`food_reservation_quantity_${index}`}
                  value={food.quantity}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </div>
        ))}
        <Button variant="contained" color="primary" onClick={handleAddFoodReservation}>
          Add Food Reservation
        </Button>
        <TextField
          fullWidth
          label="Rating"
          name="rating"
          value={reservation.rating}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={reservation.description}
          onChange={handleChange}
        />
        <Button variant="contained" color="primary" onClick={addReservation}>
          Submit Reservation
        </Button>
      </form>
    </div>
  );
};

export default ReservationPage;
