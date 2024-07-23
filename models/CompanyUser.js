const mongoose = require("mongoose")

const companyUserSchema = mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true
        },
        lastname:{
            type:String,
            required:true
        },
        email:{
           type:String,
           required:true,
           unique:true
        },
        role:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        }
    },
    {
        timestamps: true
    }
)

const companyuser = mongoose.model("COMPANYUSER" , companyUserSchema)
module.exports=companyuser