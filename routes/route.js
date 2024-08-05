const express = require("express");
const router = express.Router();
const multer = require("multer"); // for img handling
const authee = require("../middleware/authee"); // middleware to verify user
const cookieParser = require("cookie-parser");  // For sending data from frnt to bckend
const {testRoute,registerUser, loginUser, forgotPassword, resetPassword, logoutUser, addRecipie, sendUserData, sendAllRecipie,sendUniqueRecipie, saveComment, saveIt, sendSavedRecipie, sendPosted} = require("../controllers/routecontroller");
router.use(express.json());  // to make data understable to express
router.use(cookieParser());  // For sending data from frnt to bckend

// TESTING ROUTE
router.get("/test",testRoute)

// USER REGISTER ROUTE
router.post("/register", registerUser);

// USER LOGIN ROUTE
router.post("/login", loginUser);

// LOGGING OUT USER
router.get("/logout", logoutUser);

// FORGOT PASSWORD ROUTE ( VERIFYNG EMAIL OF USER THEN SENDING RESET LINK )
router.post("/forgot", forgotPassword);

// RESET PASSWORD ROUTE ( AFTER USER OPENS THE RESET LINK ,AND SUBMITTING NEW PASSWORD IT WILL RUN TO UPDATE THE PASSWORD )
router.post("/resetpassword/:token", resetPassword);

// ADD RECIPIE ROUTE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory where files should be uploaded
    },
    filename: (req, file, cb) => {
        // Keep the original filename with a timestamp
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage: storage });
router.post("/addrecipie", upload.single("image"), authee, addRecipie); // the "image is the filename we have given in frontend name="image"

// AUTHENTICATION CONTROLLER
router.get("/verifyaddrecipie", authee, (req, res) => { console.log("Welcome to ContactMaster Home Page"); res.send(req.rootUser); });

// USER PROFILE Authentientcation
router.get("/getuserdata", authee, sendUserData);

// SEND ALL RECIPIES TO SHOWCASE
router.get("/allrecipies", sendAllRecipie);

// SAVING COMMENTS OF RECIPIE TO DB
router.post("/savecomment/:id", saveComment);

// GEETING UNIQUE RECIPIE CONTROLLER
router.get("/getuniquerecipie/:recipieID", sendUniqueRecipie);

// SAVING THE RECIPIE IN USER SCHEMA SAVED ON CLICKING ON SAVE BUTTON
router.put("/saveit", saveIt);

// SENDING THE POSTED RECIPIE BY USER
router.get("/sendposted/:id", sendPosted);

// ERROR
router.get("/sendSaved/:id", sendSavedRecipie);

module.exports = router;