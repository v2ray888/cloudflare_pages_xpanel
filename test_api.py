import requests
import json

# Test login
login_url = 'http://localhost:3000/api/auth/login'
login_data = {
    'email': 'admin@xpanel.com',
    'password': 'admin123'
}

print('Testing login...')
try:
    response = requests.post(login_url, json=login_data)
    print(f'Status code: {response.status_code}')
    print(f'Response: {response.text}')
    
    if response.status_code == 200:
        result = response.json()
        token = result['data']['token']
        print(f'Token: {token}')
        
        # Test servers API
        servers_url = 'http://localhost:3000/api/user/servers'
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        print('\nTesting servers API...')
        servers_response = requests.get(servers_url, headers=headers)
        print(f'Servers status code: {servers_response.status_code}')
        print(f'Servers response: {servers_response.text}')
    else:
        print('Login failed')
except Exception as e:
    print(f'Error: {e}')