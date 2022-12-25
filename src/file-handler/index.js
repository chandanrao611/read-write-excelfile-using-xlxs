const express = require('express');
const importController = require('./controllers/importController');
const exportController = require('./controllers/exportController');

const router = express.Router();
router.post('/import', importController.importFile);
router.get('/export', exportController.exportFile);
module.exports = router;