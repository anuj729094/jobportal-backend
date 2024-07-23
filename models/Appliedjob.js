const mongoose = require("mongoose")

const appliedjobSchema = mongoose.Schema(
    {
       studentid:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"USER"
       },
       jobid:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"JOBS" 
       },
       Status:{
        type:String,
        default:"PENDING"
       }
    },
    {
        timestamps:true
    }
)

const appliedjobs = mongoose.model("APPLIEDJOBS", appliedjobSchema)
module.exports=appliedjobs