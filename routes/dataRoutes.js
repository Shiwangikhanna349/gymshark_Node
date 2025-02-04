const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataControllers');

router.post('/save', dataController.saveData);
router.get('/all',dataController.getData)
module.exports = router;
