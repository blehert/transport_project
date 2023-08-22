// импорт библиотек
import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import axios from 'axios';

// импорт своих функций
import { saveToLocalStorage, restoreFromLocalStorage } from '../utils/get_set_data_from_ls'

// константы
const ROUTE_DATA_URL = 'http://localhost:5000/route_data';
const TRIP_DATA_URL = 'http://localhost:5000/trip_data';
const ROUTE_URL = 'http://localhost:5000/route';



const RouteSelect = () => {

  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [tripOptions, setTripOptions] = useState([]);
  const [selectedTripOption, setSelectedTripOption] = useState('');

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
      await axios.post(ROUTE_URL, results);
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


  return (
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
  );
}

export default RouteSelect;