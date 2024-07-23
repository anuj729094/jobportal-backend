const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const details = require("../models/companydetails")
const checkuser = require("../middleware/checkuser")

//create company details
router.post("/details", checkuser, [
    body("companyname").isLength({ min: 4 }).withMessage("Company name must have at least 4 characters"), body("description").isLength({ min: 20 }).withMessage("Description must have at least 20 characters"), body("employess").isNumeric().withMessage("Invalid Value"), body("established").isDate().withMessage("Invalid Date"), body("img").isURL().withMessage("Invalid URL"), body("address").isLength({ min: 10 }).withMessage("Address must be of 10 characters")
], async (req, res) => {
    try {
        const result = validationResult(req)
        const findcompanybyuserid = await details.findOne({ userid: req.user })
        if (findcompanybyuserid) {
            throw new Error("Company exists")
        }
        if (!result.errors.length && req.user) {
            const newcompany = new details({ userid: req.user, ...req.body })
            const savecompany = await newcompany.save()
            if (savecompany) {
                return res.status(200).json({ status: true, msg: "company added successfully", company: savecompany })
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


//update company details
router.put("/updatedetails", checkuser, [
    body("companyname").isLength({ min: 4 }).withMessage("Company name must have at least 4 characters"), body("description").isLength({ min: 20 }).withMessage("Description must have at least 20 characters"), body("employes").isNumeric().withMessage("Invalid Value"), body("established").isDate().withMessage("Invalid Date")
], async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.errors.length) {
            const updatecompany = await details.findByIdAndUpdate({ _id: req.user }, req.body, { new: true })
            if (updatecompany) {
                return res.status(200).json({ status: true, updateddetail: updatecompany })
            }
            throw new Error("Error occured while updating company details")
        }
        const err = result.errors.reduce(function (acc, erritem) {
            return { ...acc, [erritem.path]: erritem.msg }
        }, {})
        return res.status(422).json({ status: false, error: err })
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})


router.get("/getcompany", checkuser, async (req, res) => {
    try {
        const getcompanybyid = await details.findOne({ userid: req.user })
        if (getcompanybyid) {
            return res.status(200).json({ status: true, company: getcompanybyid })
        }
        return res.status(200).json({ status: true, company: null })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})


router.delete("/deletecompany/:id", checkuser, async (req, res) => {
    try {
        const validatecompanybyuserid = await details.findOne({ _id: req.params.id })
        if (validatecompanybyuserid) {
            if (String(validatecompanybyuserid.userid) === req.user) {
                const deletecompany = await details.findByIdAndDelete({ _id: req.params.id })
                if (deletecompany) {
                    return res.status(200).json({ status: true, msg: "Company deleted successfully" })
                }
                throw new Error("Error occured while deleting company")
            }
            throw new Error("Invalid Action")
        }
        throw new Error("Invalid company")

    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

router.get("/getallcompany", async (req, res) => {
    return res.json(await details.find().populate("userid"))
})

module.exports = router