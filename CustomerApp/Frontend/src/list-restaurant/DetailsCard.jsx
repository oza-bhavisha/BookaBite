// Importing necessary modules from React and Material-UI
import React from 'react'
import { Card, CardHeader, Grid } from "@mui/material";

// DetailsCard component that takes in data as a prop
const DetailsCard = ({data}) => {
    // Rendering the card with the data passed in
        return(
        <Card>
            <Grid container  alignItems="center" style={{padding:"10px"}}>
                <Grid item xs={12}>
                <p><b>Item:</b>{data?.menu_item_name}</p>
                </Grid>
                    
                <Grid item xs={12}>
                <p><b>Category:</b>{data?.menu_category}</p>
                </Grid>
                <Grid item xs={12}>
               
                <p><b>Price:</b>{data?.menu_price}</p>
                </Grid>
                <Grid item xs={12}>
               
                <p><b>Item:</b>{data?.menu_ingrediants}</p>
                </Grid>
                <Grid item xs={12}>
               
                <p><b>Item:</b>{data?.menu_offer}</p>
                </Grid>
                 
            </Grid>
        </Card>
    )
}

// Exporting the DetailsCard component
export default DetailsCard;