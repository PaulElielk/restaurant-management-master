import re

with open("C:/Users/Paul-Eliel Kouame/Desktop/programming/restaurant-management-master/frontend/src/resources/db_restaurant.sql", "r") as f:
    sql = f.read()

def replacer(match):
    before = match.group(1)
    price = float(match.group(2))
    discount = float(match.group(3))
    after = match.group(4)
    
    new_price = int(price * 600)
    new_discount = int(discount * 600)
    
    return f'{before}"{new_price}", "{new_discount}"{after}'

# match tuple: ("name", "star", "vote", "price", "discount", ...)
# example: ("carne asada tacos","4.5", "999", "12.00", "0.00", "03 pieces per serving"
pattern = re.compile(r'(\("[^"]+",\s*"[^"]+",\s*"[^"]+",\s*")([^"]+)("\,\s*")([^"]+)("\,\s*"[^"]+")')

new_sql = pattern.sub(replacer, sql)

with open("C:/Users/Paul-Eliel Kouame/Desktop/programming/restaurant-management-master/frontend/src/resources/db_restaurant.sql", "w") as f:
    f.write(new_sql)

print("db_restaurant.sql updated successfully.")
