const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");  // TO HASH THE PASSWORD
const jsonweb = require("jsonwebtoken");

// USER SCHEMA
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    instagram: { type: String, required: true },
    describe: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    savedrecipie: [{
        saved:{ type: mongoose.Schema.Types.ObjectId, ref:"recipies", required: true }
    }]

});

// Password Hashing for hashing password before saving (WILL RUN BEFORE SAVING THE USER DATA IN BACKEND ONLY WHEN THEIR IS CHANGE IN PASSWORD.)
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) { // it mean jb pass chnge ho tb hi ecrypt krna he.
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

// Token Generation   generating token on login 
userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jsonweb.sign({ _id: this._id }, process.env.KEY);
        // ( database tokens = db tokens({ db token:let token }) )
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;

    }
    catch (err) { console.log(err); }
}

// MAKING SCHEMA TO USE FURTHER
const User = new mongoose.model("users", userSchema);
module.exports = User;