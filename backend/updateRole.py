import pymysql

conn = pymysql.connect(host='localhost', user='root', password='123456', database='quickcart_db')
cursor = conn.cursor()
cursor.execute("UPDATE users SET role='ADMIN' WHERE email='jaiganeshrio474@gmail.com'")
conn.commit()
conn.close()
print('Success!')
