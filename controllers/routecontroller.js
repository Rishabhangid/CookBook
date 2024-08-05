const User = require("../models/userSchema");
const Recipie = require("../models/recipieSchema");
const bcrypt = require("bcryptjs");
const jsonweb = require("jsonwebtoken");
const nodemailer = require("nodemailer")

// TESTING ROUTE
exports.testRoute = async (req, res) => {
    res.send("Tested OK.");
}

// USER REGISTER ROUTE
exports.registerUser = async (req, res) => {
    console.log("hy");
    const { name, instagram, describe, email, password } = req.body;
    console.log(name, instagram, describe, email, password);
    if (!name || !email || !password || !instagram || !describe) {      // checking if data is empty or not ans sending error and procedding to try 
        console.log("Empty Feilds.");
        res.status(400).json({ error: "Empty Feilds." });
    }
    try {
        const findemail = await User.findOne({ email: email });  // if email already exists ,throw error
        if (findemail) {
            console.log("User already registered with same email address.");
            res.status(422).json({ error: "User already exits with same email address." });
        }
        else {
            const newuser = new User({ name, instagram, describe, email, password, });  // if new email then create new data object to save in db
            const saveuser = await newuser.save();  // saving to db
            if (saveuser) {     // if saved ,throw success
                console.log("User Registered Sucesfully.");
                res.status(201).json({ message: "User Registered Sucesfully." })
            }
            else {   // if cant save to db, throw error
                console.log("Cant register the user.")
                res.status(401).json({ error: "Cant register the user." });
            }
        }
    }
    catch (error) {  // any other error ,then throw error
        console.log(error);
        res.status(500).json({ error: "Cant register the user.catch error." });
    }
}

// USER LOGIN ROUTE
exports.loginUser = async (req, res) => {
    const { email, password } = req.body; // destructring the frnted input
    if (!email || !password) {   // checking if input is not empty
        console.log("Empty Data feilds");
        res.status(400).json({ error: "Empty Data feilds" });
    }
    try {
        const finduser = await User.findOne({ email });   // finding if user registered or not
        if (!finduser) {
            console.log("The email address is not registered.");
            res.status(422).json({ error: "The email address is not registered." });
        }
        else {  // if registered then compare password , if matches then success , loggiind
            console.log("User Found.");
            const comparepassword = await bcrypt.compare(password, finduser.password);
            if (!comparepassword) {
                console.log("Wrong Password.");
                res.status(401).json({ error: "Wrong Password." });
            }
            else { // if password matched then generate token ( generatetoken function is defined in userschema)
                const token = await finduser.generateAuthToken();
                console.log(token);

                res.cookie("jwtoken", token, {  // once token generated ,sending token to browser
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: "/",
                    sameSite: "strict",
                });
                console.log("Login successful.");
                console.log("User ID:", finduser._id);
                return res.status(200).json({ message: "Login successful.", id: finduser._id }); // sending user id to dtore locally.
            }
        }

    }
    catch (error) {
        console.log("Unexpected error", error);
        res.status(500).json({ error: "Unexpected error", error });
    }
}

//Logout User
exports.logoutUser = async (req, res) => { // deleting token generated when user login 
    // res.cookie("fakeapi",token);
    console.log("Logged Out!!");
    res.clearCookie("jwtoken", { path: "/" }); // the path should be same as we set at the time of defining cookie in login route.
    res.status(200).send("User Logout");
}

