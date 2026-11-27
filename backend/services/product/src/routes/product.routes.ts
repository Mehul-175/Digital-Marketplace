import { Router } from "express"
import { createProduct, deleteProduct, getAllPartnerProduct, getAllPublicProduct, handleDownload, updateProduct } from "../controllers/product.controller.js";


const productRouter = Router();

productRouter.post("/", createProduct)
productRouter.get("/", getAllPartnerProduct)
productRouter.patch("/:id", updateProduct)
productRouter.delete("/:id", deleteProduct)
productRouter.get("/all", getAllPublicProduct)
productRouter.post("/download", handleDownload)


export default productRouter