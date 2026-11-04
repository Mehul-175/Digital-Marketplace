import type { IUser } from "@/App";
import DashboardPanel from "@/components/partner/DashboardPanel";
import DeactivateNote from "@/components/partner/DeactivateNote";
import PartnerNav, { type PartnerTab } from "@/components/partner/PartnerNav";
import ProductPanel from "@/components/partner/ProductPanel";
import ProfilePanel from "@/components/partner/ProfilePanel";
import api from "@/lib/axios";
import type { AppDispatch, RootState } from "@/redux/store";
import { setPartner } from "@/redux/userSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";


const Partner = () => {
  const [activeTab, setActiveTab] = useState<PartnerTab>("dashboard");
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { partner } = useSelector((state: RootState) => state.user);

  if (!partner) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  if (partner.isActive === false) {
    <DeactivateNote />;
  }

  const handleUpdatePartner = async (data: IUser) => {
    try {
      setSaving(true);
      const response = await api.patch("/api/auth/partner", {
        name: data.name,
        partnerProfile : data.partnerProfile,
        paymentDetails: data.paymentDetails,
      });


      if(response.data) {
        const updatedPartner = response.data.partner;
        dispatch(setPartner(updatedPartner));
        setActiveTab("dashboard");
      }
      setSaving(false);
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
  console.error("Update partner error:", error);
  setSaving(false);

  if (
    axios.isAxiosError(error) &&
    error.response?.status === 409 &&
    error.response?.data?.field === "slug"
  ) {
    toast.error(
      error.response.data.message ||
      "This profile slug is already taken. Please choose a different one."
    );
    return;
  }

  const message = axios.isAxiosError(error)
    ? error.response?.data?.message
    : undefined;

  toast.error(message || "Something went wrong. Please try again.");
}
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PartnerNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "dashboard" ? (
        <DashboardPanel />
      ) : activeTab === "profile" ? (
        <ProfilePanel
          partner={partner}
          onSave={handleUpdatePartner}
          onCancel={() => setActiveTab("dashboard")}
          saving={saving}
        />
      ) : (
        <ProductPanel />
      )}
    </div>
  );
};

export default Partner;
