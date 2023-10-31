import React, { useState, useEffect } from 'react';
import './availability.css';
import { useLocation } from 'react-router-dom'; 

function BookingInterface() {
  
  const [bookingData, setBookingData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [noOfTables, setNoOfTables] = useState(1);
  const [foodReservation, setFoodReservation] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const restaurant = location.state?.restaurant;
  const [reservationSuccess, setReservationSuccess] = useState(false); 
  console.log(restaurant)

  const foodItems = [
    { id: 1, quantity: 1 },
    { id: 2, quantity: 2 },
  ];
  const formatTime = (time) => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  
  useEffect(() => {

    const requestData = {
      operationHours: {
        days: ["Monday", "Tuesday", "Wednesday"],
        openingHour: 9,
        closingHour: 18
      },
      no_of_tables: 10,
      restaurant_id: 1
    };

    fetch('https://z21l2a983l.execute-api.us-east-1.amazonaws.com/prod1/checkavailability', {
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
      "user_id": 1,
      "no_of_tables": noOfTables,
      "reservation_timestamp": `${selectedDate}T${selectedTimeSlot}:00Z`,
      "updated_date": new Date().toISOString(),
      "table_size":4,
      "restaurant_id": 1,
      "food_reservation": foodReservation,
      "updated_by": user_id,
      "description": `Reservation for ${noOfTables}`
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
    })
    .catch(error => console.error('Error adding reservation:', error));
  };

  return (
    <div>
      <h2>Pick a date</h2>
      <div>
        {Object.keys(bookingData).map(date => (
           <button 
           key={date} 
           onClick={() => handleDateChange(date)}
           className={date === selectedDate ? "selected" : ""}
         >
           {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
         </button>
        ))}
      </div>
      {selectedDate && (
        <div>
          <h3>Pick a time</h3>
          {bookingData[selectedDate].map(slot => (
            <button 
              key={slot.timeSlot} 
              onClick={() => handleTimeSlotChange(slot.timeSlot)}
              className={slot.timeSlot === selectedTimeSlot ? "selected" : ""}
            >
              {slot.timeSlot} ({slot.availableTables} tables available)
            </button>
          ))}
        </div>
      )}
      {selectedTimeSlot && (
        <div>
          <h3>Selected Slot</h3>
          <p>{selectedTimeSlot}</p>
          <p>Available tables: {bookingData[selectedDate].find(slot => slot.timeSlot === selectedTimeSlot).availableTables}</p>
          <button onClick={() => setShowModal(true)}>select slot</button>
        </div>
      )}
       <div style={{ marginTop: '20px', padding: '10px', borderRadius: '5px', backgroundColor: '#4CAF50', color: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', textAlign: 'center', maxWidth: '300px', margin: '20px auto' }}>
        {reservationSuccess && <p style={{ margin: '0', fontWeight: 'bold' }}>Reservation added successfully</p>}
      </div>
      {showModal && (
        <div>
          <h4>Select number of tables:</h4>
          <select value={noOfTables} onChange={e => setNoOfTables(parseInt(e.target.value))}>
            {Array.from({ length: bookingData[selectedDate].find(slot => slot.timeSlot === selectedTimeSlot).availableTables }).map((_, idx) => (
              <option key={idx} value={idx + 1}>{idx + 1}</option>
            ))}
          </select>
          {
  /* 
  foodItems.map(item => (
    <div key={item.id}>
      <label>{item.name}: </label>
      <input type="number" min="0" onChange={e => {
        const quantity = parseInt(e.target.value);
        const updatedReservation = foodReservation.filter(fr => fr.item_id !== item.id);
        if (quantity > 0) updatedReservation.push({ item_id: item.id, quantity });
        setFoodReservation(updatedReservation);
      }} />
    </div>
  ))
  */
}
          <button onClick={addReservation}>Add Reservation</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>

        </div>
        
      )}
    </div>
  );
}

export default BookingInterface;
