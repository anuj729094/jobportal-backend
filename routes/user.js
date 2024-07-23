const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const companyuser = require("../models/CompanyUser")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const checkuser = require("../middleware/checkuser")

//create company users
router.post('/user', [
   body("email").matches(`@gmail.com` , 'gi').withMessage("Unvalid Email"), body("firstname").isLength({ min: 4 }).withMessage("Firstname must have at least 2 characters"), body("lastname").isLength({ min: 4 }).withMessage("lastname must have at least 2 characters"), body("password").isLength({ min: 4 }).withMessage("Password must have at least 10 characters")
], async (req, res) => {
    try {
        console.log(req.body);
        const result = validationResult(req)
        if (!result.errors.length) {
            const duplicateuserbyemail = await companyuser.findOne({ email: req.body.email })
            if (duplicateuserbyemail) {
                return res.status(409).json({ status: false, error: { email: "Email already exists" } })
            }
            const newuser = new companyuser({ ...req.body, password: await bcrypt.hash(req.body.password, 10) })
            const saveuser = await newuser.save()
            if (saveuser) {
                return res.status(201).json({ status: true, msg: "Registration Successfull" })
            }
            throw new Error("Error occured while registration")
        }
        const err = result.errors.reduce(function (acc, erritem) {
            return { ...acc, [erritem.path]: erritem.msg }
        }, {})
        return res.status(422).json({ status: false, error: err })
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })

    }
})



//login user
router.post("/company/login" , [
    body("email").notEmpty().withMessage("Required") , body("password").notEmpty().withMessage("Required")
] , async(req,res)=>{
    try {
        const result = validationResult(req)
        if(!result.errors.length){
            const checkuserwithemail = await companyuser.findOne({email:req.body.email})
            if(checkuserwithemail){
                const checkuserpassword = await bcrypt.compare(req.body.password , checkuserwithemail.password)
                if(checkuserpassword){
                   return res.status(200).json({status:true , token:jwt.sign({_id:checkuserwithemail._id} , process.env.JWT_SECRET , {expiresIn:"2h"})})
                }
                throw new Error("Invalid Credentials")
            }
            throw new Error("Invalid Credentials")
        }
        return res.status(422).json({status:false , error:result.errors.reduce(function(acc,erritem){
              return {...acc , [erritem.path]:erritem.msg}
        },{})})
    } catch (error) {
        return res.status(500).json({status:false , error:error.message})
    }
})


//get user details
router.get("/getusercompany" , checkuser, async(req,res)=>{
    try {
        console.log("getuser");
        console.log(req.user);
        const getuserbyid = await companyuser.findById({_id:req.user} , {firstname:1 , lastname:1 , email:1 , role:1})
        console.log(await companyuser.find());
        console.log(getuserbyid);
        if(getuserbyid){
            return res.status(200).json({status:true , user:getuserbyid})
        }
        throw new Error("Error occured while fetching user")
    } catch (error) {
        return res.status(500).json({status:false , error:error.message})
    }
})



//update company users
router.put("/updateuser/:id", [
    body("firstname").isLength({ min: 4 }).withMessage("Firstname must have at least 2 characters"), body("lastname").isLength({ min: 4 }).withMessage("lastname must have at least 2 characters")
], async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.errors.length) {
            const checkduplicateemail = await companyuser.findOne({ email: req.body.email })
            if (checkduplicateemail) {
                if (String(checkduplicateemail._id) !== req.params.id) {
                    return res.status(409).json({ status: false, error: { email: "Email already exists" } })
                }
                const updateuserdata = await companyuser.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true }).select("-password")
                if (updateuserdata) {
                    return res.status(200).json({ status: true, updatedata: updateuserdata })
                }
                throw new Error("Error occured while updating user data")
            }
        }
        const err = result.errors.reduce(function (acc, erritem) {
            return { ...acc, [erritem.path]: erritem.msg }
        }, {})
        return res.status(422).json({ status: false, error: err })
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})


//delete user
router.delete("/deleteuser/:id" , async(req,res)=>{
     try {
        const deleteuserbyid = await companyuser.findByIdAndDelete({_id:req.params.id})
        if(deleteuserbyid){
            return res.status(200).json({status:true})
        }
        throw new Error("Error occured while deleting user")
     } catch (error) {
        return res.status(500).json({status:false , error:error.message})
     }
})


//get comapny users
router.get("/getuser" , async(req,res)=>{
    return res.json(await companyuser.find())
})


router.delete("/deleteallusers" ,async(req,res)=>{
    await companyuser.deleteMany()
})
module.exports = router