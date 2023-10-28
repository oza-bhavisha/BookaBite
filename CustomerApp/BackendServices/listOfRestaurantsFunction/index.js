// Importing the necessary AWS SDK module
const AWS = require('aws-sdk');
// Creating an instance of the DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Lambda function that scans a DynamoDB table and returns the data
exports.handler = async (event, context) => {
    // Setting the parameters for the scan operation
    const params = {
        TableName: 'restaurants' // Replace 'restaurants' with your actual DynamoDB table name
    };

    try {
        // Scanning the DynamoDB table and storing the result in the data variable
        const data = await dynamoDB.scan(params).promise();
        // Returning a successful response with the scanned data
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items), // Returning the scanned items in the body
            headers: {
                'Content-Type': 'application/json', // Setting the content type to JSON
            },
        };
    } catch (error) {
        // Returning an error response in case of an error
        return {
            statusCode: 500,
            body: JSON.stringify(error.message), // Returning the error message in the body
            headers: {
                'Content-Type': 'application/json', // Setting the content type to JSON
            },
        };
    }
};
