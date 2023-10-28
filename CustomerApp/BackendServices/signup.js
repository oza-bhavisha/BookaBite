const admin = require("firebase-admin");
const functions = require("@google-cloud/functions-framework");
const cors = require("cors");

const serviceAccount = require("./service-account-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const processRequest = async (req, res) => {
  const { name, contact, role, userId, email } = req.body;

  if (!name || !contact || !role || !userId || !email) {
    return res.status(400).send("Missing required parameters in the request body.");
  }

  try {
    const db = admin.firestore();
    const data = { name, contact, role, userId,email };
    const docRef = await db.collection("users").add(data);

    return res.status(200).json({ documentId: docRef.id });
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

functions.http("processRequest", wrappedProcessRequest);
