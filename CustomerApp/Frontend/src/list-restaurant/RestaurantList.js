// Importing necessary modules from React and axios, as well as the RestaurantCard component and the CSS file
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RestaurantCard from './RestaurantCard'; // Importing the RestaurantCard component
import './styles.css'; // Importing the CSS file for styling

// RestaurantList component that fetches and displays a list of restaurants
const RestaurantList = () => {
  // Initializing the state for restaurants data
  const [restaurantsData, setRestaurantsData] = useState([]);

  // Using the useEffect hook to fetch the list of restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Fetching data from the provided API endpoint
        const response = await axios.get(
          'https://471h7c20q8.execute-api.us-east-1.amazonaws.com/Test-1/list-of-restaurants'
        );
        // Parsing the received data
        const data = JSON.parse(response.data.body.replace(/"(\s+)(\w+)(?=")/g, '"$2'));
        console.log(data); // Logging the data to the console
        // Setting the restaurants data in the state
        setRestaurantsData(data);
      } catch (error) {
        console.error('Error fetching data: ', error); // Logging an error if the data fetching fails
      }
    };

    fetchRestaurants(); // Calling the fetchRestaurants function
  }, []);

  // Rendering the list of restaurants
  return (
    <div className="list-container">
      <h1>List of Restaurants</h1> {/* Displaying the title */}
      <div className="restaurants">
        {/* Mapping through the restaurantsData and rendering each restaurant as a RestaurantCard component */}
        {restaurantsData.map((restaurant, index) => (
          <RestaurantCard
            key={index} // Using the index as the key
            id={restaurant.restaurant_id} // Passing the restaurant id
            name={restaurant.restaurant_name} // Passing the restaurant name
            location={restaurant.restaurant_location} // Passing the restaurant location
            operationHours={restaurant.restaurant_operation_details} // Passing the restaurant operation hours
            numOfTables={restaurant.restaurant_number_of_tables} // Passing the number of tables
            foodMenu={restaurant.restaurant_food_menu} // Passing the restaurant food menu
            imageUrl={restaurant.img_url} // Passing the restaurant image URL
          />
        ))}
      </div>
    </div>
  );
};

// Exporting the RestaurantList component
export default RestaurantList;
