const admin = require("firebase-admin");
const functions = require("@google-cloud/functions-framework");
const cors = require("cors");

const serviceAccount = require("./service-account-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const processRequest = async (req, res) => {
  const { email } = req.body;


  if (!email) {
    return res.status(400).send("Missing email parameter in the request body.");
  }

  try {
    
    const db = admin.firestore();
    const usersRef = db.collection("users");
    const query = usersRef.where("email", "==", email).limit(1);

    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      return res.status(404).send("User not found.");
    }

   
    const user = querySnapshot.docs[0].data();
    const { role, name } = user;

    
    return res.status(200).json({ role, name });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).send("Error processing request.");
  }
};


const wrappedProcessRequest = (req, res) => {
  cors()(req, res, () => {
    processRequest(req, res);
  });
};


functions.http("getUserDetails", wrappedProcessRequest);
