const express = require('express');
const fileRoutes = require('../file-handler/index');
var router = express.Router();
router.use('/fls', fileRoutes);
router.get('/', (req, res) => res.json('Welcome to APIs.'));

module.exports = router;