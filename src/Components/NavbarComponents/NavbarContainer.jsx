import React from 'react'
import Logo from './Logo'
import Menu from './Menu'

const NavbarContainer = () => {
  return <section className=' bg-slate-700  h-[70px] w-[100%]'>
    <article className=' flex items-center h-full w-[95%] m-auto  justify-between'>
        <Logo/>
        <Menu/>
    </article>
  </section> 
}

export default NavbarContainer