import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './QueryForm.scss';
import { useState, useEffect } from 'react';
import { BACKEND_URL, GOOGLE_API_KEY } from '../config.ts';
import { TimelineData, AutoCompleteSuggestions } from './types.ts';


interface QueryFormProps {
    setTimelineData: React.Dispatch<React.SetStateAction<TimelineData | null>>;
    setShowResultPanel: React.Dispatch<React.SetStateAction<boolean>>;
    setForcastCityAndState: React.Dispatch<React.SetStateAction<string>>;
    setIsTomorrowIOError: React.Dispatch<React.SetStateAction<boolean>>;
}

const QueryForm: React.FC<QueryFormProps> = ({ setTimelineData, setShowResultPanel, setForcastCityAndState, setIsTomorrowIOError }) => {
    const [isAutodetect, setIsAutodetect] = useState<boolean>(false);
    const [street, setStreet] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [state, setState] = useState<string>('');
    const [streetError, setStreetError] = useState<string>('');
    const [cityError, setCityError] = useState<string>('');
    const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<AutoCompleteSuggestions | null>(null);
    const [haveSelectedState, setHaveSelectedState] = useState<boolean>(false);
    const uniqueCities = new Set<string>();
    const [filteredStates, setFilteredStates] = useState<string[]>([]);
    const [fetchedIpLocInfo, setFetchedIpLocInfo] = useState<string>('');

    const states = [
        { value: 'AL', label: 'Alabama' },
        { value: 'AK', label: 'Alaska' },
        { value: 'AZ', label: 'Arizona' },
        { value: 'AR', label: 'Arkansas' },
        { value: 'CA', label: 'California' },
        { value: 'CO', label: 'Colorado' },
        { value: 'CT', label: 'Connecticut' },
        { value: 'DE', label: 'Delaware' },
        { value: 'DC', label: 'District Of Columbia' },
        { value: 'FL', label: 'Florida' },
        { value: 'GA', label: 'Georgia' },
        { value: 'HI', label: 'Hawaii' },
        { value: 'ID', label: 'Idaho' },
        { value: 'IL', label: 'Illinois' },
        { value: 'IN', label: 'Indiana' },
        { value: 'IA', label: 'Iowa' },
        { value: 'KS', label: 'Kansas' },
        { value: 'KY', label: 'Kentucky' },
        { value: 'LA', label: 'Louisiana' },
        { value: 'ME', label: 'Maine' },
        { value: 'MD', label: 'Maryland' },
        { value: 'MA', label: 'Massachusetts' },
        { value: 'MI', label: 'Michigan' },
        { value: 'MN', label: 'Minnesota' },
        { value: 'MS', label: 'Mississippi' },
        { value: 'MO', label: 'Missouri' },
        { value: 'MT', label: 'Montana' },
        { value: 'NE', label: 'Nebraska' },
        { value: 'NV', label: 'Nevada' },
        { value: 'NH', label: 'New Hampshire' },
        { value: 'NJ', label: 'New Jersey' },
        { value: 'NM', label: 'New Mexico' },
        { value: 'NY', label: 'New York' },
        { value: 'NC', label: 'North Carolina' },
        { value: 'ND', label: 'North Dakota' },
        { value: 'OH', label: 'Ohio' },
        { value: 'OK', label: 'Oklahoma' },
        { value: 'OR', label: 'Oregon' },
        { value: 'PA', label: 'Pennsylvania' },
        { value: 'RI', label: 'Rhode Island' },
        { value: 'SC', label: 'South Carolina' },
        { value: 'SD', label: 'South Dakota' },
        { value: 'TN', label: 'Tennessee' },
        { value: 'TX', label: 'Texas' },
        { value: 'UT', label: 'Utah' },
        { value: 'VT', label: 'Vermont' },
        { value: 'VA', label: 'Virginia' },
        { value: 'WA', label: 'Washington' },
        { value: 'WV', label: 'West Virginia' },
        { value: 'WI', label: 'Wisconsin' },
        { value: 'WY', label: 'Wyoming' }
    ];

    useEffect(() => {
        if (city) {
            autoComplete(city);
        } else {
            setAutoCompleteSuggestions(null);
        }
    }, [city]);

    const checkTomorrowIOPayloadError = (jsonObject: TimelineData) => {
        setIsTomorrowIOError(typeof jsonObject?.data?.timelines === 'undefined');
    }

    const fetchIpinfo = async () => {
        try {
            const fetchRes = await fetch(`${BACKEND_URL}/ipinfo`);
            if (!fetchRes.ok) {
                throw new Error(`HTTP error! Status: ${fetchRes.status}`);
            }
            const data = await fetchRes.json();
            setForcastCityAndState(data.city + ', ' + data.region);
            setFetchedIpLocInfo(data.loc);
            return data;
        } catch (err) {
            console.error('Error fetching IP info:', err);
            return null;
        }
    };

    const fetchTimelineWithAutodetect = async () => {
        if (!fetchedIpLocInfo) {
            console.warn("Warning: No data.loc found when fetchTimelineWithAutodetect()");
            return;
        }
        const latlng = fetchedIpLocInfo; // "34.0030,-118.2863"
        
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
            setForcastCityAndState(city + ', ' + state);
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
        checkTomorrowIOPayloadError(timelineData);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setState(event.target.value);
        const filtered = states
          .filter((state) => state.label.toLowerCase().includes(query.toLowerCase()))
          .map((state) => state.label);
        setFilteredStates(filtered);
    };

    const autoComplete = async (input: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/autocomplete/${input}`);
            const data = await response.json();
            setAutoCompleteSuggestions(data);
        } catch (error) {
            console.error("Error fetching autocomplete suggestions:", error);
        }
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
                            list="city-suggestions"
                        />
                        <Form.Control.Feedback type="invalid">
                            {cityError}
                        </Form.Control.Feedback>
                        <datalist id="city-suggestions">
                        {
                            autoCompleteSuggestions?.predictions.map((prediction, index) => {
                            const city = prediction.terms[0].value;
                            if (!uniqueCities.has(city)) {
                                uniqueCities.add(city);
                                return <option key={index} value={city} />;
                            }
                            return null;
                        })}
                        </datalist>
                    </div>
                </Form.Group>

                <Form.Group className="row" controlId="formState">
                <Form.Label className="col-md-3 form-label required">State</Form.Label>
                <div className="col-md-4">
                    <Form.Control
                    type="text"
                    value={state}
                    onChange={(e) => {handleInputChange(e); setHaveSelectedState(true); }}
                    required
                    isInvalid={state === '' && haveSelectedState}
                    disabled={isAutodetect}
                    list="state-suggestions"
                    />
                    <Form.Control.Feedback type="invalid">
                    {state === '' && haveSelectedState ? 'Please select a state' : ''}
                    </Form.Control.Feedback>
                    <datalist id="state-suggestions">
                    {filteredStates.map((stateLabel, index) => (
                        <option key={index} value={stateLabel} />
                    ))}
                    </datalist>
                </div>
                </Form.Group>
                <hr />
                <Form.Group className='autodetect-location d-flex justify-content-center' controlId='autodetect-location'>
                    <Form.Label className='me-4 required'>Autodetect Location</Form.Label>
                    <Form.Check type='checkbox' label='Current Location' onChange={handleAutodetectClick} onClick={fetchIpinfo} />
                </Form.Group>
                <div className='buttons'>
                    <Button variant="primary" type="submit" disabled={isAutodetect && fetchedIpLocInfo === ''} >
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
