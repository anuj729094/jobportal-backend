const express = require("express")
const router = express.Router()
const authenticate = require("../middleware/authenticateuser")
const appliedjobs = require("../models/Appliedjob")
const checkuser = require("../middleware/checkuser")


router.get("/appliedjobs" , authenticate , async(req,res)=>{
    try {
        const getappliedjobbyuserid = await appliedjobs.find({studentid:req.user.id}).populate({path:"jobid" , populate:{path:"companyid"}}).select("-studentid")
        if(getappliedjobbyuserid){
            return res.status(200).json({status:true , appliedjobs:getappliedjobbyuserid})
        }
        throw new Error("Error occured while fetching applied jobs")
    } catch (error) {
        return res.status(500).json({status:false , error:error.message})
    }
})


router.get("/applicants/:id" , checkuser , async(req,res)=>{
    try {
        const getapplicantsbyjobid = await appliedjobs.find({jobid:req.params.id} , {Status:1 , studentid:1}).populate("studentid").populate({path:"jobid" , select:"skills"})
        if(getapplicantsbyjobid){
            return res.status(200).json({status:true , applicants:getapplicantsbyjobid})
        }
        throw new Error("Error occured while fetching applicants")
    } catch (error) {
        return res.status(500).json({status:false , error:error.message})
    }
})


router.put("/applicants/:id" , checkuser , async(req,res)=>{
    try {
        console.log("put");
        console.log(req.body);
        const updateapplBicantstatus = await appliedjobs.findByIdAndUpdate({_id:req.params.id} , req.body , {new:true}).select("Status")
        if(updateapplBicantstatus){
            return res.status(200).json({status:true , updated:updateapplBicantstatus})
        }
        throw new Error("Error occured while updating status")
    } catch (error) {
        return res.status(500).json({status:false , error:error.message})
    }
})
module.exports=router


