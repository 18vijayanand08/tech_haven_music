import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Spinner from '../utilities/Spinner';
import { addDoc, collection } from 'firebase/firestore';
import { __DB } from '../Backend/firebase';

const CreateAlbum = () => {
  let initialAlbumState={
    albumTitle:"",
    albumPoster:"",
    albumReleaseDate:"",
    albumLanguage:"",
    albumDescription:""
  }
  let initialSongsState={
    songName:"",
    songUrl:"",
    songThumbnail:"",
    songSingers:"",
    songMood:"",
    songMusicDirector:""
  }
  let [albumState , setAlbumState]=useState(initialAlbumState);
  let [songsState , setSongsState]=useState([initialSongsState]);
  let [isLoading , setIsLoading]=useState(false)
  let [albumThumbnailPoster , setAlbumThumbnailPoster]=useState()
  let {albumTitle,albumPoster,albumReleaseDate,albumLanguage,albumDescription}=albumState

  //Handle input changes in album form

  let handleAlbumInputchange=(e)=>{
    let {name,value}=e.target;

    setAlbumState({
      ...albumState,[name]:value
    })
  }
  //handle album {Poster}

  let handleAlbumPoster=(e)=>{
    let file=e.target.files[0];
    if(file){
      setAlbumThumbnailPoster(file)
    }
  }
  //Add section method for song
  let addSongSection=(e)=>{
    e.preventDefault();
    setSongsState([
      ...songsState,{
        songName:"",
        songUrl:"",
        songThumbnail:"",
        songSingers:"",
        songMood:"",
        songMusicDirector:""
      }
    ])
  }
  //Remove Song Section 
  let removeSongSection=(index,e)=>{
    e.preventDefault();

    if(index>0){
      setSongsState(songsState.filter((el,ind)=>{
        return ind!=index;
      }))
    }
  }
  //Handling the songs input

  let handleSongsInputChange=(index,e)=>{
    let {name,value}=e.target;

    let updateState=[...songsState];

    updateState[index][name]=value;

    setSongsState(updateState);
  }
  // Handle Files of songs section

  let handleSongsFilesInput=(index,inpName,e)=>{
    let updateSongs=[...songsState];

    updateSongs[index][inpName]=e.target.files[0];

    setSongsState(updateSongs);
  }


  //Form sumbit Method
  let handleFormsubmit=async(e)=>{
    e.preventDefault();
    try {
      setIsLoading(true)

      let AlbumPosterFormData=new FormData();
      AlbumPosterFormData.append('file',albumThumbnailPoster)
      AlbumPosterFormData.append('upload_preset',"tech_haven_music")
      AlbumPosterFormData.append("cloud_name","drmjqysow");

      let cloudinaryResponse=await fetch("https://api.cloudinary.com/v1_1/drmjqysow/image/upload",{
        method:"POST",
        body:AlbumPosterFormData
      })
      let  AlbumPosterUrlFromDB= await (await cloudinaryResponse.json())
      // console.log(AlbumPosterUrlFromDB);

    

      let SongsUrl=songsState.map(async(song,index)=>{

        let songURLFormData = new FormData();
        songURLFormData.append('file',song?.songUrl)
        songURLFormData.append('upload_preset',"tech_haven_music")
        songURLFormData.append("cloud_name","drmjqysow");
        //? songState iterating starts here
        let cloudinaryResponseOfSongURLData=await fetch("https://api.cloudinary.com/v1_1/drmjqysow/upload",{
          method:"POST",
          body:songURLFormData
        })
        let  SongMP3UrlFromDB= await (await cloudinaryResponseOfSongURLData.json())
        // Ensure HTTPS URL
        let secureSongUrl = SongMP3UrlFromDB.secure_url || SongMP3UrlFromDB.url.replace('http://', 'https://');
        // console.log(SongMP3UrlFromDB);
        
        
        //* song PosterUrl ends here
        //

        //songUrl starts here
        let songThumbnailFormData = new FormData();
        songThumbnailFormData.append('file',song?.songThumbnail)
        songThumbnailFormData.append('upload_preset',"tech_haven_music")
        songThumbnailFormData.append("cloud_name","drmjqysow");
        //? songState iterating starts here
        let cloudinaryResponseOfSongThumbnailData=await fetch("https://api.cloudinary.com/v1_1/drmjqysow/upload",{
          method:"POST",
          body:songThumbnailFormData
        })
        let  SongPosterUrlFromDB= await (await cloudinaryResponseOfSongThumbnailData.json())
        
        return ({...song,songThumbnail:SongPosterUrlFromDB?.url,songUrl:SongMP3UrlFromDB?.url,songDuration:SongMP3UrlFromDB?.duration})
        
        // console.log(SongPosterUrlFromDB);
        //? songState iterating ends here
      })  
      
      
      
      let SongsDataFromCloudinaryResponse= await Promise.all(SongsUrl);
      
      console.log(SongsDataFromCloudinaryResponse);
      
      let Payload={...albumState,albumPoster:AlbumPosterUrlFromDB?.url,AllSongs:[...SongsDataFromCloudinaryResponse]}
      
      let album_collection_ref=collection(__DB,"album_collections");

      let albumDataFormDB=await addDoc(album_collection_ref,Payload)

      toast.success("Data Stored Successfully ")

      


      

    } catch (error) {
      toast.error(error.message)
      console.log(error);
      
    }
    finally{
      setIsLoading(false)
    }
    
    
  }
  return (
    <section className='h-full w-full flex justify-center '>

      <article className='min-h-[400px] w-[65%] bg-slate-800 rounded-md mt-12 pl-4 pr-4' >

        <header><h1 className='text-[24px] font-semibold text-center '>Create Album</h1></header>
        <hr className='my-1'></hr>

        <main>
          {/* album form starting */}
          <header className='my-4'>
            <h1 className='text-[20px] font-semibold'> Album Details</h1>
          </header>
          <article>
            <form action="" onSubmit={handleFormsubmit}>
              {/* album starts  */}
              <header className='flex flex-wrap gap-y-4 justify-between'>
                {/* First row Album */}
              <div className='flex flex-col gap-2 w-[48%]'>
                <label htmlFor="">Album Title</label>
                <input placeholder='Enter Album Title'name='albumTitle' value={albumTitle} onChange={handleAlbumInputchange} className='outline-none py-2 px-2 border rounded-md' type="text" />
              </div>
              <div className='flex flex-col gap-2 w-[48%]'>
                <label htmlFor="">Album Poster</label>
                <input placeholder='Enter Album Title' name='albumPoster' onChange={handleAlbumPoster} className='outline-none py-2 px-2 border rounded-md file:bg-blue-600 file:rounded-sm file:px-2' type="file" />
              </div>
                {/* Second row Album */}
              <div className='flex flex-col gap-2 w-[48%]'>
                <label htmlFor="">Album Release Date</label>
                <input placeholder='Enter Release Date' name='albumReleaseDate' value={albumReleaseDate} onChange={handleAlbumInputchange} className='outline-none py-2 px-2 border rounded-md' type="date" />
              </div>
              <div className='flex flex-col gap-2 w-[48%]'>
                <label htmlFor="">Album Language </label>
                <input placeholder='Enter Album Language'name='albumLanguage' value={albumLanguage} onChange={handleAlbumInputchange} className='outline-none py-2 px-2 border rounded-md' type="text" />
              </div>
              {/* Third row Album */}
              <div className='flex flex-col gap-2 w-full'>
                <label htmlFor="">Album Description</label>
                <textarea className='py-2 px-2 border rounded-md outline-none'name='albumDescription' value={albumDescription} onChange={handleAlbumInputchange}  placeholder='Enter the Description'></textarea>
              </div>
              
              </header>
              {/* album ends */}

              {/* Songs part starts */}
              <main className='py-4'>
                <header><h1 className='text-[20px] font-semibold'>Songs Section</h1></header>
                {/* iterating the songstate */}
                {songsState?.map((song,index)=>{
                  return <section className='bg-slate-700 w-full min-h-[250px] rounded-md my-4 py-2 px-6'> 
                  <header><h1 className='text-[18px] font-semibold text-center'>Song_{index+1}</h1></header>
                  {/* This is songs div ssection */}
                  <main className='flex flex-wrap justify-between gap-y-4'>
                      {/* First row songs section */}
                      <div className='flex flex-col gap-2 w-[32%]'>
                        <label htmlFor="">Song Name</label>
                        <input type="text" name='songName' value={song?.songName} onChange={(e)=>handleSongsInputChange(index,e)} placeholder='Enter the Song Name' className='outline-none px-2 py-2 border rounded-md' />
                      </div>
                      <div className='flex flex-col gap-2 w-[32%]'>
                        <label htmlFor="">Song Url</label>
                        <input type="file" name='songUrl'  onChange={(e)=>handleSongsFilesInput(index,'songUrl',e)} placeholder='Enter the Song Url' className='outline-none px-2 py-2 border rounded-md  file:bg-blue-600 file:rounded-sm file:px-2' />
                      </div>
                      <div className='flex flex-col gap-2 w-[32%]'>
                        <label htmlFor="">Song Thumbnail</label>
                        <input type="file" name='songThumbnail'  onChange={(e)=>handleSongsFilesInput(index,'songThumbnail',e)} placeholder='Enter the Song Thumbnail' className='outline-none px-2 py-2 border rounded-md  file:bg-blue-600 file:rounded-sm file:px-2' />
                      </div>
                      {/* Second row songs section */}
                      <div className='flex flex-col gap-2 w-[32%]'>
                        <label htmlFor="">Song Singers</label>
                        <input type="text" name='songSingers' vxalue={song?.songSingers} onChange={(e)=>handleSongsInputChange(index,e)} placeholder='Enter the Song Singers' className='outline-none px-2 py-2 border rounded-md' />
                      </div>
                      <div className='flex flex-col gap-2 w-[32%]'>
                        <label htmlFor="">Song Mood</label>
                        <input type="text" name='songMood' value={song?.songMood} onChange={(e)=>handleSongsInputChange(index,e)} placeholder='Enter the Song Mood' className='outline-none px-2 py-2 border rounded-md' />
                      </div>
                      <div className='flex flex-col gap-2 w-[32%]'>
                        <label htmlFor="">Song Music Director </label>
                        <input type="text" name='songMusicDirector' value={song?.songMusicDirector} onChange={(e)=>handleSongsInputChange(index,e)} placeholder='Enter the Song Music Director' className='outline-none px-2 py-2 border rounded-md' />
                      </div>
                  </main>
                  <footer className=' flex justify-between py-4'>
                        <button onClick={(e)=>removeSongSection(index,e)} className='py-2 px-8 bg-red-600 rounded-md'>Remove Section</button>
                        {index==songsState.length-1 && <button onClick={(e)=>{addSongSection(e)}} className='py-2 px-8 bg-blue-600 rounded-md'>Add Section</button> }  
                  </footer>
                  </section>
                })}
                
              </main>
              {/* Songs part ends */}

              {/* Sumbit part Starts */}
              <footer>
                <button className='bg-blue-600 hover:bg-blue-800 py-2 w-full rounded-md mt-5'>Sumbit</button>
              </footer>
              {/* Sumbit part ends */}
            </form>
          </article>
          {/* album form ending */}
        </main>

      </article>

      {isLoading && <Spinner/>}

    </section>
  )
}

export default CreateAlbum