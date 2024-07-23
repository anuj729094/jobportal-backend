const express = require("express")
const router = express.Router()
const user = require("../models/userschema")
const bcryptjs = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
const authenticate = require("../middleware/authenticateuser")


//create user
router.post("/createuser", [
    body("email").matches(`@gmail.com` , 'gi').withMessage("Invalid Email"), body("password").isLength({ min: 5 }).withMessage("password should be of minimum 5 characters"), body("fullname").isLength({ min: 2 }).withMessage("Minimum 2 characters required"), body("lastname").isLength({ min: 2 }).withMessage("Minimum 2 characters required")
], async (req, res) => {
    try {
        console.log(req.body);
        const finduserbyemail = await user.findOne({ email: req.body.email })
        if (finduserbyemail) {
            return res.status(409).json({ status: false, error: "User Exists" })
        }
        else {
            const result = validationResult(req)
            if (!result.errors.length) {
                const newuser = new user({ ...req.body, password: await bcryptjs.hash(req.body.password, 10) })
                const saveuser = await newuser.save()
                if (saveuser) {
                    return res.status(201).json({ status: true, msg: "User Registered Successfully" })
                }
            }
            else {
                const err = result.errors.reduce((acc, item) => {
                    return { ...acc, [item.path]: item.msg }
                }, {})
                return res.status(403).json({ status: false, error: err })
            }
        }

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})


router.post("/login", async (req, res) => {
    try {
        console.log(req.body);
        const finduserbyemail = await user.findOne({ email: req.body.email })
        if (finduserbyemail) {
            const checkpassword = await bcryptjs.compare(req.body.password, finduserbyemail.password)
            console.log(checkpassword);
            if (checkpassword) {
                const token = jwt.sign({ id: finduserbyemail._id }, process.env.JWT_SECRET, { expiresIn: "2h" })
                return res.status(200).json({ status: true, msg: "login successfull", token: token })
            }
            else {
                throw new Error("Invalid Credentials")
            }
        }
        else {
            throw new Error("Invalid Credentials")
        }
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})


router.get("/getuser", authenticate, async (req, res) => {
    try {
        const finduserbyid = await user.findById({ _id: req.user.id }).select("-password")
        if (finduserbyid) {
            return res.status(200).json({ status: true, user: finduserbyid })
        }
        else {
            throw new Error("Error occured while fetching user")
        }
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})

router.get("/getusers", async (req, res) => {
    try {
        return res.json(await user.find())
    } catch (error) {
        console.log(error);
    }
})


router.delete("/deleteuser", async () => {
    try {
        await user.deleteMany()
    } catch (error) {
        console.log(error);
    }
})


//add project , update project , deleteproject 
router.put("/project/:id", [
    body("projects.*.url").isURL().withMessage("Invalid URL"), body("projects.*.title").isLength({ min: 5 }).withMessage("Title shoulde be of mininmum 5 characters"), body("projects.*.description").isLength({ min: 10 }).withMessage("Description should be of mininmum 10 characters")
], async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.errors.length) {
            const addproject = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
            if (addproject) {
                console.log(addproject);
                return res.status(200).json({ status: true, msg: "data updated successfully", project: addproject })
            }
        }
        else {
            return res.json({
                status: false, error: result.errors.reduce((acc, erritem) => {
                    return { ...acc, [erritem.path.split(".")[1]]: erritem.msg }
                }, {})
            })
        }
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })

    }
})

router.put("/summary/:id", [
    body("summary").isLength({ min: 20 }).withMessage("Summary should be minimum of 20 characters")
], async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.errors.length) {
            const addproject = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
            if (addproject) {
                return res.status(200).json({ status: true, msg: "data updated successfully", project: addproject })
            }
        }
        else {
            return res.json({
                status: false, error: result.errors.reduce((acc, erritem) => {
                    return { ...acc, [erritem.path]: erritem.msg }
                }, {})
            })
        }
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })

    }
})

router.put("/skills/:id", async (req, res) => {
    try {
        const addproject = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        if (addproject) {
            return res.status(200).json({ status: true, msg: "data updated successfully", project: addproject })
        }
        else {
            throw new Error("Error occured while adding skills")
        }
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })

    }
})


router.put("/github/:id", [
    body("github").isURL().matches('github.com', 'gi').withMessage("Invalid URL")
], async (req, res) => {
    try {
        console.log(req.body);
        const result = validationResult(req)
        console.log(result);
        if(!req.body.github){
            const addproject = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
            if (addproject) {
                return res.status(200).json({ status: true, msg: "data updated successfully", project: addproject })
            }
        }
        else if (!result.errors.length) {
            const findgithub = await user.findOne({ github: req.body.github })
            if (findgithub) {
                if (String(findgithub._id) === String(req.params.id)) {
                    const addproject = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
                    if (addproject) {
                        console.log(addproject);
                        return res.status(200).json({ status: true, msg: "data updated successfully", project: addproject })
                    }
                }
                else {
                    throw new Error("Github URL already exists")
                }
            }
            else {
                const addproject = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
                if (addproject) {
                    console.log(addproject);
                    return res.status(200).json({ status: true, msg: "data updated successfully", project: addproject })
                }
            }
        }
        else {
            return res.json({
                status: false, error: result.errors.reduce((acc, erritem) => {
                    return { ...acc, [erritem.path]: erritem.msg }
                }, {})
            })
        }
    } catch (error) {
        return res.json({ status: false, error: error.messsage })
    }

})
//updateuser
router.put("/updateuser/:id", authenticate, [
    body("phone").isNumeric().withMessage("Invalid Number"), body("gender").isLength({ min: 1 }).withMessage("Please provide gender")
], async (req, res) => {
    try {
        const result = validationResult(req)
        if (!result.errors.length) {
            const finduerbynumber = await user.findOne({ phone: req.body.phone })
            if (finduerbynumber) {
                if (String(finduerbynumber._id) !== String(req.body.id)) {
                    return res.status(409).json({ status: false, error: "Number already registered" })
                }
                else {
                    const updateuser = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
                    if (updateuser) {
                        return res.status(200).json({ status: true, msg: "updated successfully", user: updateuser })
                    }
                }
            }
            else {
                const updateuser = await user.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
                if (updateuser) {
                    return res.status(200).json({ status: true, msg: "updated successfully", user: updateuser })
                }
            }
        }
        else {
            const err = result.errors.reduce((acc, erritem) => {
                return { ...acc, [erritem.path]: erritem.msg }
            }, {})
            return res.status(403).json({ status: false, error: err })
        }

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
})



module.exports = router