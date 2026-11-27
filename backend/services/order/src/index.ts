import express from "express"
import "dotenv/config";
import { connectDB } from "./configs/db.js";
import orderRouter from "./routes/order.routes.js";


const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.get('/health', (req, res)=>{
    res.json("order services route")
})

app.use("/", orderRouter);




app.listen(PORT, ()=>{
    console.log(`order sevices running`);
    connectDB();
})