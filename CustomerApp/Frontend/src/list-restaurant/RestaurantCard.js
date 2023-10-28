// Importing necessary modules from React
import React from 'react';
import { Link } from 'react-router-dom';

// RestaurantCard component that displays information about a restaurant
const RestaurantCard = ({ id, name, location, operationHours, numOfTables, foodMenu, imageUrl }) => {
  
  // Rendering the restaurant card
  return (
    // Linking the card to the restaurant's specific page
    <Link to={`/restaurant/${id}`} className="restaurant-card">
      {imageUrl && <img src={imageUrl} alt={name} className="restaurant-image"  style={{height:"200px", width:"100%", borderRadius:"5px"}}/>}
      <h2>{name}</h2>
      {/* <p>id: {id}</p> */}
      <p><b>Location:</b> {location}</p>
      <p><b>Operation Hours:{" "}</b>
        {operationHours.map((time, index) => (
          <span key={index}>
            {time.day} - {time.opening_time.toString().substring(0,2)}:{time.opening_time.toString().substring(2,4)} to {time.closing_time.toString().substring(0,2)}:{time.closing_time.toString().substring(2,4)}
            <br />
          </span>
        ))}
      </p>
      {/* <p>Number of Tables: {numOfTables}</p> */}
      {/* <p>Food Menu: {JSON.stringify(foodMenu)}</p> */}
      <div className="view-details">View Details</div>
    </Link>
  );
};

// Exporting the RestaurantCard component
export default RestaurantCard;
