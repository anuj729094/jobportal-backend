const jwt = require("jsonwebtoken")

const checkuser = async (req, res, next) => {
    try {
        const token = req.headers["token"]
        if (!token || token === null || token === undefined) {
            throw new Error("Token not found")
        }
        jwt.verify(token, "jobportal", (err, user) => {
            if (err) {
                console.log(err.message);
                if (err.message === "jwt expired") {
                    throw new Error("Session Expired")
                }
                throw new Error("Invalid token")
            }
            console.log(user);
            req.user = user._id
            next()
        })
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message })
    }
}

module.exports = checkuser