import React, { useContext, useState } from 'react'
import { AuthContextAPI } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Spinner from '../utilities/Spinner'
import { updateProfile } from 'firebase/auth'

const UpdateProfile = () => {
  let {authUser,setAuthUser} = useContext(AuthContextAPI)
  let [imageFile , setImageFile] = useState(null)
  let [imagePreview , setImagePreview ] = useState(null)
  let [isLoading,setIsLoading]=useState(false)

  let handleInputChange = (e)=>{
    let file = e.target.files[0]

    if(file){
      let imageURL = URL.createObjectURL(file)
      setImagePreview(imageURL)
      setImageFile(file)
    }
  }

  let handleSubmit =async(e)=>{
    e.preventDefault()

    try {
      setIsLoading(true)
      let imageFormData = new FormData();
    
    imageFormData.append("file",imageFile);
    imageFormData.append("upload_preset","tech_haven_music");
    imageFormData.append("cloud_name","drmjqysow");

    let cloudinaryResponse = fetch("https://api.cloudinary.com/v1_1/drmjqysow/image/upload", {
      method:"POST",
      body:imageFormData
    })
    
    let ImageResponseFormDB = await((await cloudinaryResponse).json())

    console.log(cloudinaryResponse);
    updateProfile(authUser ,{
      photoURL:ImageResponseFormDB?.url
    })
    setAuthUser({ ...authUser, photoURL: ImageResponseFormDB?.url});
    toast.success("uploaded successfully")
    } catch (error) {
      toast.error(error.message)
    }finally{
      setIsLoading(false)
    }
    
  }

  return (
    <section className=' h-full w-full flex justify-center items-center'>
      <article className=' h-[450px] w-[33%] bg-slate-700 rounded-md py-4 px-8 flex flex-col gap-4 items-center'> 
        <header>
          <h1 className=' text-[24px] font-semibold text-center '>Update Profile</h1>
        </header>
        <main>
          <picture>
            <img src={imagePreview==null ?authUser?.photoURL:imagePreview} alt="" className='h-[250px] w-[250px] rounded-full border'/>
          </picture>
        </main>
        <footer>
            <form action="" onSubmit={handleSubmit}>
              <div>
              <label className=' block border text-center py-2 rounded-md font-semibold px-20' htmlFor="Image">Choose Picture</label>
              <input onChange={handleInputChange} type="file" id='Image' className=' hidden'/>
              </div>
              <div className='mt-4'>
              <button className=' bg-blue-600 w-full py-2 rounded-md '>Upload Picture</button>
              </div>
            </form>         
        </footer>
      </article>
      {isLoading && <Spinner/>}
    </section>
  )
}

export default UpdateProfile