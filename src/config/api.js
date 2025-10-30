 import axios from "axios";
export const api=axios.create({
baseURL:"http://localhost:5088/api",// url pour mon backend 
Headers:{"Content-Type":"application/json"},
})