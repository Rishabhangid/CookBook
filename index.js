const express = require("express"); // importing express
const app = express(); // intitializing express for use
const dotenv = require("dotenv"); // importing ditenv file
const cors = require("cors");
dotenv.config({path:"./config.env"});  // importing dotenv file
app.use("/uploads",express.static("uploads"))  // IMPORTING CONFIG FILE

require("./db/connection");   // CONNECTING TO DATABASE
app.use(cors());             // TO DEAL WITH CORS POLICY
app.use(express.json());     // TO MAKE DATA UNDERSTABLE FOR NODEJS

// IMPORING ROUTES , IMPORTING PORT NO., STARTING SERVER
app.use(require("./routes/route"));
const PORT = process.env.PORT;
app.listen(PORT,()=>{ console.log(`Server started at Port No.: ${PORT}`); })