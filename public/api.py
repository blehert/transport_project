# импорты библиотек
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from uvicorn import run


# импорты своих функций и файлов
from utils.get_data_from_db import split_objects_by_route
from utils.process_route_data import process_route_data
from utils.create_map import *
from utils.get_data_from_db import get_route_from_db
from utils.get_data_from_db import get_ts_data_from_db
from utils.get_data_from_db import get_th_data_from_db


app = FastAPI()

# Добавление промежуточного ПО CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить запросы со всех доменов
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все HTTP методы (GET, POST, etc.)
    allow_headers=["*"],  # Разрешить все заголовки в запросе
)


@app.get("/route_data")
async def get_route_date():
    result = get_route_from_db()
    return result


@app.get("/trip_data")
async def get_trip_date():
    result = split_objects_by_route()
    return result


@app.post("/route")
async def upload_route(request: Request):
    data = await request.json()
    # print('длинна даты', len(data))

    if len(data) == 1:
        track, stopsDots = process_route_data(data[0]['data'][0])
        create_map(track, stopsDots)
    if len(data) > 1:
        track, stopsDots = process_route_data(data[0]['data'][0])
        back_track, back_stopsDots = process_route_data(data[1]['data'][0])
        create_map(track, stopsDots, back_track, back_stopsDots)

    return {"message": "Маршрут успешно отрисован на карте"}


@app.get("/base_ts_data")
async def get_ts_data():
    result = get_ts_data_from_db()
    return result


@app.get("/base_th_data")
async def get_ts_data():
    result = get_th_data_from_db()
    return result


if __name__ == "__main__":
    run("api:app", host="192.168.45.76", port=5000, log_level="info", ssl_keyfile="key.pem", ssl_certfile="cert.pem")
