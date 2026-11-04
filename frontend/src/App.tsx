import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import { useGetCurrentUser } from "./hooks/useGetCurrentUser"
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import Partner from "./pages/Partner";
import Admin from "./pages/Admin";
import { Toaster } from "sonner";


interface IPartnerprofile {
    slug?: string;
    bio?: string;
    website?: string;
    socialLinks?: ISocialLinks;
}

interface IPaymentDetails {
    method: "upi" | "bank";
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
}

interface ISocialLinks{
    youtube?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
}

export interface IUser {
    _id?: string;
    firebaseUid: string;
    name: string;
    email: string; 
    role: "partner" | "admin";
    partnerProfile: IPartnerprofile;

    paymentDetails: IPaymentDetails;

    totalSales: number;
    totalRevenue: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

}

export interface ICachedUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface IAdmin {
    name: string;
    email: string;
}


function App() {
  useGetCurrentUser();


  const { user, loading } = useSelector((state: RootState) => state.user);


  if(loading){
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    )
  }


  return (
    <>
      <Routes>
        <Route path="/" element={user?.role === "admin" ? ( <Navigate to="/admin" />) : <Home />} />
        <Route path="/admin" element={user?.role === "admin" ? <Admin /> : <Navigate to="/" />} />
        <Route path="/partner" element={user?.role === "partner" ? <Partner /> : (user?.role === "admin" ? <Navigate to="/admin" /> : <Navigate to="/" />)} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "border border-slate-100 bg-white text-slate-900 shadow-lg rounded-xl",
          descriptionClassName: "text-slate-500 text-xs",
        }}
      />
    </>
  )
}

export default App