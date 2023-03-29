const multer = require('multer');
// Set up multer middleware to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;