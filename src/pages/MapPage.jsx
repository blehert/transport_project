// //  Импорты библиотек
// // import { useState } from 'react';

// // Импорты компонентов
// import Iframe from '../components/Iframe';
// import RouteSelect from '../components/RouteSelect';
// // import MapSkeleton from '../components/MapSkeleton';


// const MapPage = () => {
//   // const [load, setLoad] = useState(true)
//   // const onLoad = () => {
//   //   setLoad(false)
//   // }

//   // const wait = setTimeout(onLoad, 3000);

//   return (
//     <div className='map-page'>
//       <RouteSelect />
//       <Iframe />
//       {/* {load ? <MapSkeleton className='map-skeleton' /> : <Iframe props={wait} />} */}
//     </div>
//   );
// };

// export default MapPage;
// импорт библиотек
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';

// импорт своих функций
import { saveToLocalStorage, restoreFromLocalStorage } from '../utils/get_set_data_from_ls'

// константы
const ROUTE_DATA_URL = 'https://192.168.45.76:5000/route_data';
const TRIP_DATA_URL = 'https://192.168.45.76:5000/trip_data';
const ROUTE_URL = 'https://192.168.45.76:5000/route';

const MapPage = () => {

    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [tripOptions, setTripOptions] = useState([]);
    const [selectedTripOption, setSelectedTripOption] = useState('');
    const [coordinates, setCoordinates] = useState([]);
    const [backCoordinates, setBackCoordinates] = useState([]);
    const iframeRef = useRef(null);
    const [stopsDots, setStopsDots] = useState([]);
    // const [backStops, setBackStops] = useState([]);

    const fetchRouteData = useCallback(async () => {
        try {
            const res = await axios.get(ROUTE_DATA_URL);
            const options = res.data.map(({ route_id: value, route_short_name: label }) => ({ value, label }));
            setOptions(options);

            const tripRes = await axios.get(TRIP_DATA_URL)
            const tripData = tripRes.data;
            const extractedTripOptions = extractTripOptions(tripData);
            setTripOptions(extractedTripOptions);
        } catch (error) {
            console.error(error);
        }
    }, [])

    useEffect(() => {
        fetchRouteData()
        restoreFromLocalStorage('options', setOptions);
        restoreFromLocalStorage('selectedOption', setSelectedOption);
    }, [fetchRouteData]);



    //  const restoreLocalStorageData = () => {
    //    const storedOptions = localStorage.getItem('options');
    //    const storedSelectedOption = localStorage.getItem('selectedOption');
    //    console.log(storedSelectedOption)
    //    if (storedOptions) {
    //      setOptions(JSON.parse(storedOptions));
    //    }
    //    if (storedSelectedOption) {
    //      setSelectedOption(JSON.parse(storedSelectedOption));
    //    }
    //  };

    const handleRouteChange = async (selectedRoute) => {
        setSelectedOption(selectedRoute);
        saveToLocalStorage('options', options);
        saveToLocalStorage('selectedOption', selectedRoute);
        const fetchData1 = selectedOption ? fetchDataWithDelay('1', 1000, selectedRoute) : null;
        const fetchData2 = selectedOption ? fetchDataWithDelay('0', 2000, selectedRoute) : null;
        try {
            const results = await Promise.all([
                fetchData1,
                fetchData2,
            ]);
            const res = await axios.post(ROUTE_URL, results);
            console.log(res)
            const dots = res.data.data[0].data[0].path
            console.log(dots)
            dots.forEach(function (obj) {
                obj.lng = obj.lon;
                delete obj.lon;
            });
            setCoordinates(dots);
            const backDots = res.data.data[1].data[0].path
            backDots.forEach(function (obj) {
                obj.lng = obj.lon;
                delete obj.lon;
            });
            setBackCoordinates(backDots);
            const stopsDots = res.data.stopsDots
            console.log(stopsDots)
            setStopsDots(stopsDots)
            // const backStops = res.data.data2[1]
        } catch (error) {
            console.error(error);
        }
    };


    const fetchDataWithDelay = async (direction, delay, selectedRoute) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        try {
            const response = await fetchRouteStops(direction, selectedRoute);
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const fetchRouteStops = async (direction, selectedRoute) => {
        if (selectedRoute) {
            const URL = `https://portal.gpt.adc.spb.ru/Portal/transport/internalapi/routes/stops?routeIDs=${selectedRoute.value}&directions=${direction}`;
            try {
                const res = await axios.get(URL);
                const data = res.data.result;
                const stopIDs = data[0].stopIDs;
                return { direction, data, stopIDs };
            } catch (error) {
                console.error(error);
                return { direction, data: null };
            }
        } else {
            console.log('Какие-то проблемы с базой, никак не получить список роутов!');
            return { direction, data: null };
        }
    };

    const handleTripChange = (selectedTrip) => {
        setSelectedTripOption(selectedTrip);
    };

    const extractTripOptions = (tripData) => {
        if (!tripData) {
            return [];
        }

        return Object.values(tripData).flatMap(directions =>
            Object.values(directions).flatMap(trips =>
                Object.keys(trips)
            )
        ).map(tripNumber => ({ value: tripNumber, label: tripNumber }));
    };

    const str = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>
    #map {
        height: 630px;
    }
    .leaflet-container { font-size: 1rem; }
    .leaflet-control-attribution{display: none;}
    .leaflet-tooltip-pane .leaflet-tooltip:last-child { opacity: 0; }
    </style>
</head>
<body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script>

// Создание карты
const map = L.map('map')

// Создание слоев для маршрута, остановок и начала/конца маршрута
const busRouteLayer = L.layerGroup().addTo(map);
const backBusRouteLayer = L.layerGroup().addTo(map);
const startEndRouteLayer = L.layerGroup().addTo(map);
const busStopsRouteLayer = L.layerGroup().addTo(map);
// const backBusStopsRouteLayer = L.layerGroup().addTo(map);


// Получение координат маршрута и убедитесь, что они корректны
let coordinates = ${JSON.stringify(coordinates)};
let backCoordinates = ${JSON.stringify(backCoordinates)};
let stopsDots = ${JSON.stringify(stopsDots)}

// Создание полилинии маршрута и добавление на карту
const polyline = L.polyline(coordinates, { color: 'blue' }).addTo(busRouteLayer);
const backPolyline = L.polyline(backCoordinates, { color: 'green' }).addTo(backBusRouteLayer);

// Вычисление границ карты на основе координат маршрута
const bounds = L.latLngBounds(coordinates);

// Создание маркеров начала и конца маршрута
const startCoordination = coordinates[0];
const endCoordination = coordinates[coordinates.length - 1];

const customIcon = L.icon({
    iconUrl: 'marker.png',  // Путь к иконке
    iconSize: [32, 32],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

const startMarker = L.marker(startCoordination, {
    icon: customIcon,
    title: 'Начало маршрута'
}).addTo(startEndRouteLayer);

const endMarker = L.marker(endCoordination, {
    icon: customIcon,
    title: 'Конец маршрута'
}).addTo(startEndRouteLayer);

// Добавление остановок на карту
for (const stop of stopsDots) {
    const [lat, lng, popupText] = stop;
    const marker = L.marker([lat, lng]).bindPopup(popupText);
    busStopsRouteLayer.addLayer(marker);
}

// Установка границ карты
map.fitBounds(bounds);

// Добавление плитки OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Добавление контроля слоев
L.control.layers(null, {
    'Маршрут автобуса': busRouteLayer,
    'Обратный маршрут автобуса': backBusRouteLayer,
    'Начало и конец маршрута': startEndRouteLayer,
    'Остановки автобуса': busStopsRouteLayer,
    // 'Обратный остановки автобуса': backBusStopsRouteLayer,
}).addTo(map);
</script >
</body >
  </html > `


    return (
        <div className='map-page'>
            <div className='route_selects'>
                <h2 className='route_selects__title'>Маршрут</h2>
                <Select
                    value={selectedOption}
                    onChange={handleRouteChange}
                    options={options}
                    placeholder="Выберите маршрут"
                    className="route_selects__select"
                />
                <h2 className='route_selects__title'>Рейс</h2>
                <Select
                    value={selectedTripOption}
                    onChange={handleTripChange}
                    options={tripOptions}
                    placeholder="Выберите рейс"
                    className="route_selects__select"
                />
            </div>
            <iframe
                key={selectedOption}
                title="map"
                ref={iframeRef}
                // src="map.html"
                srcDoc={str}
                loading="lazy"
                className="iframe"
                sandbox='allow-scripts'
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
};

export default MapPage;
