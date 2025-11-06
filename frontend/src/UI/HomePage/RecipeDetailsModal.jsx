import Modal from "../../components/ModalPercentages";

const RecipeDetailsModal = ({ isopen, recipe, onClose }) => {
  if (!isopen || !recipe) return null;

  // format helper (keeps 2 decimals, adds trailing zeros)
  const formatCurrency = (value) =>
    typeof value === "number"
      ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value;

  return (
    <Modal open={isopen} onClose={onClose}>
      <div id="datos-percentages">
        <h2 className=" font-black text-color-secondary mb-4">
          {recipe.name}
        </h2>
        <p><strong>Conversion de porcentajes a pesos</strong></p>
        <p>
          <span>Ganancia esperada.....</span>{" "}
          {recipe.profitPercentage}%
        </p>
        <p>
          <span>Costos adicionales.....</span>{" "}
          {recipe.aditionalCostpercentages}%
        </p>

        <h1>--------------------------------------</h1>
        
        <p>
          <span>Ganancia neta..........</span> $
          {formatCurrency(recipe.netProfit)}
        </p>
        <p>
          <span>Costos adicionales....</span> $
          {formatCurrency(recipe.additionalCost)}
        </p>
      </div>
    </Modal>
  );
};

export default RecipeDetailsModal;
