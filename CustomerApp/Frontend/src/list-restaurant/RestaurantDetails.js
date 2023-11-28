import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";

import axios from "axios";
import { useParams } from "react-router-dom";
import DetailsCard from "./DetailsCard";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

// Defines a component for displaying restaurant details
const RestaurantDetails = () => {
  const [reservationDate, setReservationDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const { id } = useParams(); // Retrieves the restaurant ID from the URL parameters
  const navigate = useNavigate(); // Hook to navigate to different routes
  const [restaurant, setRestaurant] = useState(null); // State to hold restaurant details
  const [isReserveDialogOpen, setReserveDialogOpen] = useState(false); // State for reservation dialog visibility

  // Fetches restaurant data when the component mounts or when the id changes
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // Make a GET request to the API to fetch restaurant details
        const response = await axios.get(
          "https://hgwqqzlobd57p6bt3lwrzm4lni0rboec.lambda-url.us-east-1.on.aws/"
        );
        // Parse and clean the data received from the API
        const data = response.data;
        // Find the specific restaurant using the ID from URL parameters
        const selectedRestaurant = data.find(
          (item) => item.restaurant_id === id
        );
        setRestaurant(selectedRestaurant);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchRestaurantData();
  }, [id]); // Only re-run the effect if the `id` changes

  // Opens the reservation dialog
  const handleOpenReserveDialog = () => {
    setReserveDialogOpen(true);
  };

  // Closes the reservation dialog
  const handleCloseReserveDialog = () => {
    setReserveDialogOpen(false);
  };

  // Handles the reservation confirmation action
  const handleConfirmReservation = () => {
    setReserveDialogOpen(false);

    // Navigate to the check availability page
    navigate("/checkAvailability", {
      state: {
        restaurant: restaurant,
        date: reservationDate,
      },
    });
  };

  // Show a loading state if the restaurant data is not yet loaded
  if (!restaurant) {
    return <div>Loading...</div>;
  }

  // Render the restaurant details along with operation hours and reservation button
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {restaurant.restaurant_name} Details
      </Typography>
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            <b>Location:</b> {restaurant.restaurant_location}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <b>Operation Hours:</b>{" "}
            {restaurant.restaurant_operation_details.map((time, index) => (
              <span key={index}>
                {time.day} - {time.opening_time} to {time.closing_time}
                <br />
              </span>
            ))}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <b>Number of Tables:</b> {restaurant.restaurant_number_of_tables}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenReserveDialog}
            sx={{ mt: 2 }}
          >
            Reserve Table
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={isReserveDialogOpen}
        onClose={handleCloseReserveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" align="center">
            Reserve a Table
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText align="center" gutterBottom>
            To reserve a table at <strong>{restaurant.restaurant_name}</strong>,
            please confirm your booking details.
          </DialogContentText>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Reservation Date"
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              InputProps={{ inputProps: { min: today } }} // Set the minimum date to today
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleCloseReserveDialog}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmReservation}
            color="primary"
            autoFocus
          >
            Confirm Reservation
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        {restaurant?.restaurant_food_menu?.map((data, i) => (
          <Grid item sm={4} key={i}>
            <Paper elevation={3} sx={{ padding: 2, height: "100%" }}>
              <DetailsCard data={data} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RestaurantDetails;
