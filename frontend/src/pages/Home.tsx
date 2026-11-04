import { Button } from "@/components/ui/button";
import logo from "/logo.png";
import { useState } from "react";
import {
  BookOpen,
  Code2,
  Contact,
  GraduationCap,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquare,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import api from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser, setUser } from "@/redux/userSlice";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import img from "../assets/image.png";
import { BRAND_NAME } from "@/lib/brand";

interface Categories {
  title: string;
  icon: LucideIcon;
}

const categories: Categories[] = [
  {
    title: "Courses",
    icon: GraduationCap,
  },
  {
    title: "Source Code",
    icon: Code2,
  },
  {
    title: "Templates",
    icon: LayoutTemplate,
  },
  {
    title: "Ebooks",
    icon: BookOpen,
  },
  {
    title: "AI Prompts",
    icon: MessageSquare,
  },
];

interface Step {
  number: number;
  title: string;
  desc: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Explore Products",
    desc: "Browse thousands of high-quality digital assets across multiple categories.",
  },
  {
    number: 2,
    title: "Purchase Instantly",
    desc: "Secure checkout and immediate access to your downleaded files or links",
  },
  {
    number: 3,
    title: "Sell & Earn",
    desc: "Join as a creator, upload your work, and start generating passive income.",
  },
];

const Home = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const navigate = useNavigate();

  const { user, admin } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  const googleAuth = async () => {
    const toastId = toast.loading("Signing you in...");
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const response = await api.post("/api/auth/login", { token });

      dispatch(setUser(response.data.user));
      setModelOpen(false);
      setOpenMenu(false);

      toast.success(`Welcome back, ${response.data.user?.name || "Partner"}!`, {
        id: toastId,
        description: "You have successfully signed in to SelloraAI.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Sign in failed", {
        id: toastId,
        description: "Could not authenticate with Google. Please try again.",
      });
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Signing out...");
    try {
      const response = await api.post("/api/auth/logout");
      if (response.data) {
        dispatch(logoutUser());
        setOpenMenu(false);
        toast.success("Signed out successfully", {
          id: toastId,
          description: "See you again soon!",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Logout failed", {
        id: toastId,
        description: "Something went wrong while signing out.",
      });
    }
  };

  return (
    <div className="min-h-full w-full bg-white text-slate-900">

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="logo"
              className="h-6 w-6 rounded-sm object-contain"
            />
            <span className="text-lg font-semibold tracking-tight">
              {BRAND_NAME}
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-100 text-xs font-medium text-indigo-600">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700">
                    {user?.name}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  LogOut
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setModelOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-800"
              >
                SignIn
              </Button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              aria-label="Toggle Menu"
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
            >
              {openMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {openMenu && (
            <>
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpenMenu(false)}
                className="fixed inset-0 top-15.25 z-40 h-[calc(100vh-61px)] bg-slate-900/20 backdrop-blur-xs md:hidden"
              />
              <motion.div
                key="mobile-drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "tween",
                  duration: 0.25,
                  ease: "easeInOut",
                }}
                className="fixed right-0 top-15.25 z-50 h-[calc(100vh-61px)] w-72 border-l border-slate-100 bg-white p-4 shadow-xl sm:px-6 md:hidden"
              >
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                        <AvatarFallback className="bg-indigo-600 text-xs font-semibold text-white">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900">
                            {user?.name}
                          </span>
                          {user?.role && (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium capitalize text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
                              {user.role}
                            </span>
                          )}
                        </div>
                        {user?.email && (
                          <span className="truncate text-xs text-slate-500">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-center gap-2 rounded-xl border-slate-200 py-2.5 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setOpenMenu(false);
                      setModelOpen(true);
                    }}
                    className="w-full rounded-xl bg-indigo-600 py-2.5 hover:bg-indigo-800"
                  >
                    SignIn
                  </Button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <main className="bg-linear-to-br from-indigo-50 via-white to-cyan-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 text-center md:text-left"
          >
            <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium tracking-wide text-indigo-600">
              DIGITAL MARKETEPLACE
            </span>
            <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
              Discover Premium Digital Product Built by Creators
            </h1>

            <p className="ms-auto max-w-md text-slate-600 md:mx-0">
              Buy courses, source codes, templates, AI prompts, ebooks and
              digital assets from trusted creators. Elevate your projects with
              top-tier resources.
            </p>

            <div className="flex justify-center pt-2 md:justify-start">
              {user ? (
                <Button
                  onClick={() => navigate("/partner")}
                  className="bg-indigo-600 px-6 hover:bg-indigo-700"
                >
                  Start selling your digital products
                </Button>
              ) : (
                <Button
                  onClick={() => setModelOpen(true)}
                  className="bg-indigo-600 px-6 hover:bg-indigo-700"
                >
                  Become a Partner
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl bg-white p-4 shadow-xl shadow-indigo-100 sm:p-6"
          >
            <img
              src={img}
              alt="image"
              className="w-full rounded-lg object-cover"
            />
          </motion.div>
        </div>
      </main>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-semibold text-slate-900">
            Popular Categories
          </h2>

          <p className="mt-2 text-base text-slate-500">
            Explore the most popular categories and find the perfect products
            for your project
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-5">
          {categories.map((cat, index) => {
            const Icon = cat.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex w-36 shrink-0 flex-col items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-indigo-200 sm:w-40 md:w-44"
              >
                <Icon className="h-7 w-7 text-slate-700 transition-colors hover:text-indigo-600" />

                <span className="font-mono text-xs text-slate-700 transition-colors hover:text-indigo-600">
                  {cat.title}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-indigo-50/60 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-10 text-center sm:mb-12"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              How It Works
            </h2>

            <p className="mt-2 text-base text-slate-500">
              A seamless experience for both buyers and creators
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            {steps.map((s, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative flex min-h-45 flex-col items-center text-center"
              >
                {index !== 0 && (
                  <span className="absolute right-1/2 top-5 hidden h-0.5 w-full bg-slate-300 sm:block" />
                )}

                <div className="relative z-10 mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-indigo-600 hover:text-white">
                  {s.number}
                </div>

                <h3 className="text-base font-medium text-slate-900">
                  {s.title}
                </h3>

                <div className="my-3 h-px w-28 shrink-0 bg-slate-300" />

                <p className="max-w-55 text-sm leading-6 text-slate-500">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-12 text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="logo"
              className="h-6 w-6 rounded-sm object-contain"
            />
            <span className="text-lg font-semibold tracking-tight">
              {BRAND_NAME}
            </span>
          </div>
          <p className="max-w-sm text-sm text-slate-400">
            The premier infrastructure for AI-driven commerce. Empowering
            creators globally.
          </p>
          <div className="flex text-sm items-center justify-center gap-2 text-slate-400">
            <Contact size={20} /> Email :{" "}
            <span className="font-semibold">{admin?.email}</span>
          </div>

          <div className="mt-4 w-full border-t border-slate-800 pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </div>
        </div>
      </footer>

      <Dialog open={modelOpen} onOpenChange={setModelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <img
              src={logo}
              alt="logo"
              className="h-10 w-10 rounded-md object-contain"
            />
            <DialogTitle className="mt-2 text-lg font-semibold">
              {BRAND_NAME}
            </DialogTitle>
          </DialogHeader>

          <Button
            onClick={googleAuth}
            variant="outline"
            className="mt-2 w-full gap-2"
          >
            <FcGoogle className="h-4 w-4" />
            Continue with Google
          </Button>
          <p className="mt-4 text-center text-xs text-slate-400">
            Secure Authentication by Firebase
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
