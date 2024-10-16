from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# tomorrow_io_api_key = 'mE0ISl6lKIEumOrrkCnxwq4aDsaNtx1B'
# tomorrow_io_api_key = 'l7aDY42v0zgyzC0C4wq1GV8KNQcYclf0'
# tomorrow_io_api_key = 'j6RrAyeZiuVc0Ofe78V6dF86lc0nC74N'
tomorrow_io_api_key = 'Kuw5MwrAVG4XsA7MxXAJHhFhZ83LZIft'

google_api_key = 'AIzaSyAM_i1-lFFuuQZkbXt-T0kLXGGOqz3_pZk'
ipinfo_api_key = '3f20eb330800fe'

headers = {
    "accept": "application/json",
    "Accept-Encoding": "gzip"
}

fields = [
    'weatherCode', 
    'temperatureMax', 
    'temperatureMin', 
    'windSpeed', 
    'precipitationProbability',
    'windDirection',
    'humidity',
    'pressureSeaLevel',
    'uvIndex',
    'weatherCode',
    'precipitationProbability',
    'precipitationType',
    'sunriseTime',
    'sunsetTime',
    'visibility',
    'moonPhase',
    'cloudCover',
    ]
def get_timeline_info(location, fields=fields, units='imperial', timesteps='1d', endTime='nowPlus5d', timezone='America/Los_Angeles'):
    params = {
        'apikey': tomorrow_io_api_key,
        'location': location,
        'fields': fields,
        'timesteps': timesteps,
        'startTime': 'now',
        'endTime': endTime,
        'units': units,
        'timezone': timezone
    }
    url = 'https://api.tomorrow.io/v4/timelines'
    print("---------> timeline")
    response = requests.get(url, params=params, headers=headers)

    print(response.url)
    return response.json()


def get_realtime_info(location: str):
    url = 'https://api.tomorrow.io/v4/weather/realtime'
    response = requests.get(url, params={
        'location': location,
        'apikey': tomorrow_io_api_key
    })

    print("---------> realtime")
    print(response.url)    
    return response.json()


def geo_encode(location: str):
    url = 'https://maps.googleapis.com/maps/api/geocode/json'
    response = requests.get(url, params={
        'address': location,
        'key': google_api_key   
    })
    response = json.loads(response.text) 
    latitude = response['results'][0]['geometry']['location']['lat']
    longtitude = response['results'][0]['geometry']['location']['lng']
    coords = str(latitude) + ',' + str(longtitude)
    return coords


# accepts { "location": "some_location_string" } or { "isAutoDetect": true }
@app.route('/', methods=['POST'])
def handle_request():
    try:
        json_data = request.get_json()
        if json_data is not None:
            # get geo_coordinates
            if json_data.get('isAutoDetect') == True:
                ip_addr = request.headers.get('X-Forwarded-For', request.remote_addr)
                location_info = get_ip_info_by_ip_addr(ip_addr=ip_addr)
                geo_coordinates = location_info['loc']
            else:
                location = json_data.get('location')
                geo_coordinates = geo_encode(location)

            # realtime info
            realtime_info = get_realtime_info(location=geo_coordinates)
            realtime_info["full_address"] = coordination_to_address(latlng=geo_coordinates)['results'][0]['formatted_address']

            # timeline info
            timeline_info = get_timeline_info(location=geo_coordinates)

            payload = dict()
            payload["realtime_info"] = realtime_info
            payload["timeline_info"] = timeline_info
            print(payload)
            return jsonify(payload), 200
        else:
            return jsonify({"error": "No JSON data received"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/hourly', methods=['POST'])
def handle_hourly_request():
    try:
        json_data = request.get_json()
        print(json_data)
        if json_data is not None:
            # get geo_coordinates
            if json_data.get('isAutoDetect') == True:
                ip_addr = request.headers.get('X-Forwarded-For', request.remote_addr)
                location_info = get_ip_info_by_ip_addr(ip_addr=ip_addr)
                geo_coordinates = location_info['loc']
            else:
                location = json_data.get('location')
                geo_coordinates = geo_encode(location)

            # timeline info
            fields = [
                'temperature', 
                'windSpeed',
                'windDirection',
                'humidity',
                'pressureSeaLevel'
                ]
            timeline_info = get_timeline_info(location=geo_coordinates, fields=fields, timesteps='1h', endTime='nowPlus5d')

            payload = dict()
            payload["timeline_info"] = timeline_info
            print('hourly info ------------->')
            print(payload)
            return jsonify(payload), 200
        else:
            return jsonify({"error": "No JSON data received"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

def get_ip_info_by_ip_addr(ip_addr: str):
    # change before production
    # response = requests.get(f'https://ipinfo.io/{ip_addr}?token={ipinfo_api_key}')
    response = requests.get(f'https://ipinfo.io/108.60.34.136?token={ipinfo_api_key}')
    if response.status_code == 200:
        response_dict = response.json()
        return response_dict
    else:
        return {"error": "Failed Fetching ipInfo"}


def coordination_to_address(latlng: str):
    response = requests.get(f'https://maps.googleapis.com/maps/api/geocode/json?latlng={latlng}&key={google_api_key}')
    if response.status_code == 200:
        response_dict = response.json()
        return response_dict
    else:
        return {"error": "Failed Retrieving Reverse Geodata"}


if __name__ == '__main__':
    app.run(debug=True)

