import requests

url = "https://api.tomorrow.io/v4/weather/realtime?location=toronto&apikey=mE0ISl6lKIEumOrrkCnxwq4aDsaNtx1B"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)
