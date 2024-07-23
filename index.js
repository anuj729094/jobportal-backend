require("dotenv").config()
const express = require("express")
const connection = require("./connectToDb/db")
const app = express()
const cors = require("cors")
const port = 5000
app.use(cors({credentials:true , origin:[process.env.ORIGIN_1,process.env.ORIGIN_2]}))
connection()
app.use(express.json())
app.get('/', (req, res) => {
    return res.json({ msg: "Server started" })
})

app.use(require("./routes/student"))
app.use(require("./routes/user"))
app.use(require("./routes/details"))
app.use(require("./routes/Job"))
app.use(require("./routes/applied"))

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})