import { api } from "../config/api";
export const sendScan =async(numeroBL)=>{
try{
const response = await api.post("/scans",{NumeroBL:numeroBL });
return response.data;
}catch(error){
    throw error.response?.data||error;
}
};
 export const getAllScans =async()=>{
    const response = await api.get("/scans/all");
    return response.data;
}