import pandas as pd


file_path = "D://Users/Revva/Desktop/PS_23-07-27_08-58-07.xlsx"
df = pd.read_excel(file_path)
# print(df)
#
# def filter_data(df, date, time, direction, route_number):
#     filtered_data = df[
#         (df["Дата обследования"] == date) &
#         (df["Номер маршрута"] == route_number) &
#         (df["Направление рейса"] == direction)
#         # (df["Номер рейса"] == trip_number) &
#         # (df["Порядковый номер остановки"] == stop_number) &
#         # (df["Идентификатор остановочного пункта"] == stop_id) &
#         # (df["Наименованиеостановки"] == stop_name) &
#         # (df["Время прибытия на остановку"] == stop_time) &
#         # (df["Вход"] == entrance) &
#         # (df["Выход"] == exit) &
#         # (df["Оплата"] == paid)
#     ]
#     return filtered_data
