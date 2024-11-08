import { useState } from 'react';
import QueryForm from './QueryForm';
import MainPanel from './MainPanel';
import './App.scss';
import { MeteogramData, TimelineData } from './types';


function App() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [meteogramData, setMeteogramData] = useState<MeteogramData | null>(null);
  const [showResultPanel, setShowResultPanel] = useState<boolean>(false);
  const [forcastCityAndState, setForcastCityAndState] = useState<string>('');

  return (
    <>
      <QueryForm setTimelineData={setTimelineData} setShowResultPanel={setShowResultPanel} setForcastCityAndState={setForcastCityAndState} />
      <MainPanel timelineData={timelineData} meteogramData={meteogramData} setMeteogramData={setMeteogramData} showResultPanel={showResultPanel} setShowResultPanel={setShowResultPanel} forcastCityAndState={forcastCityAndState} />
    </>
  )
}

export default App
