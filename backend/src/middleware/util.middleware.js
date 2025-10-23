import mongoose from 'mongoose';

export const validateAndFilterUpdates = (allowedUpdates) => {
  return (req, res, next) => {
    const updates = req.body;
    const { id } = req.params;

    // 1. Checks for empty request body
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Petición Vacía" });
    }

    // 2. Validate MongoDB ID format (if needed)
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválida" });
    }

    // 3. Filter updates to only allowed fields
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // 4. Attach filtered updates to the request object
    req.filteredUpdates = filteredUpdates;

    // 5. Reject if no valid updates remain after filtering
    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: "No hay campos validos para editar"});
    }

    next(); // Proceed to the controller
  };
};