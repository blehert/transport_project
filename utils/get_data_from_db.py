from typing import Tuple
from collections import defaultdict
import pymysql.cursors

import config

# Подключаемся к базе
connection = pymysql.connect(
    host=config.SQL_HOST,
    user=config.SQL_USER,
    password=config.SQL_PASSWD,
    database=config.FEEDS_DB_NAME,
    cursorclass=pymysql.cursors.DictCursor)


def get_route_from_db():
    with connection.cursor() as cursor:
        sql = 'SELECT DISTINCT `route_id`, `route_short_name` FROM `pat_routes`'
        cursor.execute(sql)
        result = cursor.fetchall()
        cursor.close()
        # всего получаем 105 вместо 134 из базы(тк дублируются sekopId)
        return result


def get_stops_info_from_db():
    with connection.cursor() as cursor:
        sql = "SELECT * FROM `spp`"
        cursor.execute(sql)
        result = cursor.fetchall()
        cursor.close()
        return result


def get_route_stops(route_stops: Tuple[str,], db=config.FEEDS_DB_NAME):
    """
    Возвращает таблицу остановок с названиями и координатами по заданному списку id
    """
    with connection.cursor() as cursor:
        sql = f"SELECT stop_id, stop_name, stop_lat, stop_lon " \
              f"FROM stops s WHERE s.stop_id IN {route_stops} " \
              f"ORDER BY FIELD(s.stop_id, {str(route_stops)[1:-1]})"
        cursor.execute(sql)
        result = cursor.fetchall()
        cursor.close()
        return result


def split_objects_by_route():
    data_list = get_stops_info_from_db()
    # Создаем словарь с вложенными словарями
    processed_data = defaultdict(
        lambda: defaultdict(lambda: defaultdict(list)))
    # Обработка исходного списка
    for obj in data_list:
        route_short_name, trip_direction, trip_number = (obj['route_short_name'], obj['trip_direction'],
                                                         obj['trip_number'])
        # Удаляем ненужные поля и добавляем объект в соответствующий словарь
        processed_data[route_short_name][trip_direction][trip_number].append(
            {key: value for key, value in obj.items() if
             key not in {'route_short_name', 'trip_direction',
                         'trip_number'}})
    # Преобразование defaultdict в обычный словарь
    final_result = {route_short_name: {trip_direction: dict(trips) for trip_direction, trips in directions.items()}
                    for route_short_name, directions in processed_data.items()}
    return final_result


def get_ts_data_from_db():
    # Подключаемся к базе
    connection1 = pymysql.connect(
        host=config.SQL_HOST,
        user=config.SQL_USER,
        password=config.SQL_PASSWD,
        database=config.BASE_TS_DB_NAME,
        cursorclass=pymysql.cursors.DictCursor)

    with connection1.cursor() as cursor:
        sql = f'SELECT  ts.garage_number, ts.gos_number, ts.modification, ts.year_release, ts.class, sekop.vendor, ' \
              f'sekop.modification_SEKOP, sekop.validator_with_bt, sekop.validator_without_bt ' \
              f'FROM BaseTS ts ' \
              f'JOIN BaseSEKOP sekop ON ts.vin = sekop.vin'

        cursor.execute(sql)
        result = cursor.fetchall()
        cursor.close()
        return result


def get_th_data_from_db():
    # Подключаемся к базе
    connection1 = pymysql.connect(
        host=config.SQL_HOST,
        user=config.SQL_USER,
        password=config.SQL_PASSWD,
        database=config.BASE_TS_DB_NAME,
        cursorclass=pymysql.cursors.DictCursor)

    with connection1.cursor() as cursor:
        sql = f'SELECT  ts.garage_number, ts.gos_number, ts.modification, th.vin, ' \
              f'th.brand_model_tachograph, th.date_verification_tachograph, ' \
              f'th.tachograph_numb, th.nkm_skzi_numb, ' \
              f'th.ncm_end_date, th.date_calibration ' \
              f'FROM BaseTS ts ' \
              f'JOIN Base_of_tachographs th ON ts.vin = th.vin'

        cursor.execute(sql)
        result = cursor.fetchall()
        cursor.close()
        return result
