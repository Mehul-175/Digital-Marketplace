import type { IAdmin, ICachedUser, IUser } from "@/App";
import api from "@/lib/axios"
import type { AppDispatch } from "@/redux/store";
import { setAdmin, setLoading, setPartner, setUser } from "@/redux/userSlice";
import { useEffect } from "react"
import { useDispatch } from "react-redux";

export const useGetCurrentUser = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('api/me')
                if(!response.data) return
                
                const currentUser: ICachedUser = response.data.user


                dispatch(setUser(currentUser))
                dispatch(setLoading(false))

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                dispatch(setLoading(false))
                dispatch(setUser(null))
            }
        }

        const fetchAdmin = async () => {
            try {
                const response = await api.get('api/auth/admin')
                if(!response.data) return
                
                const admin: IAdmin = response.data.admin

                dispatch(setAdmin(admin))

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                dispatch(setAdmin(null))
            }
        }


        const fetchPartner = async () => {
            try {
                const response = await api.get('/api/auth/partner');
                if(!response.data) return
                const partner: IUser = response.data.partner

                dispatch(setPartner(partner))

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                dispatch(setAdmin(null))
            }
        }

        fetchUser();
        fetchAdmin();
        fetchPartner();
    }, [dispatch])
}