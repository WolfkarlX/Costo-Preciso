import { useState } from "react";
import { Plus, Loader2, ChevronDown } from "lucide-react"; // íconos
import SearchBar from "../components/SearchBar";
import SearchResult from "../components/SearchResult";
import "../styles/styles.css";
import Modal from "../components/Modal";
import "../styles/IngredientsPage.css";
import { useIngredientsStore } from "../store/useIngredientsStore";

const IngredientsPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        Units: "",
        unityOfmeasurement: "",
        totalPrice: "",
    });
    const { create, isCreating } = useIngredientsStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        create(formData);
    };

    const [result, setResult] = useState([])
    const [open, setOpen] = useState(false)

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState();
    
    const options = ["Gramo (gr.)",
                    "Kilogramo (kg.)",
                    "Mililitro (ml.)",
                    "Litro (L.)",
                    "Cucharadita (Cdita.)",
                    "Cucharada (Cda.)",
                    "Taza (Tz.)",
                    "Pieza (Pz.)",
                ];

    return (
        <section className="bg-color-primary-light w-full h-screen">
            <div className="mx-4 sm:mx-10 lg:mx-16">
                {/* image */}
                <div className="w-full flex justify-center">
                    <img src="/image-13.png" alt="Imagen decorativa" className="w-full max-w-full h-auto object-contain"
                    />
                </div>

                {/* search bar */}
                <div className="flex flex-row w-full mt-4">
                    <div className="w-full mr-4 sm:mr-10">
                        <SearchBar setResult = {setResult} />
                    </div>
                    <button className="p-2 sm:p-4 shadow-md rounded-[50%] bg-color-primary text-white"
                    onClick={() => setOpen(true)}>
                        <Plus size={28}/>
                    </button>
                    <form onSubmit={handleSubmit}>
                        <Modal open={open} onClose={() => setOpen(false)}>
                            <div className="text-center w-80"></div>
                                <h3 className="text-xl font-black text-color-secondary text-center">Nuevo ingrediente</h3>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium mt-4 my-2">Nombre</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className={`input w-full pl-10 shadow-md border-none`}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium mt-4 my-2">Cantidad</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={"number"}
                                                className="input w-full px-10 shadow-md border-none"
                                                value={formData.Units}
                                                onChange={(e) => setFormData({ ...formData, Units: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium mt-4 my-2">Unidad de medida</span>
                                        </label>
                                        <div className="relative z-50">
                                            <div>
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(!isOpen)}
                                                className="input inline-flex justify-between items-center w-full min-h-[40px] px-4 border-none shadow-md text-left"
                                                >
                                                <span>{selected}</span>
                                                <ChevronDown className="ml-2 text-color-secondary" />
                                                </button>
                                            </div>
                                            {isOpen && (
                                                <div className="origin-top-right absolute mt-4 w-48 rounded-[20px] shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                    <div className="p-2">
                                                        {options.map((option, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => {
                                                                    setSelected(option);
                                                                    setFormData({ ...formData, unityOfmeasurement: option });
                                                                    setIsOpen(false);
                                                                }}
                                                                className="w-full text-left p-2 text-sm text-color-primary cursor-pointer hover:bg-color-primary-light rounded-[10px]"
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium mt-4 my-2">Precio total</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className={`input w-full px-10 shadow-md border-none`}
                                                value={formData.totalPrice}
                                                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium mt-4 my-2">Precio unitario</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className={`input w-full pl-10 shadow-md border-none`}
                                                value={formData.unityPrice}
                                                onChange={(e) => setFormData({ ...formData, unityPrice: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-2">
                                    <button
                                        type="button"
                                        className="border border-color-secondary rounded-[15px] font-bold text-color-secondary shadow-md"
                                        onClick={() => {
                                            setOpen(false);
                                            setFormData({
                                                name: "",
                                                Units: "",
                                                unityOfmeasurement: "",
                                                totalPrice: "",
                                            });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary font-bold" disabled={isCreating}>
                                        {isCreating ? <Loader2 className="size-5 animate-spin" /> : "Guardar"}
                                    </button>
                                </div>
                        </Modal>
                    </form>
                </div>
                <SearchResult result = {result} />
            </div> 
        </section>
    );
};

export default IngredientsPage;
