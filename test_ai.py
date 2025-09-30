import requests
import json

# Test the AI generate endpoint
url = 'http://localhost:8001/ai/generate'
data = {
    'prompt': 'Write a short marketing message for a window replacement company targeting homeowners in Phoenix, Arizona.',
    'max_tokens': 256
}

print('Testing AI endpoint...')
print('Prompt:', data['prompt'])
print()

try:
    response = requests.post(url, json=data, timeout=30)
    print('Status Code:', response.status_code)

    if response.status_code == 200:
        result = response.json()
        print('✅ AI Response successful!')
        print('Generated text:')
        print(result['text'])
        print()
        print('Usage stats:')
        print('Input tokens:', result['usage']['input_tokens'])
        print('Output tokens:', result['usage']['output_tokens'])
        print('Budget status:', result['usage']['budget_status'])
        if result['usage']['warnings']:
            print('Warnings:', ', '.join(result['usage']['warnings']))
    else:
        print('❌ Error:', response.text)

except requests.exceptions.ConnectionError:
    print('❌ Connection failed - Backend server not running')
    print('Start the server with: python backend/main.py')
except Exception as e:
    print('❌ Error:', str(e))