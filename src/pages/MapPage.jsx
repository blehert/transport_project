//  Импорты библиотек
// import { useState } from 'react';

// Импорты компонентов
import Iframe from '../components/Iframe';
import RouteSelect from '../components/RouteSelect';
// import MapSkeleton from '../components/MapSkeleton';


const MapPage = () => {
  // const [load, setLoad] = useState(true)
  // const onLoad = () => {
  //   setLoad(false)
  // }

  // const wait = setTimeout(onLoad, 3000);

  return (
    <div className='map-page'>
      <RouteSelect />
      <Iframe />
      {/* {load ? <MapSkeleton className='map-skeleton' /> : <Iframe props={wait} />} */}
    </div>
  );
};

export default MapPage;