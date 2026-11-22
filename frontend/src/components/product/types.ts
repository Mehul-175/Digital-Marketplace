
export type ProductType = "course" | "source-code" | "template" | "ebook" | "ai-prompt" | "ui-kit" | "software" | "other"

export type ProductStatus = "draft" | "published"

export interface ProductLinkItem {
    title: string
    url: string
}


export interface Product {
    _id?: string
    partnerId?: string
    title: string
    slug: string
    description: string
    type: ProductType
    price: number
    links: ProductLinkItem[]
    status: ProductStatus
    totalSales?: number
    totalRevenue?: number
    createdAt?: string
    updatedAt?: string
}


export const PRODUCT_TYPES : { value: ProductType; label: string }[] = [
    { value: "course", label: "Course" },
    { value: "source-code", label: "Source Code" },
    { value: "template", label: "Template" },
    { value: "ebook", label: "Ebook" },
    { value: "ai-prompt", label: "AI Prompt" },
    { value: "ui-kit", label: "UI Kit" },
    { value: "software", label: "Software" },
    { value: "other", label: "Other" },
]