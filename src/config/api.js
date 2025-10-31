 import axios from "axios";
export const api=axios.create({
baseURL:"http://localhost:5088/api",// url pour mon backend 
Headers:{"Content-Type":"application/json"},
})
const BASE_URL = "https://scanapp2-backend-production-df21.up.railway.app/api/scans";

