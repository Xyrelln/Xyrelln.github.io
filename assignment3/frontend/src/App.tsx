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
  const [isTomorrowIOError, setIsTomorrowIOError] = useState<boolean>(false);

  return (
    <>
      <QueryForm setTimelineData={setTimelineData} setShowResultPanel={setShowResultPanel} setForcastCityAndState={setForcastCityAndState} setIsTomorrowIOError={setIsTomorrowIOError} />
      <MainPanel timelineData={timelineData} meteogramData={meteogramData} setMeteogramData={setMeteogramData} forcastCityAndState={forcastCityAndState} isTomorrowIOError={isTomorrowIOError} />
    </>
  )
}

export default App
