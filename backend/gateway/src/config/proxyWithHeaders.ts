import { Request } from "express";
import proxy from "express-http-proxy";

export const proxyWithHeaders = (serverUrl: string) => {
    return proxy(
        serverUrl,
        {
            proxyReqOptDecorator: (proxyReqOpts, srcReq: Request) => {
                if(srcReq.user){
                    proxyReqOpts.headers = {...proxyReqOpts.headers, 
                        "x-user-id": srcReq.user.userId.toString(),
                    }
                }

                return proxyReqOpts
            }, 
        }
    )
}