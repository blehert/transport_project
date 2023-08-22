import folium


def add_stop_markers(stops, layer):
    for arr in stops:
        stop_lat = arr[0]
        stop_lon = arr[1]
        stop_name = arr[2]
        entrance = 10
        exit = 5
        paid = 10
        stop_time = "14:22"
        popup_content = f"Остановка: {stop_name}\nВход: {entrance}\nВыход: {exit}\nОплата: {paid}\nВремя остановки: {stop_time}"
        marker = folium.Marker(
            location=[stop_lat, stop_lon], popup=popup_content)
        marker.add_to(layer)
        # icon=folium.Icon(color="green") смена цвета маркеров
