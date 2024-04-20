import ssn from "./assets/ssn-white.png";

const Navbar = () => {
  return (
    <div>
      <nav className="bg-[#003aa7] gap-x-4 border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-center md:justify-between mx-auto p-4">
          <a
            href="https://ssn.edu.in/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src={ssn} className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-white text-2xl font-semibold whitespace-nowrap dark:text-white">
              Speech Lab
            </span>
          </a>

          <div className="w-auto flex md:flex-row flex-col">
            <h1 className="font-bold text-center text-white text-3xl flex md:text-2xl justify-center items-center">
              Dysarthric Severity Assesment Tool
            </h1>

            <ul className="font-medium gap-4 ml-4 text-white flex flex-row text-center justify-center items-center">
              <li>
                <a href="#" className="block py-2 px-3 text-white underline">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 text-white underline">
                  Steps
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 px-3 text-white underline">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
