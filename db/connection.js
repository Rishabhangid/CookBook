// CONNECTING TO THE DATABSE
const mongoose = require("mongoose");
const DB = process.env.DB;
mongoose.connect(DB).then(res=>console.log("Database Connected.")).catch(error=>console.log("Cant connect to database", error))