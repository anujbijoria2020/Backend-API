require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const mongoose  =require("mongoose");
const authRouter = require("../complete api/routers/authRouter")
const postRouter = require("../complete api/routers/postRouter")


const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL).then(()=>{
    console.log("db connected");
}).catch((err)=>{
    console.log("error connecting in database",err);
});

app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use("/api/auth",authRouter);
app.use("/api/post",postRouter);

app.get("/", (req, res) => {
    console.log("GET request received");
    res.json({ message: "running" });
});


const PORT =5000;
app.listen(PORT, () => {
    console.log(`Connecting to the backend with port ${PORT}`);
});
