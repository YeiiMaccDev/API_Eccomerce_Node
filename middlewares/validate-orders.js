const { request, response } = require("express");
const { Order, Product } = require("../models");
const { isValidObjectId } = require("mongoose");

/**
 * Validate order Status
 */
const validateOrderStatus = (req = request, res = response, next) => {
  const { orderStatus } = req.body;
  const validStatus = Order.schema.path('orderStatus').enumValues

  if (!validStatus.includes(orderStatus)) {
    return res.status(400).json({ message: `Estado de orden inválido, Validos ${validStatus}` });
  }

  next();
};


/**
 * Validate that the products have a valid id and quantity.
 */
const validateProductData = async (req = request, res = response, next) => {
  const { products } = req.body;

    for (const product of products) {

      if (!product.id) {
        return res.status(400).json({ error: `El producto no contiene id. Producto: ${JSON.stringify(product)}` });
      }

      const isMongoId = isValidObjectId(product.id);
      if (!isMongoId) {
        return res.status(400).json({ error: `El ID del producto ${product.id} no es un ID válido.` });
      }

      if (!product.quantity) {
        return res.status(400).json({ error: `El producto con id ${product.id} no incluye la cantidad.` });
      }

      if (!Number.isInteger(product.quantity) || product.quantity <= 0) {
        return res.status(400).json({ error: `La cantidad del producto debe ser un número entero mayor a cero. Cantidad: ${product.quantity}.` });
      }
    }

    next();
}


/**
 * Validate that the products shipped for the order exist and their quantity is less than the stock.
 */
const validateOrderDetails = async (req = request, res = response, next) => {
  const { products } = req.body;
  try {

    for (const product of products) {
      const productExist = await Product.findById(product.id);
      if (!productExist) {
        return res.status(400).json({ error: `Producto no encontrado para el ID ${product.id}` });
      } else {
        if (product.quantity > productExist.stock) {
          return res.status(400).json({ 
            error: `Cantidad excedida. Stock: ${productExist.stock}, cantidad solicitada: ${product.quantity}, producto ${product.name} `
          });
        }

      }
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al validar los detalles de la orden' });
  }
}



module.exports = {
  validateOrderStatus,
  validateOrderDetails,
  validateProductData
}