/* eslint-disable react-refresh/only-export-components */
import { collection, getDocs } from 'firebase/firestore';
import React, { createContext, useEffect, useState } from 'react'
import { __DB } from '../backend/firebase';
import toast from 'react-hot-toast';

export let AlbumContextAPI = createContext(null);

const AlbumContext = ({children}) => {

    let [allAlbums , setAllAlbums]=useState(null)

    let fetchAlbumsData = async()=>{
        try {
            let AlbumDataCollectionRf = collection(__DB,'album_collections')

            let AlbumDataFromDB = await getDocs(AlbumDataCollectionRf);

            let AllAlbumsFromDB = AlbumDataFromDB?.docs.map((doc)=>({
                id:doc.id, ...doc?.data()
            })) 
            setAllAlbums(AllAlbumsFromDB)
            
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(()=>{
        fetchAlbumsData();
    },[])

  return <AlbumContextAPI.Provider value={{allAlbums}}>
    {children}
  </AlbumContextAPI.Provider>
}

export default AlbumContext
