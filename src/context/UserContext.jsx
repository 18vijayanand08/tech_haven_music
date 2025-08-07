import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { AuthContextAPI } from './AuthContext';
import { __DB } from '../backend/firebase';

export let UserContextAPI = createContext(null);

const UserContext = ({children}) => {

    let {authUser}=useContext(AuthContextAPI)
    let [userDataFromDB,setUserDataFromDB]=useState(null)

    let fetchDataFromDB=async()=>{


        if(authUser!=null){

            try {
                let userDataReference=doc(__DB,'user_profile',authUser?.uid);

                onSnapshot(userDataReference , (user)=>{
                    if(user.exists){
                        setUserDataFromDB(user?.data())
                        // console.log(user?.data());
                    }
                })

            } catch (error) {
                toast.error(error.message)

            }
        }
    }

    let addFavorite = async (idWithPrefix) => {
        if (!authUser) {
            toast.error("You must be logged in to add favorites");
            return;
        }
        try {
            const userDocRef = doc(__DB, 'user_profile', authUser.uid);
            try {
                await updateDoc(userDocRef, {
                    favorites: arrayUnion(idWithPrefix)
                });
                toast.success("Added to favorites");
            } catch (error) {
                if (error.message.includes("No document to update")) {
                    // Create the document if it does not exist
                    await import('firebase/firestore').then(({ setDoc }) => setDoc(userDocRef, { favorites: [idWithPrefix] }));
                    toast.success("Added to favorites");
                } else {
                    throw error;
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    let removeFavorite = async (idWithPrefix) => {
        if (!authUser) {
            toast.error("You must be logged in to remove favorites");
            return;
        }
        try {
            const userDocRef = doc(__DB, 'user_profile', authUser.uid);
            try {
                await updateDoc(userDocRef, {
                    favorites: arrayRemove(idWithPrefix)
                });
                toast.success("Removed from favorites");
            } catch (error) {
                if (error.message.includes("No document to update")) {
                    // Document does not exist, nothing to remove
                    toast.error("No favorites to remove");
                } else {
                    throw error;
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(()=>{
        if(authUser == null){
            setUserDataFromDB(null);
        } else {
            fetchDataFromDB();
        }
    },[authUser])

  return <UserContextAPI.Provider value={{userDataFromDB, addFavorite, removeFavorite}}>
        {children}
  </UserContextAPI.Provider>
}

export default UserContext
