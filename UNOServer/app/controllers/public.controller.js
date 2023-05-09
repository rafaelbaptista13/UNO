const path = require('path');

// Retrieve image
exports.getImage = async (req, res) => {
  const id = req.params.id;

  const filePath = path.join(__dirname, '../public/images/trophies', `${id}.png`);
  res.sendFile(filePath);
};
