import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast"; // Import react-hot-toast
import { LogOut, Egg, Soup, Percent, BookMarked, Settings } from "lucide-react";
import logo from '../img/logo.png';

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const [activeLink, setActiveLink] = useState("recipes"); // Track active link
    const [confirmingLogout, setConfirmingLogout] = useState(false); // Track if confirmation is in progress
    const [openAccessibility, setOpenAccessibility] = useState(false); // Accesibilidad

    const accessibilityRef = useRef(null); // Accesibilidad

    //Load the active link from localStorage when the component mounts
    useEffect(() => {
    const savedLink = localStorage.getItem("activeLink");
    if (savedLink) {
      setActiveLink(savedLink);
    }

    // Cerrar menú de accesibilidad al hacer clic fuera
    const handleClickOutside = (event) => {
        //console.log("clic fuera del menú:", event.target); // Mensaje de depuración
        if (
            accessibilityRef.current &&
            !accessibilityRef.current.contains(event.target)
        ) {
            //console.log("Cerrando menú"); // Mensaje de depuración
            setOpenAccessibility(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll(".nav-link");
      
        links.forEach(link => {
          if (link.getAttribute("href") === currentPath) {
            link.classList.add("text-blue-600", "font-bold");
          } else {
            link.classList.remove("text-red-300", "font-bold");
          }
        });
      }, []);      

    //Handle click and save the active link to localStorage
    const handleClick = (link) => {
        setActiveLink(link);
        localStorage.setItem('activeLink', link);  // Persist active link in localStorage
    };

    //Handle the confirmation and logout
    const confirmLogout = () => {
        if (confirmingLogout) return; // Don't show the confirmation if it's already active

        setConfirmingLogout(true); // Mark confirmation as active

        toast(
            (t) => (
                <div>
                    <p className="pb-3 pt-2 font-bold">¿Está seguro de cerrar sesión?</p>
                    <div className="flex">
                        <button
                            onClick={() => {
                                logout();
                                toast.dismiss(t.id);     
                                setConfirmingLogout(false)                           
                            }}
                            className="bg-red-600 text-white p-2 w-1/2 rounded-bl-md m-0 border-b-2 border-l-2 border-black"
                        >
                            Si
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id); // Close the toast without doing anything
                                setConfirmingLogout(false); // Reset confirmation state
                            }}
                            className="bg-[#4F959D] text-white p-2 ml-2 w-1/2 rounded-br-md m-0 border-b-2 border-r-2 border-black"
                        >
                            No
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                position: "top-center",
                style: {
                    background: "#f8f8f8",
                    color: "#333",
                    padding: "10px",
                },
            }
        );
    };
    
    //Navbar
    return (
        <header className="sticky top-0 z-30 shadow bg-[#f9f7db] p-2">
            <div className="relative flex max-w-screen-xl flex-col overflow-hidden px-4 py-0 md:mx-auto md:flex-row md:items-center">
                <a href="#" className="flex items-center whitespace-nowrap text-2xl font-black justify-start">
                <span className="mr-1 flex-shrink-0">
                    <img src={logo} className="h-24 w-auto" alt="Logo" title="Regresar arriba"/>
                </span>
                <span className="text-black" title="Regresar arriba">Costo Preciso</span>
                </a>
                <input type="checkbox" className="peer hidden" id="navbar-open" />
                <label className="absolute top-5 right-7 cursor-pointer md:hidden" htmlFor="navbar-open">
                <span className="sr-only">Toggle Navigation</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                </label>
                <nav aria-label="Header Navigation" className="peer-checked:mt-8 peer-checked:max-h-56 flex max-h-0 w-full flex-col items-center justify-between overflow-hidden transition-all md:ml-24 md:max-h-full md:flex-row md:items-start">
                <ul className="flex flex-col items-center space-y-2 md:ml-auto md:flex-row md:space-y-0">
                    <Link
                        to="/" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "recipes" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("recipes")}
                    >
                        <Soup size={20} color={activeLink === "recipes" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`${activeLink === "recipes" ? "font-black text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Recetas</span>
                    </Link>
                    <Link
                        to="/ingredients" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "ingredients" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("ingredients")}
                    >
                        <Egg size={20} color={activeLink === "ingredients" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`${activeLink === "ingredients" ? "font-black text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Ingredientes</span>
                    </Link>
                    {/*
                    <Link
                        to="/recipebook" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "recipebook" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("recipebook")}
                    >
                        <BookMarked size={20} color={activeLink === "recipebook" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`${activeLink === "recipebook" ? "font-black text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Recetario</span>
                    </Link>
                    */}
                    <Link
                        to="/percentages" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "percentages" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("percentages")}
                    >
                        <Percent size={20} color={activeLink === "percentages" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`nav-link ${activeLink === "percentages" ? "font-black text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Porcentajes</span>
                    </Link>

                    {/* Botón de accesibilidad */}
                

                    <li className="text-gray-600 md:mr-12 hover:text-blue-600">
                        {authUser && (
                        <>
                            <button
                                onClick={confirmLogout} // Use this function to show confirmation toast
                                className="rounded-md border-2 border-blue-600 px-6 py-1 font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                            >
                                <LogOut size={20} color="black" />
                            </button>
                        </>
                        )}
                    </li>
                </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;