const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        gender:{
            type:String,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
        location: {
            type: String
        },
        summary: {
            type: String,
            default:null
        },
        projects: [
            {
                title: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            }
        ],
        skills: [String],
        github: {
            type: String,
        }
    },
    {
        timestamps:true
    }

)

const user= mongoose.model("USER" , userSchema)
module.exports=user