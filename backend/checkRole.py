import pymysql

conn = pymysql.connect(host='localhost', user='root', password='123456', database='quickcart_db')
cursor = conn.cursor()
cursor.execute("SELECT role FROM users WHERE email='jaiganeshrio474@gmail.com'")
print(cursor.fetchone())
conn.close()
