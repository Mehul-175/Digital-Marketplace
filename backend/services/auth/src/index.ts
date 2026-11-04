import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { connectDB } from "./configs/db.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.get('/', (req, res)=>{
    res.json("auth services route")
})

import authRoutes from "./routes/auth.routes.js";
app.use("/", authRoutes);


//admin routes
import adminRoutes from "./routes/admin.routes.js";
app.use("/", adminRoutes);

//partner routes
import partnerRoutes from "./routes/partner.routes.js";
app.use("/", partnerRoutes);

app.listen(PORT, ()=>{
    console.log(`auth sevices running`);
    connectDB();
})