import React, { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip} from "@mui/material";
import "./ReservationList.css";

const ReservationList = () => {
  const today = new Date();
  // Format the date as "YYYY-MM-DD"
  const todayFormatted = today.toISOString().split("T")[0];
  const [restaurantNames, setRestaurantNames] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [actionType, setActionType] = useState('');

  const resId = localStorage.getItem("restaurant_id");
  const userId = localStorage.getItem("user_id");
  console.log(resId);
  const [selectedTables, setSelectedTables] = useState(1);

  const [reservations, setReservations] = useState([]);
  const [checkDate, setCheckDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [updatingReservationId, setUpdatingReservationId] = useState(null);

  const handleOpenDialog = (reservationId, action) => {
    setCurrentReservationId(reservationId);
    setActionType(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentReservationId(null);
    setActionType('');
  };

  const confirmAction = async () => {
    await handleStatusChange(currentReservationId, actionType);
    handleCloseDialog();
    window.location.reload(); // Reload the page
  };

  const fetchAvailableSlots = async (restaurantId) => {
    const JsonBody = JSON.stringify({
      restaurant_id: restaurantId,
      checkDate: checkDate,
    });

    try {
      const response = await fetch(
        "https://z21l2a983l.execute-api.us-east-1.amazonaws.com/prod1/checkSlotByDate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JsonBody,
        }
      );
      const data = await response.json();
      if (data && data[checkDate]) {
        setAvailableSlots(data[checkDate]);
      } else {
        setAvailableSlots([]);
      }

      console.log(data);
    } catch (error) {
      console.error("Failed to fetch available slots", error);
    }
  };
  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        "https://b3irstkdylemeqtu2ep24jvtd40jsnnr.lambda-url.us-east-1.on.aws/"
      );
      if (response.data) {
        let namesMapping = {};
        response.data.forEach((restaurant) => {
          namesMapping[restaurant.restaurant_id] = restaurant.restaurant_name;
        });
        setRestaurantNames(namesMapping);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const updateReservation = async (reservation) => {
    console.log("updateReservation called with:", reservation);
    setUpdatingReservationId(reservation.reservation_id);
    setCheckDate(""); // Reset the date input when opening the modal
  };

  const handleSlotChange = (event) => {
    setSelectedSlot(event.target.value);
  };

  const handleDateChange = (event) => {
    setCheckDate(event.target.value);
  };

  const handleSubmitDate = async () => {
    const reservationToUpdate = reservations.find(
      (res) => res.reservation_id === updatingReservationId
    );
    if (reservationToUpdate) {
      await fetchAvailableSlots(reservationToUpdate.restaurant_id);
    }
  };

  const handleSubmitUpdate = async () => {
    // Step 1: Convert date, time and restaurant_id to a timestamp
    // Assuming time slot format is "HH:MM - HH:MM"
    const [hours, minutes] = selectedSlot.split("-")[0].trim().split(":");
    const timestamp = `${checkDate}T${hours}:${minutes}Z`;

    // Step 2: Prepare the updated data
    const updatedData = {
      id: updatingReservationId, 
      reservation_timestamp: timestamp,
      no_of_tables: selectedTables, 
      updated_by: userId,
      updated_date: new Date().toISOString(),
    };

    // Step 3: Send the updated data to the cloud function
    try {
      console.log(JSON.stringify(updatedData));
      const response = await fetch(
        "https://us-central1-serverless-402614.cloudfunctions.net/updateReservation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("Reservation updated successfully!");
      } else {
        alert(
          "Failed to update reservation: " + (result.error || "Unknown error")
        );
      }
    } catch (error) {
      alert("Error updating reservation: " + error.message);
    }

    setUpdatingReservationId(null); // Close the modal after submission
  };
  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `https://us-central1-sdp11-405300.cloudfunctions.net/viewReservationByResId-v2?restaurant_id=${resId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setReservations(data.reservations);
      } else {
        console.error("Failed to fetch reservations");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    

    fetchReservations();
  }, [resId]);

  const convertTimestampToString = (timestamp) => {
    const dateObj = new Date(timestamp);

    // Get hours and minutes in HH:mm format
    let hours = dateObj.getUTCHours();
    let minutes = dateObj.getUTCMinutes();
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const timeString = `${hours}:${minutes}`;

    return {
      date: dateObj.toLocaleDateString(),
      time: timeString,
    };
  };
  const canUpdateOrDelete = (reservationTimestamp) => {
    const now = new Date().getTime();
    const reservationTime = new Date(reservationTimestamp).getTime();
    // 3600000 milliseconds = 1 hour
    return reservationTime - now > 3600000;
  };

//   const approveReservation = async (reservationStatus) => {
//     console.log(`Approving reservation with : ${reservationStatus}`);
//     try {
//       const response = await axios({
//         method: "POST",
//         url: `https://us-central1-sdp11-405300.cloudfunctions.net/editReservationById`,
//         data: {
//             reservation_status: reservationStatus,
//         },
//       });

//       if (response.status === 200) {
//         alert("Reservation deleted successfully!");
//         // You may want to update your state to reflect that the reservation is deleted.
//         setReservations(
//           reservations.filter((res) => res.reservation_id !== reservationId)
//         );
//       } else {
//         alert("Failed to delete reservation");
//       }
//     } catch (error) {
//       console.error("Error while deleting reservation:", error);
//       alert("Error while deleting reservation: " + error.message);
//     }
//   };

  const handleStatusChange = async (reservationId, newStatus) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://us-central1-sdp11-405300.cloudfunctions.net/editReservationById`,
        {
          id: reservationId, // Using the passed reservationId
          reservation_status: newStatus, // Setting the status to either "approved" or "rejected"
        }
      );
      if (response.status === 200) {
        setReservations(prevReservations =>
            prevReservations.map(reservation =>
              reservation.reservation_id === reservationId
                ? { ...reservation, reservation_status: newStatus }
                : reservation
            )
          );
        setSnackbarMessage(`Reservation ${newStatus}`);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      setSnackbarMessage("Failed to update reservation");
      setSnackbarSeverity("error");
    }
    setLoading(false);
    setSnackbarOpen(true);
    handleCloseDialog();
  };
  // Define canModifyReservation function
  const canModifyReservation = (reservationTimestamp) => {
    const reservationTime = new Date(reservationTimestamp).getTime();
    return reservationTime - new Date().getTime() > 3600000; // Example condition
  };

  const deleteReservation = async (reservationId) => {
    console.log(`Deleting reservation with ID: ${reservationId}`);
    try {
      const response = await axios({
        method: "DELETE",
        url: `https://us-central1-serverless-402614.cloudfunctions.net/deleteReservation`,
        data: {
          reservation_id: reservationId,
        },
      });

      if (response.status === 200) {
        alert("Reservation deleted successfully!");
        // You may want to update your state to reflect that the reservation is deleted.
        setReservations(
          reservations.filter((res) => res.reservation_id !== reservationId)
        );
      } else {
        alert("Failed to delete reservation");
      }
    } catch (error) {
      console.error("Error while deleting reservation:", error);
      alert("Error while deleting reservation: " + error.message);
    }
  };

  return (
    <>
    <div className="reservation-list">
      <h1>Reservations</h1>
      <ul>
        {reservations.map((reservation) => {
          const { date, time } = convertTimestampToString(
            reservation.reservation_timestamp
          );
          return (
            <div key={reservation.reservation_id} >
                <Grid container className="reservation-item">
                    <Grid item xs={12}  container>
                        <Grid item xs={7} container>
              
              <CustomComp data="Status :" value={reservation.reservation_status} />
              <CustomComp data="Date :" value={date} />
              <CustomComp data="Time :" value={time} />
              <CustomComp data="Resturant :" value= {restaurantNames[reservation.restaurant_id] || "Unknown"} />
              <CustomComp data="No of tables :" value={reservation.no_of_tables} />
             
              
              <ul className="food-list">
                {reservation.food_reservation.map((food, index) => (
                  <li key={index}>
                    Item ID: {food.item_id}, Quantity: {food.quantity}
                  </li>
                ))}
              </ul>
              </Grid>
              <Grid item xs={5} container alignItems="center" justifyContent="space-evenly">
              <button
                onClick={() => updateReservation(reservation)}
                disabled={!canUpdateOrDelete(reservation.reservation_timestamp)}
                title={
                  !canUpdateOrDelete(reservation.reservation_timestamp)
                    ? "You cannot update reservations less than 1 hour before the reservation time."
                    : ""
                }
                className="update"
              >
                Update 
              </button>

              <button
                onClick={() => deleteReservation(reservation.reservation_id)}
                disabled={!canUpdateOrDelete(reservation.reservation_timestamp)}
                title={
                  !canUpdateOrDelete(reservation.reservation_timestamp)
                    ? "You cannot delete reservations less than 1 hour before the reservation time."
                    : ""
                }
                className="delete"
              >
                Delete 
              </button>
              {reservation.reservation_status != "Pending" ? (<Chip label={reservation.reservation_status} color="primary" />
                    ) : (
                      <>
                      <Button
                    onClick={() =>
                        handleOpenDialog(reservation.reservation_id, "Approve")
                    }
                    >
                    Approve
                  </Button>
                  <Button
                    onClick={() =>
                        handleOpenDialog(reservation.reservation_id, "Reject")
                    }
                  >
                    Reject
                  </Button></>)}
              </Grid>
              </Grid>
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
                  <button onClick={handleSubmitDate}>
                    Check Available Slots
                  </button>

                  {availableSlots.length > 0 && (
                    <>
                      <select value={selectedSlot} onChange={handleSlotChange}>
                        {availableSlots.map((slot) => (
                          <option key={slot.timeSlot} value={slot.timeSlot}>
                            {slot.timeSlot} - {slot.availableTables} tables
                            available
                          </option>
                        ))}
                      </select>

                      {/* New dropdown for selecting number of tables */}
                      <select
                        value={selectedTables}
                        onChange={(e) => setSelectedTables(e.target.value)}
                      >
                        {[
                          ...Array(
                            selectedSlot
                              ? availableSlots.find(
                                  (slot) => slot.timeSlot === selectedSlot
                                ).availableTables
                              : 1
                          ),
                        ].map((_, idx) => (
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

                  <button onClick={() => setUpdatingReservationId(null)}>
                    Cancel
                  </button>
                </div>
              )}
              </Grid>
            </div>
          );
        })}
      </ul>
    </div>
    {/* Confirmation Dialog */}
    <Dialog open={openDialog} onClose={handleCloseDialog}>
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to {actionType} this reservation?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseDialog}>Cancel</Button>
      <Button onClick={confirmAction} autoFocus>
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
  </>
  );
};


const CustomComp = ({data, value})=>(
    <p style={{padding:"0 10px"}}>
                <strong>{data}</strong><br/> {value}
              </p>)

export default ReservationList;
