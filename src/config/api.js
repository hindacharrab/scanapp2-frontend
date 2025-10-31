 import axios from "axios";
export const api=axios.create({
//baseURL:"http://localhost:5088/api",// url pour mon backend 
baseURL: "https://scanapp2-backend-production-df21.up.railway.app/api", // URL du backend sur Railway
Headers:{"Content-Type":"application/json"},
})





