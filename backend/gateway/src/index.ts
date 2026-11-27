import express from 'express'
import "dotenv/config";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import proxy from 'express-http-proxy';
import cors from 'cors';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { getCurrentUser } from './controllers/user.controller.js';
import { proxyWithHeaders } from './config/proxyWithHeaders.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const PORT = process.env.PORT;

app.get('/', (req, res)=>{
    res.json("Routes working");
})
app.get('/api/me', authMiddleware, getCurrentUser);

app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL as string))
app.use('/api/product', authMiddleware, proxyWithHeaders(process.env.PRODUCT_SERVICE_URL as string))
app.use('/api/public-product', proxy(process.env.PRODUCT_SERVICE_URL as string))
app.use('/api/order', proxy(process.env.ORDER_SERVICE_URL as string))
app.use('/api/partner/order', authMiddleware, proxyWithHeaders(process.env.ORDER_SERVICE_URL as string))

app.listen(PORT, ()=>{
    console.log(`Gateway Server running`);
})