import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import publicSlice from "./publicSlice";
import orderSlice from "./orderSlice"

export const store = configureStore({
  reducer: {
    user: userSlice,
    public: publicSlice,
    order: orderSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;