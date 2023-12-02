import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useLocation , Link} from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,TextField
} from '@mui/material';
function BookingInterface() {

  const today = new Date().toISOString().split('T')[0];
  const handleDateInputChange = (event) => {
    
    const newDate = event.target.value;
    const dateNow = new Date();
    const selectedDate = new Date(newDate);
    console.log(dateNow)
    if (selectedDate >= dateNow) {
      
      // Fetch new booking slots for the new date
      fetchBookingSlots(newDate);
      setSelectedDate(newDate);
      // Reset the selected time slot
      setSelectedTimeSlot(null);
    } else {
      // Optionally handle attempts to select a past date
      console.log("Can't select a past date");
    }
  };
  const [bookingData, setBookingData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [noOfTables, setNoOfTables] = useState(1);
  const [foodReservation, setFoodReservation] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const restaurant = location.state?.restaurant || JSON.parse(localStorage.getItem('checkAvailability_restaurant'));
  const date = location.state?.date || localStorage.getItem('checkAvailability_date');
  const [reservationSuccess, setReservationSuccess] = useState(false); 
  const [restaurantEmail, setRestaurantEmail] = useState('');

  useEffect(() => {
    fetchRestaurantEmail();
  }, []);

  const fetchRestaurantEmail = () => {
    const restaurantId = restaurant.restaurant_id;
    
    axios.get('https://xam0fmzd13.execute-api.us-east-1.amazonaws.com/prod/getRestaurantEmail', {
      restaurantId: restaurantId
    })
    .then(response => {
      const { email } = response.data;
      console.log(response.data);
      setRestaurantEmail(email);
    })
    .catch(error => {
      console.error('Error fetching restaurant email:', error);
    });
  };


  const formatTime = (time) => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  
  useEffect(() => {
    localStorage.setItem('checkAvailability_restaurant', JSON.stringify(restaurant));
    localStorage.setItem('checkAvailability_date', date);
  
    const requestData = {
      restaurant_id: restaurant.restaurant_id,
      checkDate: date
    };
    console.log(requestData)
    fetch('https://z21l2a983l.execute-api.us-east-1.amazonaws.com/prod1/checkSlotByDate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
      .then(response => response.json())
      .then(data => {
        setBookingData(data);
        setSelectedDate(Object.keys(data)[0]); 
        console.log(selectedDate)
        console.log(bookingData[selectedDate])
        console.log(data)
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); 
  };

  const handleTimeSlotChange = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  const generateReservationId = () => {
    const timestamp = Date.now(); // current timestamp
    const randomDigits = Math.floor(Math.random() * 1000); // Generate a random three-digit number
    return Number(`${timestamp}${randomDigits}`);
  }
  const user_id= localStorage.getItem('user_id');
  const reservation_id = generateReservationId();
  const addReservation = () => {
    const reservationData = {
      "reservation_id": reservation_id,
      "reservation_status": "Pending",
      "no_of_tables": noOfTables,
      "reservation_timestamp": `${selectedDate}T${selectedTimeSlot}:00Z`,
      "updated_date": new Date().toISOString(),
      "table_size":4,
      "restaurant_id": parseInt(restaurant.restaurant_id),
      "food_reservation": foodReservation,
      "updated_by": null,
      "description": `Reservations for ${noOfTables}`,
      "user_id": localStorage.getItem('user_id')
    };

    fetch(' https://z21l2a983l.execute-api.us-east-1.amazonaws.com/prod1/add-reservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Reservation added:', data);
      setShowModal(false);
      setReservationSuccess(true);
      const mailreservationData = {
        email: restaurantEmail,
        reservation_id: reservationData.reservation_id,
        no_of_tables: reservationData.no_of_tables,
        reservation_timestamp: reservationData.reservation_timestamp,
      };
      
      axios.post("https://addreservation-upiqfrlb3a-uc.a.run.app", {
     // axios.post("https://xam0fmzd13.execute-api.us-east-1.amazonaws.com/prod/addreservation", {
        body: JSON.stringify(mailreservationData)
      })
        .then((res) => {
          console.log('Response:', res.data);
        })
        .catch((err) => {
          console.error('Error:', err.response ? err.response.data : err.message);
        });
    })
    .catch(error => console.error('Error adding reservation:', error));
  };

  const fetchBookingSlots = (date) => {
    const requestData = {
      restaurant_id: restaurant.restaurant_id,
      checkDate: date
    };
  
    //fetch('https://z21l2a983l.execute-api.us-east-1.amazonaws.com/prod1/checkSlotByDate', {
      fetch('https://checkavailaibilitybydate-upiqfrlb3a-uc.a.run.app',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
      setBookingData(data);
      console.log(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  };
return (
  <Box p={4}>
    <Typography variant="h4" gutterBottom>
      Pick a date
    </Typography>
    
      <TextField
        type="date"
        value={selectedDate}
        onChange={handleDateInputChange}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{ inputProps: { min: today } }} 
        sx={{ mb: 2 }} // Add spacing below the TextField
      />
    <Box display="flex" justifyContent="space-around" mb={3}>
      {Object.keys(bookingData).map(date => (
        <Button
          key={date}
          variant={date === selectedDate ? "contained" : "outlined"}
          color="primary"
          onClick={() => handleDateChange(date)}
        >
          {(date)}
        </Button>
      ))}
    </Box>
    {selectedDate && (
      <Box>
        <Typography variant="h5" gutterBottom>
          Pick a time
        </Typography>
        <Box display="flex" justifyContent="space-around" mb={3}>
          {selectedDate && bookingData[selectedDate] && bookingData[selectedDate].map(slot => (
            <Button
              key={slot.timeSlot}
              variant={slot.timeSlot === selectedTimeSlot ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleTimeSlotChange(slot.timeSlot)}
            >
              {(slot.timeSlot)} ({slot.availableTables} tables available)
            </Button>
          ))}
        </Box>
      </Box>
    )}
    {selectedTimeSlot && (
      <Box>
        <Typography variant="h5" gutterBottom>
          Selected Slot
        </Typography>
        <Typography variant="body1">
          {(selectedTimeSlot)}
        </Typography>
        <Typography variant="body1">
          Available tables: {
            bookingData[selectedDate]?.find(slot => slot.timeSlot === selectedTimeSlot)?.availableTables ?? 'Loading...'
          }
        </Typography>

        <Button variant="contained" color="primary" onClick={() => setShowModal(true)} sx={{ mt: 2 }}>
          Select slot
        </Button>
      </Box>
    )}
    {reservationSuccess && (
  <Alert severity="success" sx={{ mt: 2 }}>
    <div>
      Reservation added successfully. <br />
      To view the reservation details, click 
      <Link to="/viewReservation" style={{ marginLeft: '5px', color: 'green', textDecoration: 'underline' }}>
        here
      </Link>.
    </div>
  </Alert>
)}

   <Dialog open={showModal} onClose={() => setShowModal(false)}>
  <DialogTitle>Select number of tables:</DialogTitle>
  <DialogContent>
    <FormControl fullWidth>
      <InputLabel 
        id="no-of-tables"
        style={{ color: '#000', fontWeight: 'bold' }} // Adjust the color and weight as needed
      >
        Number of Tables
      </InputLabel>
      <Select
        labelId="no-of-tables"
        value={noOfTables}
        onChange={e => setNoOfTables(parseInt(e.target.value))}
        // If using a theme, you can provide a `label` prop to the Select to automatically shift the label when focused
        label="Number of Tables" 
      >
        {selectedDate && selectedTimeSlot && bookingData[selectedDate] && (
        Array.from({
          length: bookingData[selectedDate].find(slot => slot.timeSlot === selectedTimeSlot)?.availableTables || 0
        }).map((_, idx) => (
          <MenuItem key={idx} value={idx + 1}>{idx + 1}</MenuItem>
        ))
        )}
      </Select>
    </FormControl>
    {/* 
      [rest of your food item selection code]
    */}
  </DialogContent>
  <DialogActions>
    <Button variant="contained" color="primary" onClick={addReservation}>
      Add Reservation
    </Button>
    <Button variant="outlined" color="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
  </DialogActions>
</Dialog>

  </Box>
);
}

export default BookingInterface;