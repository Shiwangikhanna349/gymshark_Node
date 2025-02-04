const admin = require('firebase-admin');
const db = require('../firebase');

exports.saveData = async (req, res) => {
  try {
    const docRef = await db.collection('userData').add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ message: 'Data saved', id: docRef.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
};

exports.getData=async(req,res)=>{
    try{
const snapShot=await db.collection("userData").get();
const data=snapShot.docs.map((doc)=>({id:doc.id,...doc.data()}));
res.status(200).json(data);
    }
    catch(error){
console.log("Error:",error);
res.status(500).json({error: "Failed to fetch data"})
    }
};