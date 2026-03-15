import urllib.request, json
data = json.dumps({'email': 'jaiganeshrio474@gmail.com', 'password': '123456'}).encode()
req = urllib.request.Request('http://localhost:8080/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(req).read())['token']
req2 = urllib.request.Request('http://localhost:8080/api/orders/admin/all', headers={'Authorization': 'Bearer ' + token})
try:
    print('admin/all len:', len(json.loads(urllib.request.urlopen(req2).read())))
except Exception as e:
    print('admin/all error:', e)
