import ResultsPanel from './ResultsPanel';
import FavoritesPanel from './FavoritesPanel';
import Button from 'react-bootstrap/Button';
import './MainPanel.scss';
import { useState } from 'react';
import { TimelineData, MeteogramData } from './types';

interface MainPanelProps {
    timelineData: TimelineData | null;
    meteogramData: MeteogramData | null;
    setMeteogramData: React.Dispatch<React.SetStateAction<MeteogramData | null>>;
    showResultPanel: boolean;
    setShowResultPanel: React.Dispatch<React.SetStateAction<boolean>>;
    forcastCityAndState: string;
}

const MainPanel: React.FC<MainPanelProps> = ({ timelineData, meteogramData, setMeteogramData, showResultPanel, setShowResultPanel, forcastCityAndState }) => {
    const [showFavoritePanel, setShowFavoritePanel] = useState<boolean>(false);

    const handleResultsButtonClick = () => {
        setShowResultPanel(true);
        setShowFavoritePanel(false);
    };

    const handleFavoritesButtonClick = () => {
        setShowFavoritePanel(true);
        setShowResultPanel(false);
    };

    return (
        <>
            <div className='buttons-div'>
                <Button onClick={handleResultsButtonClick}>Results</Button>
                <Button className="btn btn-link" onClick={handleFavoritesButtonClick}>Favorites</Button>
            </div>    
            <div className='panels'>
                {showResultPanel && timelineData !== null &&
                <ResultsPanel 
                    timelineData={timelineData} 
                    meteogramData={meteogramData} 
                    setMeteogramData={setMeteogramData} 
                    forcastCityAndState={forcastCityAndState} />}
                {showFavoritePanel && <FavoritesPanel />}
            </div>        
        </>
    );
}

export default MainPanel;
