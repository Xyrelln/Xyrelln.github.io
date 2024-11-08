import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './QueryForm.scss';
import { useState } from 'react';
import { BACKEND_URL, GOOGLE_API_KEY } from '../config.ts';
import { TimelineData } from './types.ts';


interface QueryFormProps {
    setTimelineData: React.Dispatch<React.SetStateAction<TimelineData | null>>;
    setShowResultPanel: React.Dispatch<React.SetStateAction<boolean>>;
    setForcastCityAndState: React.Dispatch<React.SetStateAction<string>>;
}

const QueryForm: React.FC<QueryFormProps> = ({ setTimelineData, setShowResultPanel, setForcastCityAndState }) => {
    const [isAutodetect, setIsAutodetect] = useState<boolean>(false);
    const [street, setStreet] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [state, setState] = useState<string>('');
    const [streetError, setStreetError] = useState<string>('');
    const [cityError, setCityError] = useState<string>('');


    const fetchIpinfo = async () => {
        try {
            const fetchRes = await fetch(`${BACKEND_URL}/ipinfo`);
            if (!fetchRes.ok) {
                throw new Error(`HTTP error! Status: ${fetchRes.status}`);
            }
            const data = await fetchRes.json();
            setForcastCityAndState(data.city + ', ' + data.region);
            return data;
        } catch (err) {
            console.error('Error fetching IP info:', err);
            return null;
        }
    };

    const fetchTimelineWithAutodetect = async () => {
        const data = await fetchIpinfo();
        if (!data || !data.loc) {
            console.warn("Warning: No data.loc found when fetchTimelineWithAutodetect()");
            return;
        }
        const latlng = data.loc; // "34.0030,-118.2863"
        
        try {
            const response = await fetch(`${BACKEND_URL}/weather-timeline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ location: latlng }),
            });
    
            if (!response.ok) {
                throw new Error(`Error fetching timeline with autodetect: ${response.status}`);
            }
    
            const timelineData = await response.json();
            timelineData['location'] = latlng;
            console.log(timelineData);
            return timelineData;
        } catch (err) {
            console.error(err);
            return null;
        }
    };    

    const fetchTimelineWithAddress = async () => {
        try {
            // fetch google geolocation for latlng, return "lat, lng"
            const fetchLatlng = async (fullQueryAddress: string) => {
                console.log(`fetching latlng of ${fullQueryAddress}`);
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${fullQueryAddress}&key=${GOOGLE_API_KEY}`);
                
                if (!response.ok) {
                    throw new Error(`Error fetching latlng within fetchTimelineWithAddress(): ${response.status}`);
                }

                const latlng: string = await response.json()
                    .then(data => data.results[0].geometry.location.lat + ', ' + data.results[0].geometry.location.lng);
                return latlng;
            };

            const fullQueryAddress: string = city + ', ' + street + ',' + state;
            const latlng: string = await fetchLatlng(fullQueryAddress);
            const response = await fetch(`${BACKEND_URL}/weather-timeline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ location: latlng }),
            });
    
            if (!response.ok) {
                throw new Error(`Error fetching timeline with autodetect: ${response.status}`);
            }
    
            const timelineData = await response.json();
            timelineData['location'] = latlng;
            console.log(timelineData);
            return timelineData;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const handleAutodetectClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsAutodetect(e.target.checked);
        if (e.target.checked) {
            setStreetError('');
            setCityError('');
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>, setError: React.Dispatch<React.SetStateAction<string>>) => {
        if (isAutodetect) return;
        const inputValue = event.target.value;
        const isValid = /^[a-zA-Z0-9\s]*$/.test(inputValue);

        if (!isValid) setError(`Please enter a valid value`);
        else setError('');
    };    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('submitted');
        if (streetError || cityError) return;
        let timelineData = isAutodetect 
            ? await fetchTimelineWithAutodetect()
            : await fetchTimelineWithAddress();
        setTimelineData(timelineData);
        setShowResultPanel(true);
    };

    return (
        <div id='div-main-query'>
            <h4>Weather Search 🌥️</h4>
            <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-1 row' controlId='formStreet'>
                    <Form.Label className='col-md-3 required'>Street</Form.Label>
                    <div className='col-md-8'>
                        <Form.Control
                            type='text'
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            onBlur={(e) => handleOnBlur(e, setStreetError)}
                            required
                            isInvalid={!!streetError && !isAutodetect}
                            disabled={isAutodetect}
                        />
                        <Form.Control.Feedback type="invalid">
                            {streetError}
                        </Form.Control.Feedback>
                    </div>
                </Form.Group>
                <Form.Group className='mb-1 row' controlId='formCity'>
                    <Form.Label className='col-md-3 required'>City</Form.Label>
                    <div className='col-md-8'>
                        <Form.Control
                            type='text'
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onBlur={(e) => handleOnBlur(e, setCityError)}
                            required
                            isInvalid={!!cityError && !isAutodetect}
                            disabled={isAutodetect}
                        />
                        <Form.Control.Feedback type="invalid">
                            {cityError}
                        </Form.Control.Feedback>
                    </div>
                </Form.Group>
                <Form.Group className='row' controlId='formState'>
                    <Form.Label className='col-md-3 form-label required'>State</Form.Label>
                    <div className='col-md-4'>
                        <Form.Select required value={state} onChange={(e) => setState(e.target.value)} disabled={isAutodetect}>
                            <option value=''>Select your state</option>
                            <option value="AL">Alabama</option>
                            <option value="AK">Alaska</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            <option value="CA">California</option>
                            <option value="CO">Colorado</option>
                            <option value="CT">Connecticut</option>
                            <option value="DE">Delaware</option>
                            <option value="DC">District Of Columbia</option>
                            <option value="FL">Florida</option>
                            <option value="GA">Georgia</option>
                            <option value="HI">Hawaii</option>
                            <option value="ID">Idaho</option>
                            <option value="IL">Illinois</option>
                            <option value="IN">Indiana</option>
                            <option value="IA">Iowa</option>
                            <option value="KS">Kansas</option>
                            <option value="KY">Kentucky</option>
                            <option value="LA">Louisiana</option>
                            <option value="ME">Maine</option>
                            <option value="MD">Maryland</option>
                            <option value="MA">Massachusetts</option>
                            <option value="MI">Michigan</option>
                            <option value="MN">Minnesota</option>
                            <option value="MS">Mississippi</option>
                            <option value="MO">Missouri</option>
                            <option value="MT">Montana</option>
                            <option value="NE">Nebraska</option>
                            <option value="NV">Nevada</option>
                            <option value="NH">New Hampshire</option>
                            <option value="NJ">New Jersey</option>
                            <option value="NM">New Mexico</option>
                            <option value="NY">New York</option>
                            <option value="NC">North Carolina</option>
                            <option value="ND">North Dakota</option>
                            <option value="OH">Ohio</option>
                            <option value="OK">Oklahoma</option>
                            <option value="OR">Oregon</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="RI">Rhode Island</option>
                            <option value="SC">South Carolina</option>
                            <option value="SD">South Dakota</option>
                            <option value="TN">Tennessee</option>
                            <option value="TX">Texas</option>
                            <option value="UT">Utah</option>
                            <option value="VT">Vermont</option>
                            <option value="VA">Virginia</option>
                            <option value="WA">Washington</option>
                            <option value="WV">West Virginia</option>
                            <option value="WI">Wisconsin</option>
                            <option value="WY">Wyoming</option>
                        </Form.Select>
                    </div>
                </Form.Group>
                <hr />
                <Form.Group className='autodetect-location d-flex justify-content-center' controlId='autodetect-location'>
                    <Form.Label className='me-4 required'>Autodetect Location</Form.Label>
                    <Form.Check type='checkbox' label='Current Location' onChange={handleAutodetectClick} />
                </Form.Group>
                <div className='buttons'>
                    <Button variant="primary" type="submit">
                        🔍 Search
                    </Button>
                    <Button className="clear" type="button" onClick={() => {
                        setStreet('');
                        setCity('');
                        setState(''); 
                        setStreetError('');
                        setCityError('');
                        setTimelineData(null);
                    }}>
                        ≡ Clear
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default QueryForm;
