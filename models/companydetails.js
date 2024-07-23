const mongoose = require("mongoose")

const detailSchema = mongoose.Schema(
    {   
        userid:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"COMPANYUSER"
        },
        img:{
            type:String,
            required:true
        },
        companyname: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        established:{
            type:String,
            required:true
        },
        employess:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        location:{
            type:String,
            required:true
        },
        companytype:{
            type:String,
            required:true
        }
    },
    {
        timestamps: true
    }
)

const details = mongoose.model("COMPANYDETAILS" , detailSchema)
module.exports=details