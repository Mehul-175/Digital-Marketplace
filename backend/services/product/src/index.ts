import express from "express"
import "dotenv/config";
import { connectDB } from "./configs/db.js";
import productRouter from "./routes/product.routes.js";
import internalRouter from "./routes/internal.routes.js";


const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.get('/health', (req, res)=>{
    res.json("product services route")
})

app.use('/', productRouter);
app.use('/internal', internalRouter);


app.listen(PORT, ()=>{
    console.log(`product sevices running`);
    connectDB();
})