import { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import ResultsPanel from './ResultsPanel';
import FavoritesPanel from './FavoritesPanel';
import './MainPanel.scss';
import { TimelineData, MeteogramData } from './types';

interface MainPanelProps {
    timelineData: TimelineData | null;
    meteogramData: MeteogramData | null;
    setMeteogramData: React.Dispatch<React.SetStateAction<MeteogramData | null>>;
    forcastCityAndState: string;
}

const MainPanel: React.FC<MainPanelProps> = ({ timelineData, meteogramData, setMeteogramData, forcastCityAndState }) => {
    const [selectedTab, setSelectedTab] = useState<string>("results");

    return (
        <>
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
                    />
                ) : selectedTab === "favorites" ? (
                    <div></div>
                ) : null}
            </div>        
        </>
    );
}

export default MainPanel;
