const mongoose = require("mongoose")

const jobSchema = mongoose.Schema(
    {
        companyid:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"COMPANYDETAILS"
        }, 
        role: {
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: true
        },
        location: {
            type: String,
            required:true
        },
        skills:[String],
        jobtype:{
            type:String,
            required:true,
            enum:["Internship" , "Full Time" , "Part Time"]
        },
        salary:{
            type:String,
            required:true
        },
        workstyle:{
            type:String,
            required:true,
            enum:["Onsite" , "Offsite"]
        },
        openings:{
            type:String,
            required:true
        }
    },
    {
        timestamps: true
    }
)

const job = mongoose.model("JOBS" , jobSchema)
module.exports=job