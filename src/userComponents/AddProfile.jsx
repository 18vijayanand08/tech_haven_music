import React, { useContext, useEffect, useState } from 'react'
import { AuthContextAPI } from '../context/AuthContext'
import Spinner from '../utilities/Spinner'
import { doc, setDoc } from 'firebase/firestore'
import { __DB } from '../Backend/firebase'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'



const AddProfile = () => {
  
  let {authUser} = useContext(AuthContextAPI)

  let data = useLocation();
  let dataFromNavLink= data?.state;

  let [isLoading , setIsLoading] = useState(false)
  let {uid , email , displayName , photoURL  } = authUser || {} ;
  

  let initialUserData ={
    dob:dataFromNavLink?.dob ||"",
    contact:dataFromNavLink?.contact ||"",
    gender:dataFromNavLink?.gender ||"",
    address:dataFromNavLink?.address ||"",
    languages:dataFromNavLink?.languages ||"",
    role :"user"
  }

  let[userData,setUserData]=useState(initialUserData)

  let {dob , contact , gender , address , languages} = userData;

  let handleInputChange=(e)=>{
    let {name , value}=e.target;
    setUserData({
      ...userData , [name]:value
    })
  }

  useEffect(()=>{
    console.log(authUser);
    
  },[authUser]);

  let handleSubmit= async(e)=>{
    e.preventDefault()

    try {
      setIsLoading(true);
      if (authUser != null) {
        let payLoad = {...userData, uid ,email, photoURL , displayName}
        let user_data_collection = doc(__DB,"user_profile",uid );
        let storingDataAtDB =await setDoc(user_data_collection,payLoad)
        
        toast.success("Data stored successfully")
        setUserData(initialUserData);
      }
    } catch (error) {
      toast.error(error.message)
      
      
    }finally{
      setIsLoading(false)
    }
    
    
  }

  return (
    <section className='h-full w-full flex justify-center items-center'>
      <article className='min-h-[400px] w-[55%] bg-slate-700 py-4 rounded-md px-6'>
        <header>
          <h1 className=' text-[24px] font-semibold text-center '>Add Profile</h1>
        </header>
        <hr className='mt-1'/>
        <main className='mt-4'>
          <form action="" onSubmit={handleSubmit} className='flex flex-col gap-4'>
            {/* first row div */}
          <div className='w-full flex gap-4 '>
            {/* first aside DOB  */}
              <aside className=' flex flex-col gap-1 w-[45%]'>
              <label htmlFor="dob">Date of Birth</label>
              <input type="date" name='dob' value={dob} onChange={handleInputChange} placeholder='Enter your DOB' className=' outline-none border py-2 px-2 rounded-md' />
              </aside>
            {/*  2nd aside contact */}
              <aside className=' flex flex-col gap-1 w-[45%]'>
              <label htmlFor="contact">Contact</label>
              <input type="text" name='contact' value={contact} onChange={handleInputChange} placeholder='Enter your contact' className=' outline-none border py-2 px-2 rounded-md' />
              </aside>
          </div>


            {/* 2nd row div */}
          <div className='w-full flex gap-4 '>
            {/* first aside gender  */}
              <aside className=' flex flex-col gap-1 w-[45%]'>
              <label htmlFor="gender">Gender</label>
              <div className=' border px-2 py-2 rounded-md'>
              Male<input type='radio' name='gender' value={"male"} checked={gender === "male"} onChange={handleInputChange} placeholder='Enter your gender' className=' outline-none border py-2 px-2 rounded-md mr-2' />
              Female<input type='radio' name='gender' value={"female"} checked={gender === "Female"}  onChange={handleInputChange} placeholder='Enter your gender' className=' outline-none border py-2 px-2 rounded-md mr-2' />
              Others<input type='radio' name='gender' value={"0thers"} checked={gender === "Others"} onChange={handleInputChange} placeholder='Enter your gender' className=' outline-none border py-2 px-2 rounded-md mr-2' />
              </div>
              </aside>
            {/* second aside lnguage*/}
              <aside className=' flex flex-col gap-1 w-[45%]'>
              <label htmlFor="languages">Languages</label>
              <input type="languages" name='languages' value={languages} onChange={handleInputChange} placeholder='Enter your languages' className=' outline-none border py-2 px-2 rounded-md' />
              </aside>
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor="">Address</label>
            <textarea name="address" id="Address" value={address} onChange={handleInputChange} className='border px-2 py-2 rounded-md outline-none'></textarea>
          </div>
          <div>
            <button className='bg-blue-600 hover:bg-blue-800 w-full py-2 rounded-md'>
              Submit
            </button>
          </div>
          </form>
        </main>
      </article>
      {isLoading && <Spinner/>}
    </section>
  )
}

export default AddProfile