/* eslint-disable react-refresh/only-export-components */
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react"
import { __AUTH } from "../Backend/firebase";

 
export let AuthContextAPI= createContext();  

const AuthContext = ({children}) => {

    let [authUser,setAuthUser]=useState(null)

    useEffect(()=>{
        onAuthStateChanged(__AUTH,(user)=>{
            if(user?.emailVerified && user?.accessToken){
                setAuthUser(user)
                window.localStorage.setItem("TOKEN",user?.accessToken)
            }else{
                setAuthUser(null)
                window.localStorage.clear()
            }
        })
    },[])

  return <AuthContextAPI.Provider value={{authUser , setAuthUser}}>
    {children}
  </AuthContextAPI.Provider>
}

export default AuthContext