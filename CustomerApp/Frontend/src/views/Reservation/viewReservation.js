import React, { useState, useEffect } from 'react';
import './ReservationList.css';
import axios from 'axios';


const ReservationList = () => {

    const today = new Date();
  // Format the date as "YYYY-MM-DD"
  const todayFormatted = today.toISOString().split('T')[0];
  const [restaurantNames, setRestaurantNames] = useState({});

    const userId = (localStorage.getItem('user_id'));
    console.log(userId);
    const [selectedTables, setSelectedTables] = useState(1);

    const [reservations, setReservations] = useState([]);
    const [checkDate, setCheckDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [updatingReservationId, setUpdatingReservationId] = useState(null);
    const [restaurantEmails, setRestaurantEmails] = useState({});

    const fetchRestaurantEmail = async (restaurantId) => {
        try {
            const response = await axios.get('https://xam0fmzd13.execute-api.us-east-1.amazonaws.com/prod/getRestaurantEmail', {
                restaurantId: restaurantId
            });

            if (response.data && response.data.email) {
                const { email } = response.data;
                setRestaurantEmails(prevState => ({
                    ...prevState,
                    [restaurantId]: email
                }));
            }
        } catch (error) {
            console.error(`Error fetching email for restaurant ID ${restaurantId}:`, error);
        }
    };

    const fetchAvailableSlots = async (restaurantId) => {
        const JsonBody= JSON.stringify({
            restaurant_id: restaurantId,
            checkDate: checkDate
        })
        
        try {
            //const response = await fetch('https://z21l2a983l.execute-api.us-east-1.amazonaws.com/prod1/checkSlotByDate', {
                
            const response = await fetch('https://checkavailaibilitybydate-upiqfrlb3a-uc.a.run.app', {
              method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JsonBody
            });
            const data = await response.json();
        if (data && data[checkDate]) {
            setAvailableSlots(data[checkDate]);
        } else {
            setAvailableSlots([]);
        }

        console.log(data);

        } catch (error) {
            console.error('Failed to fetch available slots', error);
        }
    };
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('https://b3irstkdylemeqtu2ep24jvtd40jsnnr.lambda-url.us-east-1.on.aws/');
        if (response.data) {
          let namesMapping = {};
          response.data.forEach(restaurant => {
            namesMapping[restaurant.restaurant_id] = restaurant.restaurant_name;
          });
          setRestaurantNames(namesMapping);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    useEffect(() => {
      fetchRestaurants();
    }, []);
    
    const updateReservation = async (reservation) => {
        console.log("updateReservation called with:", reservation);
        setUpdatingReservationId(reservation.reservation_id);
        setCheckDate(""); // Reset the date input when opening the modal
        fetchRestaurantEmail(reservation.restaurant_id);
    };

    const handleSlotChange = (event) => {
        setSelectedSlot(event.target.value);
    };

    const handleDateChange = (event) => {
        setCheckDate(event.target.value);
    };

    const handleSubmitDate = async () => {
        const reservationToUpdate = reservations.find(res => res.reservation_id === updatingReservationId);
        if (reservationToUpdate) {
            await fetchAvailableSlots(reservationToUpdate.restaurant_id);
        }
    };

    const handleSubmitUpdate = async () => {
      // Step 1: Convert date, time and restaurant_id to a timestamp
     // Assuming your time slot format is "HH:MM - HH:MM"
      const [hours, minutes] = selectedSlot.split('-')[0].trim().split(':');
    const timestamp = `${checkDate}T${hours}:${minutes}Z`;

  
      // Step 2: Prepare the updated data
      const updatedData = {
          id: updatingReservationId, // The reservation ID to update
          reservation_timestamp: timestamp,
          no_of_tables: selectedTables,  // This is hardcoded for now, adjust as needed
          updated_by: userId,
          updated_date: new Date().toISOString()
      };
  
      // Step 3: Send the updated data to the cloud function
      try {
        console.log(JSON.stringify(updatedData))
          const response = await fetch('https://us-central1-serverless-402614.cloudfunctions.net/updateReservation', {
           // const response = await fetch('https://updatereservationdescription-upiqfrlb3a-uc.a.run.app', {
           
          method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedData)
          });
          const result = await response.json();
          if (response.ok) {
              alert('Reservation updated successfully!');

              const updatedReservationData = {
                email: restaurantEmails,
                reservation_id: updatedData.reservation_id, 
                no_of_tables: updatedData.no_of_tables,
                reservation_timestamp: updatedData.reservation_timestamp,
              };
      
              await axios.post("https://xam0fmzd13.execute-api.us-east-1.amazonaws.com/prod/updateReservation", {
            
             body: JSON.stringify(updatedReservationData),
              })
              .then((res) => {
                console.log('Response:', res.data);
              })
              .catch((err) => {
                console.error('Error:', err.response ? err.response.data : err.message);
              });

          } else {
              alert('Failed to update reservation: ' + (result.error || 'Unknown error'));
          }
      } catch (error) {
          alert('Error updating reservation: ' + error.message);
      }
  
      setUpdatingReservationId(null); // Close the modal after submission
  };

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch(`https://us-central1-serverless-402614.cloudfunctions.net/viewReservation2?user_id=${userId}`, {
                //    const response = await fetch(`https://viewreservationbyresid-upiqfrlb3a-uc.a.run.app?user_id=612d37b6-14c3-4f3a-b241-5ed0d27b0df2`, {
                     
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
      const dateObj = new Date(timestamp);
      
      // Get hours and minutes in HH:mm format
      let hours = dateObj.getUTCHours();
      let minutes = dateObj.getUTCMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const timeString = `${hours}:${minutes}`;
      
      return { 
          date: dateObj.toLocaleDateString(), 
          time: timeString
      };
  };
  const canUpdateOrDelete = (reservationTimestamp) => {
    const now = new Date().getTime();
    const reservationTime = new Date(reservationTimestamp).getTime();
    // 3600000 milliseconds = 1 hour
    return reservationTime - now > 3600000;
};
const deleteReservation = async (reservationId,restaurantId) => {
    console.log(`Deleting reservation with ID: ${reservationId}`);
    try {
        fetchRestaurantEmail(restaurantId);
        const response = await axios({
            
            method: 'DELETE',
           // url: `https://us-central1-serverless-402614.cloudfunctions.net/deleteReservation`,
           url: `https://deletereservation-upiqfrlb3a-uc.a.run.app`,
            data: {
                reservation_id: reservationId
            }
        });

        if (response.status === 200) {
            alert('Reservation deleted successfully!');
    
            const deleteReservationData = {
                email: restaurantEmails,
                reservation_id: reservationId, 
              };
      
              await axios.post("https://xam0fmzd13.execute-api.us-east-1.amazonaws.com/prod/deleteReservation", {
                body: JSON.stringify(deleteReservationData),
              })
              .then((res) => {
                console.log('Response:', res.data);
              })
              .catch((err) => {
                console.error('Error:', err.response ? err.response.data : err.message);
              });
            // You may want to update your state to reflect that the reservation is deleted.
            setReservations(reservations.filter(res => res.reservation_id !== reservationId));
        } else {
            alert('Failed to delete reservation');
        }
    } catch (error) {
        console.error('Error while deleting reservation:', error);
        alert('Error while deleting reservation: ' + error.message);
    }
};


    return (
        <div className="reservation-list">
            <h1>Reservations</h1>
            <ul>
                {reservations.map(reservation => {
                    const { date, time } = convertTimestampToString(reservation.reservation_timestamp);
                    return (
                        <li key={reservation.reservation_id} className="reservation-item">
                            <p><strong>Status:</strong> {reservation.reservation_status}</p>
                            <p><strong>Date:</strong> {date}</p>
                            <p><strong>Time:</strong> {time}</p>
                            <p><strong>Restaurant:</strong>  {restaurantNames[reservation.restaurant_id] || 'Unknown'}</p>
                            <p><strong>No of tables:</strong> {reservation.no_of_tables}</p>
                            <ul className="food-list">
                                {reservation.food_reservation.map((food, index) => (
                                    <li key={index}>
                                        Item ID: {food.item_id}, Quantity: {food.quantity}
                                    </li>
                                ))}
                            </ul>
                            <button 
                              onClick={() => updateReservation(reservation)}
                                 disabled={!canUpdateOrDelete(reservation.reservation_timestamp)}
                                 title={!canUpdateOrDelete(reservation.reservation_timestamp) ? "You cannot update reservations less than 1 hour before the reservation time." : ""}
                                 className="update">
                                   Update Reservation
                              </button>

                                  <button 
                                   onClick={() => deleteReservation(reservation.reservation_id)}
                                     disabled={!canUpdateOrDelete(reservation.reservation_timestamp)}
                                 title={!canUpdateOrDelete(reservation.reservation_timestamp) ? "You cannot delete reservations less than 1 hour before the reservation time." : ""}
                                 className="delete"
                                 >
                                 Delete Reservation
                                      </button>

                            {updatingReservationId === reservation.reservation_id && (
                <div className="update-modal">
                    <h2>Update Reservation</h2>
                    <label>
                        Select Date:
                        <input 
              type="date" 
              value={checkDate} 
              onChange={handleDateChange} 
              min={todayFormatted} // Set the min attribute to today's date
            />
                    </label>
                    <button onClick={handleSubmitDate}>Check Available Slots</button>

                    {availableSlots.length > 0 && (
    <>
        <select value={selectedSlot} onChange={handleSlotChange}>
            {availableSlots.map(slot => (
                <option 
                    key={slot.timeSlot} 
                    value={slot.timeSlot}>
                        {slot.timeSlot} - {slot.availableTables} tables available
                </option>
            ))}
        </select>
        
        {/* New dropdown for selecting number of tables */}
        <select value={selectedTables} onChange={(e) => setSelectedTables(e.target.value)}>
            {[...Array(selectedSlot ? availableSlots.find(slot => slot.timeSlot === selectedSlot).availableTables : 1)].map((_, idx) => (
                <option key={idx} value={idx + 1}>
                    {idx + 1} table(s)
                </option>
            ))}
        </select>
        
        <button onClick={handleSubmitUpdate}>
    Submit Update
</button>
    </>
)}


                    <button onClick={() => setUpdatingReservationId(null)}>Cancel</button>
                </div>
            )}
                        </li>
                    );
                })}
            </ul>

           
        </div>
    );
}

export default ReservationList;
