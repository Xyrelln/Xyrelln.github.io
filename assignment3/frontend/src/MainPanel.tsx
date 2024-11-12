import { useState, useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import ResultsPanel from './ResultsPanel';
import FavoritesPanel from './FavoritesPanel';
import './MainPanel.scss';
import { TimelineData, MeteogramData } from './types';
import { BACKEND_URL } from '../config';
import { Alert } from 'react-bootstrap';
import { ProgressBar } from 'react-bootstrap';


interface MainPanelProps {
    timelineData: TimelineData | null;
    meteogramData: MeteogramData | null;
    setMeteogramData: React.Dispatch<React.SetStateAction<MeteogramData | null>>;
    forcastCityAndState: string;
    isTomorrowIOError: boolean;
    loading: boolean;
}

const MainPanel: React.FC<MainPanelProps> = ({ timelineData, meteogramData, setMeteogramData, forcastCityAndState, isTomorrowIOError, loading }) => {
    const [selectedTab, setSelectedTab] = useState<string>("results");
    const [isCurrentFav, setIsCurrentFav] = useState<boolean>(false);
    const [favorites, setFavorites] = useState<{ city: string, state: string}[]>([]);

    useEffect(() => {
        // Fetch favorite cities and states from the backend
        const fetchFavorites = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/favorites`);
                if (response.ok) {
                const data = await response.json(); 
                // [{"_id":"672ffd392017ba359a1e5409","city":"Los Santos","state":"california"},
                //  {"_id":"673121e2304cebe3b8c1977a","city":"Glendale","state":"California"}]
                setFavorites(data);
                } else {
                console.error("Failed to fetch favorites");
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };
    
        fetchFavorites();
    }, []);

    useEffect(() => {
        if (favorites.length > 0) {
            setIsCurrentFav(
                favorites.filter((favorite) => 
                    favorite.city.toLowerCase() === forcastCityAndState.split(', ')[0].toLowerCase() && favorite.state.toLowerCase() === forcastCityAndState.split(', ')[1].toLowerCase()
                ).length > 0)        
        }
    }, [favorites, timelineData]);

    const removeOneLocalFavorite = (city: string, state: string) => {
        setFavorites(favorites.filter((favorite) => 
            favorite.city !== city || favorite.state !== state
        ))
    };

    const addOneLocalFavorite = (city: string, state: string) => {
        setFavorites([...favorites, { city: city, state: state }]);
    };

    return (
        <>
            {isTomorrowIOError ?         
            <Alert variant='danger'>
                An error occured. Please try again later.
            </Alert>
            : 
            <div className='main-panel'>
                {loading && <ProgressBar animated now={100} label="Loading..." className="mb-3 margin-top-10" />}

                <Nav variant="pills" activeKey={selectedTab} onSelect={(selectedKey) => setSelectedTab(selectedKey!)}>
                    <Nav.Item>
                        <Nav.Link eventKey="results">Results</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="favorites">Favorites</Nav.Link>
                    </Nav.Item>
                </Nav>
                <div className='panels'>
                    {selectedTab === "results" && timelineData !== null ? (
                        <ResultsPanel 
                            timelineData={timelineData} 
                            meteogramData={meteogramData} 
                            setMeteogramData={setMeteogramData} 
                            forcastCityAndState={forcastCityAndState}
                            isCurrentFav={isCurrentFav}
                            setIsCurrentFav={setIsCurrentFav}
                            removeOneLocalFavorite={removeOneLocalFavorite}
                            addOneLocalFavorite={addOneLocalFavorite}
                        />
                    ) : selectedTab === "favorites" ? (
                        <FavoritesPanel favorites={favorites} setFavorites={setFavorites}></FavoritesPanel>
                    ) : null}
                </div>         
            </div>
            }
        </>
    );
}

export default MainPanel;
