const mongoose = require("mongoose");

// const contact = { RecipieName, NumberOfIngridients, Ingredients, Procedure, CaloryCount, TimeNeedtoCook, Protien, Carbs, Fats, Sugar, Fibre , image: image.path };

// USER SCHEMA
const recipieSchema = new mongoose.Schema({

    RecipieName: { type: String, required: true },
    youtube: { type: String, required: true },
    Catagory: { type: String, required: true },
    NumberOfIngridients: { type: String, required: true },
    Ingredients: { type: String, required: true },
    Procedure: { type: String, required: true },
    CaloryCount: { type: String, required: true },
    TimeNeedtoCook: { type: String, required: true },
    Protein: { type: String, required: true },
    Carbs: { type: String, required: true },
    Fats: { type: String, required: true },
    Sugar: { type: String, required: true },
    Fibre: { type: String, required: true },
    image: { type: String, required: true },
    ChefID: { type: mongoose.Schema.Types.ObjectId, ref:"users", required: true },
    comments: [
        {
            comment:{ type: String, required: true },
        }
    ] 

});


// MAKING SCHEMA TO USE FURTHER
const Recipie = new mongoose.model("recipies", recipieSchema);
module.exports = Recipie;