// Forgot Password Code
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;  // user inputs the registered email for reset link
    if (!email) {   // checking input
        console.log("Empty Feild");
        res.status(400).json({ error: "Empty Feild" });
    }
    try {
        const findemail = await User.findOne({ email: email });  // finding user with email
        if (!findemail) {
            console.log("Email not found."); // if email not found
            res.status(422).json({ error: "Email not found." });
        }
        else {
            // console.log('Email:', process.env.EMAIL);
            // console.log('Password:', process.env.PASSWORD);

            // if email found then generating a token which is valid for only 5 min.
            const token = jsonweb.sign({ id: findemail._id }, process.env.KEY, { expiresIn: "5m" }); // Generating Temporaly Token to verify Reset Password User,expires in 5m. 
            console.log(token);

            // Code to send Reset Link to User Email
            var transporter = nodemailer.createTransport({ // nodemailer code to send the mail
                service: 'gmail',
                port: 465,
                secure: true,
                logger: true,
                debug: true,
                secureConnection: false,
                auth: {
                    user: process.env.EMAIL, // sender email password and password stored in env file
                    pass: process.env.PASSWORD
                },
                tls: {
                    rejectUnauthorized: true
                }
            });

            var mailOptions = {   // definig mail body, here we send frnted link for reset component and also sending the token to validate the user and also further in reset password route will check this tokens validity. 
                from: process.env.EMAIL,
                to: email,
                subject: 'Reset Password Link',
                // text: `http://localhost:3000/reset/${token}`  // forntend component link to open the rest page.
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <p style="color: #333;">Hello,</p>
                <p style="color: #555; font-size: 16px;">To reset your password, please click the following link:</p>
                <a href="http://localhost:3000/reset/${token}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
                <p style="color: #555; font-size: 16px;">The link is valid only for 5 minutes.</p>
                <p style="color: #555; font-size: 16px;">If you did not request a password reset, please ignore this email.</p>
                <br>
                <img src="https://drive.google.com/file/d/1TPjYT71XHStCNa1UMeRJblVOqjPK4T5G/view?usp=sharing" style="display: block; margin: 20px auto; border-radius: 10px;" alt="Example Image" />
                <p style="color: #777; font-size: 14px; text-align: center;">Best regards,<br>Your Company</p>
                </div>
                `
            };

            transporter.sendMail(mailOptions, function (error, info) {  // nodemailer error handling functtion
                if (error) {
                    console.log(error);
                    res.status(500).json({ error: "Error in sending Link." });
                } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).json({ message: "Reset Link sent to your registered email id." });
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
}

// RESET ROUTE CODE
exports.resetPassword = async (req, res) => {
    const { token } = req.params; // getting token form fronted to verify it with DB ,wheather the token is active or expired.
    const { password } = req.body; // taking users new entered password
    try {
        const verifyy = await jsonweb.verify(token, process.env.KEY);  // verifying the token come from frntend with the key we generated it
        // console.log("aaaa"); // it returns user id.
        console.log(verifyy);
        const id = verifyy.id;  // if verified then storing users id in id
        const updatepassword = await bcrypt.hash(password, 12); // hasing new password
        const updateDB = await User.findByIdAndUpdate({ _id: id }, { password: updatepassword }) // updating new password by finding user y id which we stored 
        console.log("password updated succesfully."); // success message
        return res.status(200).json({ message: "password updated." })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "error in updating password." });
    }

}

// ADD RECIPIE CONTROLLER
exports.addRecipie = async (req, res) => {
    const { RecipieName, youtube, Catagory, NumberOfIngridients, Ingredients, Procedure, CaloryCount, TimeNeedtoCook, Protein, Carbs, Fats, Sugar, Fibre, ChefID } = req.body; // destructuring name and file.
    const image = req.file; // taking input file
    console.log(image);

    console.log("reachable2");
    console.log(req.body);
    // console.log(req.file);

    // Check if any required fields are missing
    if (!RecipieName || !youtube || !Catagory || !NumberOfIngridients || !Ingredients || !Procedure || !CaloryCount || !TimeNeedtoCook || !Protein || !Carbs || !Fats || !Sugar || !Fibre || !image || !ChefID) {
        console.log("Empty feilds.");
        return res.status(400).json({ error: "Empty data fields or no file uploaded." });
    }

    try {
        const saverecipie = new Recipie({ RecipieName, youtube, Catagory, NumberOfIngridients, Ingredients, Procedure, CaloryCount, TimeNeedtoCook, Protein, Carbs, Fats, Sugar, Fibre, image: image.path, ChefID });
        await saverecipie.save(); // saving data
        if (!saverecipie) {
            return res.status(404).json({ error: 'Cant save recipie' }); // error if user not found.
        }
        console.log("Recipie Saved.");
        res.status(200).json({ message: 'Recipie added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding recipie: ' + error.message });
    }
}

// SENDING USER INFO TO USERDETAIL PAGE ALSO SECURING THE PAGE
exports.sendUserData = async (req, res) => {
    console.log("User Verified for User Detail.");
    res.send(req.rootUser);
}

// SENDING ALL RECIPIES TO SHOWCSE ON HOME PAGE
exports.sendAllRecipie = async (req, res) => {
    try {
        const fetchallrecipie = await Recipie.find();
        if (fetchallrecipie && fetchallrecipie.length > 0) {
            console.log("Recipes sent successfully.");
            res.status(200).json(fetchallrecipie);
        } else {
            console.error("No recipes found.");
            res.status(404).json({ error: "No recipes found." });
        }
    } catch (error) {
        console.error("Error fetching recipes from database:", error);
        res.status(500).json({ error: "Internal server error. Could not fetch recipes." });
    }
};

//  SENDING UNIQUE RECIIPIE WHEN USER CLCIK ON PARTICULAR RECIPIE FOR MORE DETAILS
exports.sendUniqueRecipie = async (req, res) => {
    const recipieID = req.params.recipieID;
    // console.log(recipieID);
    try {
        const findrecipie = await Recipie.find({ _id: recipieID });
        if (findrecipie) {
            console.log("recipie found.");
            const chefuser = findrecipie[0].ChefID;
            // console.log(chefuser)
            const finduser = await User.find({ _id: chefuser });
            console.log(finduser);
            console.log(findrecipie);
            res.status(200).json(findrecipie);
        }
        else {
            console.log("recipie not found.")
            res.status(404).json({ error: "Recipe not found." })
        }
    }
    catch (error) {
        console.log("error in catch.");
        console.log(error);
    }
}

// SAVING COMMENTS TO THE DB
exports.saveComment = async (req, res) => {
    const idd = req.params.id;
    const { comment } = req.body;
    console.log(comment)
    console.log(idd)

    if (!comment) {
        res.status(404).json({ error: "empty feilds." });
        console.log("empty feilds");
    }
    try {
        const newcomment = await Recipie.findByIdAndUpdate(idd, { $push: { comments: { comment } } });
        if (!newcomment) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.status(200).json({ message: 'Comment added successfully' });
        console.log("addedcomeent")

    } catch (error) {
        console.log(error);
    }
}


//  SAVING THE RECIPIE IN USER SAVED WHEN CLCIKK ON SAVE BUTTON
exports.saveIt = async (req, res) => {
    const { recipieid, id } = req.body;

    try {
        // Fetch the recipe to save
        const findrecipie = await Recipie.findById(recipieid);
        if (!findrecipie) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Fetch the user
        const finduser = await User.findById(id);
        if (!finduser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if savedrecipie is initialized
        if (!finduser.savedrecipie) {
            finduser.savedrecipie = [];
        }

        // Add the recipe to the savedrecipie array
        finduser.savedrecipie.push({ saved: findrecipie });

        // Save the updated user document
        await finduser.save();

        console.log("Recipe saved successfully");
        console.log(finduser)
        res.json(finduser);
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ error: 'Error saving recipe' });
    }
};

//SENDING RECIPIES POSTED TO USER INFO PAGE
exports.sendPosted = async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
        const findrecipie = await Recipie.find({ ChefID: id });
        if (!findrecipie) {
            console.log("no recipies found.")
        }
        else {
            console.log("recipies fpund.")
            res.status(200).json(findrecipie);
        }

    }
    catch (error) {

        console.log(error);
    }
}

//  ERROR
exports.sendSavedRecipie = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("PARAMS");
        console.log(id);

        const user = await User.findById(id).populate('savedrecipie.saved');
        if (user) {
            console.log("found");
            const savedRecipes = user.savedrecipie.map(item => item.saved);
            console.log(savedRecipes);  
            res.json(savedRecipes); // Sending the saved recipes as response
        } else {
            res.status(404).json({ message: 'User not found' }); // Handling case when user is not found
        }
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message }); // Handling any server errors
    }  
};
