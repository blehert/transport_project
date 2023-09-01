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
    const [coordinates, setCoordinates] = useState([])
    const [backCoordinates, setBackCoordinates] = useState([])
    const iframeRef = useRef(null);

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
            const dots = res.data[0].data[0].path
            dots.forEach(function (obj) {
                obj.lng = obj.lon;
                delete obj.lon;
            });
            setCoordinates(dots);
            const backDots = res.data[1].data[0].path
            backDots.forEach(function (obj) {
                obj.lng = obj.lon;
                delete obj.lon;
            });
            setBackCoordinates(backDots);


            // const newHtml = res.data
            // setIframeHtml(newHtml);
            // console.log(newHtml)
            // return newHtml
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


    // шаблон для карты
    let config = {
        minZoom: 7,
        maxZoom: 18,
    };
    const zoom = 13
    let index, stopId;


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
    // создание карты
    const map = L.map('map')
    //   прямые координаты
      const coordinates = ${JSON.stringify(coordinates)};
       L.polyline(coordinates, { color: 'blue' }).addTo(map);
    //   обратные координаты
      const backCoordinates = ${JSON.stringify(backCoordinates)};
      L.polyline(backCoordinates, { color: 'green' }).addTo(map);
    // создание карты
     map.setView(coordinates[0], 13);

// Создаем слои для маршрута, остановок и начала/конца маршрута
var busRouteLayer = L.layerGroup().addTo(map);
var backBusRouteLayer = L.layerGroup().addTo(map);
var busStopLayer = L.layerGroup().addTo(map);
var backBusStopLayer = L.layerGroup().addTo(map);
var startEndRouteLayer = L.layerGroup().addTo(map);

// Добавляем полилинию маршрута
var polyline = L.polyline(coordinates, { color: 'green' }).addTo(busRouteLayer);
// центрируем карту относительно polyline
map.fitBounds(polyline.getBounds());

// Если есть обратный маршрут и остановки, то добавляем их
if (${JSON.stringify(backCoordinates)}) {
    var busBackRouteLayer = L.layerGroup().addTo(map);
    var busBackStopLayer = L.layerGroup().addTo(map);

    L.polyline(${JSON.stringify(backCoordinates)}, { color: 'blue' }).addTo(busBackRouteLayer);

}

// Создаем маркеры для начала и конца маршрута
var startCoordination = coordinates[0];
var endCoordination = coordinates[coordinates.length - 1];

// Создаем иконку маркера (здесь вы можете заменить "icon-url" на URL вашей иконки)
var customIcon = L.icon({
    iconUrl: 'marker.png', // Путь к изображению вашей иконки
    iconSize: [32, 32],     // Размер иконки (ширина, высота)
    iconAnchor: [15, 30],   // Точка привязки иконки (центр нижней части)
    popupAnchor: [0, -30]   // Позиция всплывающей подсказки (над иконкой)
});

// Создаем маркер с иконкой
var startMarker = L.marker(startCoordination, {
    icon: customIcon,
    title: '№ маршрута',
    // Дополнительные параметры тултипа (если нужно)
}).addTo(startEndRouteLayer);

// Создаем маркер с иконкой
var endMarker = L.marker(endCoordination, {
    icon: customIcon,
    title: '№ маршрута',
    // Дополнительные параметры тултипа (если нужно)
}).addTo(startEndRouteLayer);

// Добавляем слой с маркерами на карту
startEndRouteLayer.addTo(map);

// Вычисляем границы карты
var bounds = L.latLngBounds(${JSON.stringify(coordinates)});

// Добавляем контроль слоев
L.control.layers(null, {
    'Маршрут автобуса (направление 1)': busRouteLayer,
    'Маршрут автобуса (направление 2)': backBusRouteLayer,
    'Остановки автобуса (направление 1)': busStopLayer,
    'Остановки автобуса (направление 2)': backBusStopLayer,
    'Начало и конец маршрута': startEndRouteLayer,
}).addTo(map);

    // const stopIds = [27589,31671,2932,4212,3671,2956,3330,3127,3652,3128,3535,3129,22956,28866,4161,1522,2967,1373,1375,4165,3058,4375,2976,22962,35835,2842,22314,31004,3910,2077,1655,4168,4169,1334,23716,24311,35082]

    // stopIds.forEach((stopId, index) => {
    //   const stopCoord = coordinates[index];
    //   if (stopCoord) {
    //     L.circleMarker([stopCoord.lat, stopCoord.lng], { radius: 8, color: 'red' })
    //       .addTo(map)
    //       .bindPopup('Остановка ${stopId}');
    //   }
    // });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);
  </script>
  </body>
  </html>`


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
