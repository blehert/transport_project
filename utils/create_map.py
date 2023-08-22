import folium
from utils.add_stop_markers import add_stop_markers
import config


def create_map(route, stops, back_route=None, back_stops=None):
    map = folium.Map(location=route[0], zoom_start=13)
    bus_route_layer = folium.FeatureGroup(
        name='Маршрут автобуса (направление 1)')
    bus_stop_layer = folium.FeatureGroup(
        name='Остановки автобуса (направление 1)')
    start_end_route_layer = folium.FeatureGroup(name='Начало и конец маршрута')
    folium.PolyLine(locations=route, color='green').add_to(bus_route_layer)
    add_stop_markers(stops, bus_stop_layer)
    bus_route_layer.add_to(map)
    bus_stop_layer.add_to(map)
    if back_route and back_stops:
        bus_back_route_layer = folium.FeatureGroup(
            name='Маршрут автобуса (направление 2)')
        bus_back_stop_layer = folium.FeatureGroup(
            name='Остановки автобуса (направление 2)')
        folium.PolyLine(locations=back_route, color='blue').add_to(
            bus_back_route_layer)
        add_stop_markers(back_stops, bus_back_stop_layer)
        bus_back_route_layer.add_to(map)
        bus_back_stop_layer.add_to(map)
    for coordination in [route[0], route[-1]]:
        folium.Marker(location=coordination, icon=folium.Icon(color='red'),
                      tooltip=folium.Tooltip('№ маршрута', permanent=True, sticky=True)).add_to(start_end_route_layer)
    start_end_route_layer.add_to(map)
    min_latitude, max_latitude = min(
        point[0] for point in route), max(point[0] for point in route)
    min_longitude, max_longitude = min(
        point[1] for point in route), max(point[1] for point in route)
    map.fit_bounds([[min_latitude, min_longitude],
                   [max_latitude, max_longitude]])
    folium.LayerControl().add_to(map)
    map.save(config.MAP_PATH)
