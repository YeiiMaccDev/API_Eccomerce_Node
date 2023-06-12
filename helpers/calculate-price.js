

const calculatePriceTotal = (price = 0 , quantity = 0, discount = 0) => {
    return  (discount > 0 ) 
        ? (quantity * price) - (quantity * price * (discount / 100))
        : (quantity * price)
}

module.exports = {
    calculatePriceTotal
}