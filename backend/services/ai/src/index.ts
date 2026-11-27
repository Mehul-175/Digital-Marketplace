import express from "express"
import "dotenv/config";
import aiRouter from "./routes/ai.routes.js";


const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.get('/health', (req, res)=>{
    res.json("ai service route")
})

app.use('/', aiRouter);


app.listen(PORT, ()=>{
    console.log(`ai service running`);
})