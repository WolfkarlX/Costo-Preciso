import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast"; // Import react-hot-toast
import "../styles/Navbar.css";
import { LogOut, Egg, Settings, Soup, Percent, BadgeDollarSign } from "lucide-react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const [activeLink, setActiveLink] = useState(null); // Track active link
    const [confirmingLogout, setConfirmingLogout] = useState(false); // Track if confirmation is in progress

    //checks if the link was aready clicked
    const handleClick = (link) => {
        setActiveLink(link);
    };

    // Handle the confirmation and logout
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

    return (
        <header className="bg-[#F6F4EB] border-b border-base-300 w-[100%] top-0 z-40 p-4 ">
            <div>
                <img src="img/logo.png" title="Costo-Preciso" alt="Logo de Costo preciso" />
            </div>
            <div id="container" className="justify-end space-x-4">
                {authUser && (
                <>
                    <Link
                        to="/" class="link"    
                        className={`flex items-center hover:pt-2 hover:pb-3 hover:border-b-[%10] ${
                            activeLink === "recipes" ? "pt-2 pb-3 border-b-4 border-[#4F959D] rounded-sm" : "border-b-4 border-transparent"
                        } hover:border-[#4F959D] rounded-sm`}
                        onClick={() => handleClick("recipes")}
                    >
                        <Soup size={24} color="black" />
                        <span className={`text-black ${activeLink === "recipes" ? "font-bold" : "font-normal"}`}>Recetas</span>
                    </Link>
                    <Link
                        to="/ingredients" class="link"
                        className={`flex items-center hover:pt-2 hover:pb-3 hover:border-b-4 ${
                            activeLink === "ingredients" ? "pt-2 pb-3 border-b-4 border-[#4F959D] rounded-sm" : "border-b-4 border-transparent"
                        } hover:border-[#4F959D] rounded-sm`}
                        onClick={() => handleClick("ingredients")}
                    >
                        <Egg size={24} color="black" />
                        <span className={`text-black ${activeLink === "ingredients" ? "font-bold" : "font-normal"}`}>Ingredientes</span>
                    </Link>
                    <Link
                        to="/percentages" class="link"
                        className={`flex items-center hover:pt-2 hover:pb-3 hover:border-b-4 ${
                            activeLink === "percentages" ? "pt-2 pb-3 border-b-4 border-[#4F959D] rounded-sm" : "border-b-4 border-transparent"
                        } hover:border-[#4F959D] rounded-sm`}
                        onClick={() => handleClick("percentages")}
                    >
                        <Percent size={24} color="black" />
                        <span className={`text-black ${activeLink === "percentages" ? "font-bold" : "font-normal"}`}>Porcentajes</span>
                    </Link>
                    <Link
                        to="/sales" class="link"
                        className={`flex items-center hover:pt-2 hover:pb-3 hover:border-b-4 ${
                            activeLink === "sales" ? "pt-2 pb-3 border-b-4 border-[#4F959D] rounded-sm" : "border-b-4 border-transparent"
                        } hover:border-[#4F959D] rounded-sm`}
                        onClick={() => handleClick("sales")}
                    >
                        <BadgeDollarSign size={24} color="black" />
                        <span className={`text-black ${activeLink === "sales" ? "font-bold" : "font-normal"}`}>Ventas</span>
                    </Link>
                </>
                )}
                <Link
                    to="/settings" class="link"
                    className={`flex items-center hover:pt-2 hover:pb-3 hover:border-b-4 ${
                        activeLink === "settings" ? "pt-2 pb-3 border-b-4 border-[#4F959D] rounded-sm" : "border-b-4 border-transparent"
                    } hover:border-[#4F959D] rounded-sm`}
                    onClick={() => handleClick("settings")}
                >
                    <Settings size={24} color="black" />
                    <span className={`text-black ${activeLink === "settings" ? "font-bold" : "font-normal"}`}>Ajustes</span>
                </Link>

                {authUser && (
                    <>
                        <button
                            onClick={confirmLogout} // Use this function to show confirmation toast
                            class="link"
                            className="flex items-center hover:pt-2 hover:pb-2 hover:border-b-4 hover:border-red-700 rounded-sm"
                        >
                            <LogOut size={24} color="black" />
                            <span className="text-black">Cerrar sesión</span>
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
