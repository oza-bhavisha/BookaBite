// Importing necessary modules from React, axios, and react-router-dom, as well as the DetailsCard component and Material-UI components
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DetailsCard from './DetailsCard'; // Importing the DetailsCard component
import { Grid, Typography, Box, Card, CardContent, Paper } from '@mui/material';

// RestaurantDetails component to display detailed information about a specific restaurant
const RestaurantDetails = () => {
  // Using the useParams hook to get the id from the route parameters
  const { id } = useParams();
  // Initializing the restaurant state
  const [restaurant, setRestaurant] = useState(null);

  // Using the useEffect hook to fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // Fetching data from the provided API endpoint
        const response = await axios.get('https://471h7c20q8.execute-api.us-east-1.amazonaws.com/Test-1/list-of-restaurants');
        // Parsing the received data
        const data = JSON.parse(response.data.body.replace(/"(\s+)(\w+)(?=")/g, '"$2'));
        // Finding the selected restaurant based on the id
        const selectedRestaurant = data.find((item) => item.restaurant_id === id);
        // Setting the restaurant state
        setRestaurant(selectedRestaurant);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchRestaurantData();
  }, [id]);

  // Rendering a loading message if the restaurant data is not yet fetched
  if (!restaurant) {
    return <div>Loading...</div>;
  }

  // Rendering the detailed information about the restaurant
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {restaurant.restaurant_name} Details
      </Typography>
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          {/* Displaying the restaurant's location, operation hours, and number of tables */}
          <Typography variant="subtitle1" gutterBottom>
            <b>Location:</b> {restaurant.restaurant_location}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <b>Operation Hours:</b>{' '}
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
        </CardContent>
      </Card>
      {/* Displaying the restaurant's food menu using the DetailsCard component */}
      <Grid container spacing={3}>
        {restaurant?.restaurant_food_menu?.map((data, i) => (
          <Grid item sm={4} key={i}>
            <Paper elevation={3} sx={{ padding: 2, height: '100%' }}>
              <DetailsCard data={data} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Exporting the RestaurantDetails component
export default RestaurantDetails;
