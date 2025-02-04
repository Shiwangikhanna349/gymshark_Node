const db = require('../firebase'); // Import the Firestore instance
const { sendEmail } = require('./emailControllers'); // Import the sendEmail function

exports.orderCheck = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    // Fetch the document from Firestore
    const orderRef = db.collection('orders').doc(id); 
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderData = doc.data();
    res.json({ message: "Order data fetched successfully" });

    const { email, name, items, totalAmount } = orderData;
    await sendEmail({ body: { email, name, items, totalAmount } }, res);
  } catch (error) {
    console.error("Error fetching order data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





