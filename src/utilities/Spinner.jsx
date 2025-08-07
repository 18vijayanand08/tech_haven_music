import React from 'react'
import './spinner.css'

function Spinner() {
  return (
    <section className='h-[100vh] w-[100%] fixed top-0 left-0 bg-[#00000054]'>
<div id="container">
  <div className="spinner">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>
    </section>
  )
}

export default Spinner  
