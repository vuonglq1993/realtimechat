const app = require('././src/app');
const connectDB = require('././src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
  });
});
