import { useState } from 'react';
import QueryForm from './QueryForm';
import MainPanel from './MainPanel';
import './App.scss';
import { MeteogramData, TimelineData } from './types';


function App() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [meteogramData, setMeteogramData] = useState<MeteogramData | null>(null);
  const [forcastCityAndState, setForcastCityAndState] = useState<string>('');
  const [isTomorrowIOError, setIsTomorrowIOError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <>
      <QueryForm setTimelineData={setTimelineData} setForcastCityAndState={setForcastCityAndState} setIsTomorrowIOError={setIsTomorrowIOError} setLoading={setLoading} />
      <MainPanel timelineData={timelineData} meteogramData={meteogramData} setMeteogramData={setMeteogramData} forcastCityAndState={forcastCityAndState} isTomorrowIOError={isTomorrowIOError} loading={loading} />
    </>
  )
}

export default App
