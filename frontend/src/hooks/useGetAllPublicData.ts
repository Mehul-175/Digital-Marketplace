import api from "@/lib/axios"
import { setAllPublicPartners, setAllPublicProducts } from "@/redux/publicSlice";
import type { AppDispatch } from "@/redux/store";
import { useEffect } from "react"
import { useDispatch } from "react-redux";

export const useGetAllPublicData = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const getAllPartners = async () => {
            try {
                const response = await api.get('/api/auth/all-partners');
                if(!response.data) return
                dispatch(setAllPublicPartners(response.data.partners ?? []))
            } catch (error) {
                console.log(error)
                dispatch(setAllPublicPartners([]))
            }
        }


        const getAllProducts = async () => {
            try {
                const response = await api.get('/api/public-product/all');
                if(!response.data) return
                dispatch(setAllPublicProducts(response.data.products ?? []))
            } catch (error) {
                console.log(error)
                dispatch(setAllPublicProducts([]))
            }
        }

        getAllPartners();
        getAllProducts();
       
    }, [dispatch])
}