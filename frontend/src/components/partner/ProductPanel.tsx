import { useEffect, useState } from "react";
import CreateProductForm from "../product/CreateProductForm";
import EditProductForm from "../product/EditProductForm";
import type { Product } from "../product/types";
import ProductsList from "../product/ProductsList";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { RootState } from "@/redux/store";
import CompleteProfile from "./CompleteProfile";
import { useSelector } from "react-redux";

type view = "list" | "create" | "edit";

const ProductPanel = () => {
  const [view, setView] = useState<view>("list");
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { partner } = useSelector((state: RootState) => state.user);

  const isProfileComplete = () => {
    if (!partner) {
      return false;
    }

    // -------------------------------
    // Basic partner information
    // -------------------------------

    if (!partner.name?.trim()) {
      return false;
    }

    if (!partner.partnerProfile?.slug?.trim()) {
      return false;
    }

    // -------------------------------
    // Payment information
    // -------------------------------

    const payment = partner.paymentDetails;

    if (!payment) {
      return false;
    }

    if (!payment.accountHolderName?.trim()) {
      return false;
    }

    // -------------------------------
    // UPI
    // -------------------------------

    if (payment.method === "upi") {
      if (!payment.upiId?.trim()) {
        return false;
      }
    }

    // -------------------------------
    // BANK
    // -------------------------------

    if (payment.method === "bank") {
      if (!payment.accountNumber?.trim()) {
        return false;
      }

      if (!payment.ifscCode?.trim()) {
        return false;
      }
    }

    return true;
  };

  const profileComplete = isProfileComplete();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/product");
      if (response.data) setProducts(response.data.products ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const gotoList = () => {
    setSelectedProduct(null);
    setView("list");
  };

  const handleCreate = async (product: Product) => {
    try {
      setCreating(true);
      const response = await api.post("/api/product", product);

      setProducts(prev => [...prev, response.data.product]);

      gotoList();
      toast.success("Product Created");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = async (product: Product) => {
    setSelectedProduct(product);
    setView("edit");
  };

  const handleSaveEdit = async (updated: Product) => {
    try {
      setUpdating(true);
      const response = await api.patch(`/api/product/${updated._id}`, updated);

      if (response.data) {
        setProducts(prev =>
          prev.map(product =>
            product._id === updated._id ? response.data.product : product,
          ),
        );

        gotoList();
      }
      toast.success("Product Updated.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("Update product error", error);

      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setUpdating(false);
    }

  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(`/api/product/${product._id}`);

      if (response.data.success) {
        setProducts(prev => prev.filter(p => p._id !== product._id));

        gotoList();
      }
      toast.success("deleted");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("Delete product error", error);

      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="
        h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        />
      </div>
    );
  }

  if (!profileComplete) return <CompleteProfile />;

  return (
    <div className="min-h-screen bg-slate-50">
      {view === "create" && (
        <CreateProductForm
          onCreate={handleCreate}
          onCancel={gotoList}
          loading={creating}
        />
      )}

      {view === "list" && (
        <ProductsList
          products={products}
          onCreateClick={() => setView("create")}
          onEditClick={handleEditClick}
          onDeleteClick={handleDelete}
        />
      )}

      {view === "edit" && selectedProduct && (
        <EditProductForm
          product={selectedProduct}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          onCancel={gotoList}
          loading={updating}
        />
      )}
    </div>
  );
};

export default ProductPanel;
