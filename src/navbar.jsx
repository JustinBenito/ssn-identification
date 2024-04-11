import React from 'react'
import ssn from './assets/ssn-white.png'

const Navbar = () => {
  return (
    <div>
<nav class="bg-[#003aa7] gap-x-4 border-gray-200 dark:bg-gray-900">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-center md:justify-between mx-auto p-4">
    <a href="https://ssn.edu.in/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <img src={ssn} class="h-8" alt="Flowbite Logo" />
        <span class="self-center text-white text-2xl font-semibold whitespace-nowrap dark:text-white">Speech Lab</span>
    </a>

    <div class="w-auto">
      <h1 className='font-bold text-center text-white text-3xl mt-4 md:mt-0 md:text-2xl'>Identification of Dsyarthritic speakers</h1>
    </div>
  </div>
</nav>

    </div>
  )
}

export default Navbar