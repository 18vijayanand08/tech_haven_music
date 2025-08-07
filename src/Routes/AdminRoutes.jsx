import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom';
import { UserContextAPI } from '../context/UserContext';
import Spinner from '../utilities/Spinner';

const AdminRoutes = ({children}) => {
    let {userDataFromDB} = useContext(UserContextAPI);

    // Handle loading state when userDataFromDB is null (fetching)
    if(userDataFromDB === null){
        return <Spinner />; // or return null if Spinner component is not desired
    }

    if(userDataFromDB?.role === "admin"){
        return <>{children}</>
    }else{
        return <Navigate to={"/user-profile"}/>
    }
}

export default AdminRoutes
