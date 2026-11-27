import express from "express"
import "dotenv/config";
import cookieParser from "cookie-parser"
import { connectDB } from "./configs/db.js";


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

//internal routes
import internalRoutes from "./routes/internal.routes.js"
app.use("/internal", internalRoutes);

app.listen(PORT, ()=>{
    console.log(`auth sevices running`);
    connectDB();
})