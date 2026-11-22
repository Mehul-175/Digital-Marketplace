import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./configs/db.js";
import productRouter from "./routes/product.route.js";
dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.get('/health', (req, res)=>{
    res.json("product services route")
})

app.use('/', productRouter);


app.listen(PORT, ()=>{
    console.log(`product sevices running`);
    connectDB();
})