const mongoose = require("mongoose")

const connection = async()=>{
    try {
        const data = await mongoose.connect(process.env.MONGODB_URL)
        if(data){
            console.log("Successfully connected to database");
        }
    } catch (error) {
         console.log(error);
    }
}
module.exports=connection