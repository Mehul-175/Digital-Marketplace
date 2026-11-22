import { Request, Response } from "express";
import Product from "../models/product.model.js";
import redis from "../../../../shared/redis/redis.js"


export const createProduct = async (req: Request, res: Response) => {
    try {

        const partnerId = req.headers["x-user-id"] as string

        if(!partnerId){
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { title, slug, description, type, price, links, status } = req.body;

        if(!slug || !slug.trim()){
            return res.status(400).json({ message: "Slug cannot be empty" });
        }

        const clearSlug = slug.trim().toLowerCase();

        const existingProduct = await Product.findOne({
            partnerId,
            slug: clearSlug
        });


        if(existingProduct){
            return res.status(409).json({
                 field: "slug",
                 message: "Product with this slug already exists" });
        }

        const product = await Product.create({
            partnerId,
            title: title?.trim(),
            slug: clearSlug,
            description: description?.trim(),
            type,
            price,
            links,
            status: status || "draft",
        })

        await redis.del(`products:${partnerId}`);
        
        
        if(product.status === "published"){
            await redis.del("public:products");
        }



        res.status(201).json({ 
            message: "Product created successfully",
            product
        });
    } catch (error: any) {
        if(error?.code === 11000){
            return res.status(409).json({ 
                field: "slug",
                message: "Product with this slug already exists"
             });
        }
        res.status(500).json({ message: "Create product failed" });
    }
}




export const getAllPartnerProduct = async (req: Request, res: Response) =>{
    try {
        const partnerId = req.headers["x-user-id"] as string

        if(!partnerId){
            return res.status(401).json({ message: "Unauthorized" });
        }

        //From redis cache
        const cachedProducts = await redis.get(`products:${partnerId}`);

        if(cachedProducts){
            return res.status(200).json({
                source: "redis",
                products: JSON.parse(cachedProducts) });
        }

        const products = await Product.find({ partnerId });

        //set data in redis cache

        await redis.set(`products:${partnerId}`, JSON.stringify(products), "EX", 60 * 10);

        res.status(200).json({
            source: "db",
            products });
    } catch (error) {
        res.status(500).json({ message: "Failed to get partner's products" });
    }
}


export const updateProduct = async (req: Request, res: Response) => {
    try {
        const partnerId = req.headers["x-user-id"] as string

        if(!partnerId){
            return res.status(401).json({ message: "Unauthorized" });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            partnerId: partnerId
        })


        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }

        const wasPublished = product.status === "published";

        const { title, description, type, price, links, status } = req.body;

        product.title = title ?? product.title;
        product.description = description ?? product.description;
        product.type = type ?? product.type;
        product.price = price ?? product.price;
        product.links = links ?? product.links;
        product.status = status ?? product.status;

        await product.save();

        //delete redis cache
        await redis.del(`products:${partnerId}`);

        if(wasPublished || product.status === "published"){
            await redis.del("public:products");
        }

        res.status(200).json({ 
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to update product" });
    }
}


export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const partnerId = req.headers["x-user-id"] as string

        if(!partnerId){
            return res.status(401).json({ message: "Unauthorized" });
        }

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            partnerId: partnerId
        })

        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }


        //delete redis cache
        await redis.del(`products:${partnerId}`);

        if(product.status === "published"){
            await redis.del("public:products");
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete product" });
    }
}


export const getAllPublicProduct = async(req: Request, res: Response) => {
    try {
        //from cache
        const cachedData = await redis.get("public:products");
        if(cachedData) return res.status(200).json({products: JSON.parse(cachedData), source: "cache"})

        //from mongodb        
        const products = await Product.find({ status: "published" }).sort({ createdAt: -1 });

        await redis.set(
            "public:products",
            JSON.stringify(products),
            "EX",
            60 * 10,
        );

        res.status(200).json({products, source: "db"})
    } catch (error) {
        res.status(500).json({ message: "failed to get products" });
    }
}