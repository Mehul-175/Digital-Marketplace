import mongoose, { Document } from "mongoose"



interface IProductLink {
    title: string,
    url: string
}

export interface IProduct extends Document {
    partnerId: mongoose.Types.ObjectId,
    title: string,
    slug: string,
    description: string,
    type: "course" | "source-code" | "template" | "ebook" | "ai-prompt" | "ui-kit" | "software" | "other",
    price: number,
    links: IProductLink[],
    status: "draft" | "published",

    totalSales: number,

    totalRevenue: number,
    createdAt: Date,
    updatedAt: Date
    

}



const productSchema = new mongoose.Schema<IProduct>({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ["course", "source-code", "template", "ebook", "ai-prompt", "ui-kit", "software", "other"]
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    links: [
        {
            title:{
                type: String,
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
        index: true
    },
    totalSales: {
        type: Number,
        required: true,
        default: 0
    },
    totalRevenue: {
        type: Number,
        required: true,
        default: 0
    }


}, {timestamps: true})


productSchema.index({ partnerId: 1, slug: 1 }, { unique: true });



const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product 