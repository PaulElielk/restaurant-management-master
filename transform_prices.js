const fs = require('fs');

const data = fs.readFileSync('frontend/src/resources/db_restaurant.sql', 'utf8');

// match tuple: ("name", "star", "vote", "price", "discount", ...)
// example: ("carne asada tacos","4.5", "999", "12.00", "0.00", "03 pieces per serving"
const regex = /(\("[^"]+",\s*"[^"]+",\s*"[^"]+",\s*")([^"]+)("\,\s*")([^"]+)("\,\s*"[^"]+")/g;

const newData = data.replace(regex, (match, before, priceStr, mid, discountStr, after) => {
    const price = parseFloat(priceStr);
    const discount = parseFloat(discountStr);
    
    const newPrice = Math.round(price * 600);
    const newDiscount = Math.round(discount * 600);
    
    return `${before}${newPrice}${mid}${newDiscount}${after}`;
});

fs.writeFileSync('frontend/src/resources/db_restaurant.sql', newData);

console.log('db_restaurant.sql updated successfully.');
