import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useCallback, useState } from "react";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    if(!refreshToken){
      setIsAuthorized(false)
      return;
    }

    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.data.access){
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true)
      }else{
        throw new Error("Token de acesso expirado")
      }
    } catch (error) {
      console.log("Erro ao renovar token:", error);
      localStorage.removeItem(ACCESS_TOKEN)
      localStorage.removeItem(REFRESH_TOKEN)
      setIsAuthorized(false);
    }
  }, []);

  const auth = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try{
      const decoded = jwtDecode(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        await refreshToken();      
      }else{
        setIsAuthorized(true)
      }

    }catch(error){
      console.error("Erro ao decodificar token:", error);
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      setIsAuthorized(false)
    }
  }, [refreshToken]);

  useEffect (() => {auth().catch(() => setIsAuthorized(false))}, [auth])

  if (isAuthorized === null) {
    return <div>Carregando...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
