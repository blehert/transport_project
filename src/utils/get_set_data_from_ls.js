// сохраняем в localStorage
export  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

// получаем из localStorage
export  const restoreFromLocalStorage = (key, setterFunction) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        setterFunction(JSON.parse(storedValue));
    }
  };
