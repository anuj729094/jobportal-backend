const express = require("express")
const job = require("../models/jobschema")
const { body, validationResult } = require("express-validator")
const checkuser = require("../middleware/checkuser")
const authenticate = require("../middleware/authenticateuser")
const appliedjobs = require("../models/Appliedjob")
const router = express.Router()

//create job
router.post("/job", [
    body("jobs.*.description").isLength({ min: 10 }).withMessage("Description must have at least 20 characters"), body("jobs.*.salary").isNumeric().withMessage("Invalid Value"), body("jobs.*.role").notEmpty().withMessage("Required"), body("jobs.*.location").notEmpty().withMessage("Required"), body("jobs.*.workstyle").notEmpty().withMessage("Required")
    , body("jobs.*.jobtype").notEmpty().withMessage("Required"), body("jobs.*.workstyle").notEmpty().withMessage("Required")
    , body("jobs.*.openings").notEmpty().withMessage("Required").isNumeric().withMessage("Invalid Value")
], async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.errors.length) {
            req.body.jobs.forEach(async (jobitem) => {
                const duplicatejobs = await job.findOne({
                    $and: [
                        { companyid: jobitem.companyid },
                        { role: jobitem.role },
                        { jobtype: jobitem.jobtype }
                    ]
                })
                if (!duplicatejobs) {
                    const newjob = new job(jobitem)
                    await newjob.save()
                }
            })
            return res.status(200).json({ status: true, msg: "jobs posted successfully" })
        }
        return res.status(422).json({ status: false, error: result.errors })

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message.split(" ")[0] === "E11000" ? "Duplicate entry found for job role" : error.message })
    }
})


//update job
router.put("/updatejob/:id", checkuser, [
    body("description").isLength({ min: 10 }).withMessage("Description must have at least 20 characters"), body("salary").isNumeric().withMessage("Invalid Value"), body("role").notEmpty().withMessage("Required"), body("location").notEmpty().withMessage("Required"), body("workstyle").notEmpty().withMessage("Required")
    , body("jobtype").notEmpty().withMessage("Required"), body("workstyle").notEmpty().withMessage("Required")
    , body("openings").notEmpty().withMessage("Required").isNumeric().withMessage("Invalid Value")
], async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.errors.length) {
            const updatejob = await job.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
            if (updatejob) {
                return res.status(200).json({ status: true, msg: "updated successfully", updatejob: updatejob })
            }
            throw new Error("Error occured while updating job")
        }
        const err = result.errors.reduce(function (acc, erritem) {
            return { ...acc, [erritem.path]: erritem.msg }
        }, {})
        return res.status(422).json({ status: false, error: err })
    } catch (error) {
        console.log(error.errorResponse.code);
        return res.status(500).json({ status: false, error: error.errorResponse.code === 11000 ? "Job with this role already present" : error.message })
    }
})


router.delete("/deletejob/:id", checkuser, async (req, res) => {
    try {
        const deletejob = await job.findByIdAndDelete({ _id: req.params.id })
        if (deletejob) {
            return res.status(200).json({ status: true, deletedjob: deletejob })
        }
        throw new Error("Error occured while deleting job")
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})


router.get("/getalljobs/:id", checkuser, async (req, res) => {
    try {
        const getjobs = await job.find({ companyid: req.params.id })
        if (getjobs) {
            return res.status(200).json({ status: true, jobarr: getjobs })
        }
        throw new Error("Error occured while fetching jobs")
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})


router.get("/getjobs", async (req, res) => {
    try {
        console.log(req.query);
        const obj = {}
        if (req.query.role) {
            obj.role = req.query.role
        }
        if (req.query.jobtype) {
            obj.jobtype = { $in: req.query.jobtype }
        }
        if (req.query.workstyle) {
            obj.workstyle = { $in: req.query.workstyle }
        }
        if (req.query.location) {
            obj.location = req.query.location
        }
        if(req.query.salary){
            obj.salary= {$gte: req.query.salary}
        }
        const getjobs = await job.find(obj).populate("companyid")
        if (getjobs) {
            return res.status(200).json({ status: true, jobs: getjobs })
        }
        throw new Error("Error occured while fetching jobs")
    } catch (error) {
        return res.json({ error: error })
    }
})

router.get("/check/:id", authenticate, async (req, res) => {
    try {
        const finduserexistjob = await appliedjobs.findOne({
            $and: [
                { studentid: req.user.id },
                { jobid: req.params.id }
            ]
        })
        if (finduserexistjob) {
            return res.status(200).json({ status: true, user: true })
        }
        return res.status(200).json({ status: true, user: false })
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})

router.post("/apply", authenticate, async (req, res) => {
    try {
        const applyforjob = new appliedjobs({ studentid: req.user.id, jobid: req.body.id })
        const saveapplyjob = await applyforjob.save()
        if(saveapplyjob){
            return res.status(200).json({status:true , user:true})
        }
        throw new Error("Error occured while applying jobs")
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})



module.exports = router