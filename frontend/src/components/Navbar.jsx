import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast"; // Import react-hot-toast
import { LogOut, Egg, Soup, Percent, BadgeDollarSign } from "lucide-react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const [activeLink, setActiveLink] = useState("recipes"); // Track active link
    const [confirmingLogout, setConfirmingLogout] = useState(false); // Track if confirmation is in progress

    //Load the active link from localStorage when the component mounts
    useEffect(() => {
        const savedLink = localStorage.getItem('activeLink');
        if (savedLink) {
            setActiveLink(savedLink);
        }
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
                    <p className="pb-3 pt-2 font-bold">Está seguro de cerrar sesión?</p>
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
        <header class="shadow bg-color-primary-light p-2">
            <div class="relative flex max-w-screen-xl flex-col overflow-hidden px-4 py-4 md:mx-auto md:flex-row md:items-center">
                <a href="#" class="flex items-center whitespace-nowrap text-2xl font-black">
                <span class="mr-2 text-4xl text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M6.925 16.875Q5.2 16.225 4.1 14.713Q3 13.2 3 11.25q0-1.975.938-3.513Q4.875 6.2 6 5.15q1.125-1.05 2.062-1.6L9 3v2.475q0 .625.45 1.062q.45.438 1.075.438q.35 0 .65-.15q.3-.15.5-.425L12 6q.95.55 1.625 1.35t1.025 1.8l-1.675 1.675q-.05-.6-.287-1.175q-.238-.575-.638-1.05q-.35.2-.738.287q-.387.088-.787.088q-1.1 0-1.987-.612Q7.65 7.75 7.25 6.725q-.95.925-1.6 2.062Q5 9.925 5 11.25q0 .775.275 1.462q.275.688.75 1.213q.05-.5.287-.938q.238-.437.588-.787L9 10.1l2.15 2.1q.05.05.1.125t.1.125l-1.425 1.425q-.05-.075-.087-.125q-.038-.05-.088-.1L9 12.925l-.7.7q-.125.125-.212.287q-.088.163-.088.363q0 .3.175.537q.175.238.45.363ZM9 10.1Zm0 0ZM7.4 22L6 20.6L19.6 7L21 8.4L17.4 12H21v2h-5.6l-.5.5l1.5 1.5H21v2h-2.6l2.1 2.1l-1.4 1.4l-2.1-2.1V22h-2v-4.6l-1.5-1.5l-.5.5V22h-2v-3.6Z" /></svg>
                </span>
                <span class="text-black">the future</span>
                </a>
                <input type="checkbox" class="peer hidden" id="navbar-open" />
                <label class="absolute top-5 right-7 cursor-pointer md:hidden" for="navbar-open">
                <span class="sr-only">Toggle Navigation</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                </label>
                <nav aria-label="Header Navigation" class="peer-checked:mt-8 peer-checked:max-h-56 flex max-h-0 w-full flex-col items-center justify-between overflow-hidden transition-all md:ml-24 md:max-h-full md:flex-row md:items-start">
                <ul class="flex flex-col items-center space-y-2 md:ml-auto md:flex-row md:space-y-0">
                    <Link
                        to="/" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "recipes" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("recipes")}
                    >
                        <Soup size={20} color={activeLink === "recipes" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`${activeLink === "recipes" ? "font-bold text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Recetas</span>
                    </Link>
                    <Link
                        to="/ingredients" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "ingredients" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("ingredients")}
                    >
                        <Egg size={20} color={activeLink === "ingredients" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`${activeLink === "ingredients" ? "font-bold text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Ingredientes</span>
                    </Link>
                    <Link
                        to="/percentages" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "percentages" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("percentages")}
                    >
                        <Percent size={20} color={activeLink === "percentages" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`nav-link ${activeLink === "percentages" ? "font-bold text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Porcentajes</span>
                    </Link> 
                    <Link
                        to="/sales" 
                        className={`flex items-center md:mr-12 ${
                            activeLink === "sales" ? " -mt-3 border-b-4 border-[var(--color-secondary)] rounded-sm" : "border-b-4 border-transparent"
                        }`}
                        onClick={() => handleClick("sales")}
                    >
                        <BadgeDollarSign size={20} color={activeLink === "sales" ? "var(--color-secondary)" : "var(--color-primary)"} />
                        <span className={`${activeLink === "sales" ? "font-bold text-[var(--color-secondary)]" : "font-normal text-[var(--color-primary)]"}`}>Ventas</span>
                    </Link>                     
                    <li class="text-gray-600 md:mr-12 hover:text-blue-600">
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
