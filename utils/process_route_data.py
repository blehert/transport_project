import config
from utils.get_data_from_db import get_route_stops


def process_route_data(route_data):
    track = route_data['path']
    stopIDs = route_data['stopIDs']
    stopsDots = []
    if not isinstance(stopIDs, tuple):
        stopIDs = tuple(stopIDs)
    result = get_route_stops(stopIDs, db=config.FEEDS_DB_NAME)
    for obj in result:
        if str(obj['stop_id']) in stopIDs:
            stopsDots.append([float(obj['stop_lat']), float(
                obj['stop_lon']), str(obj['stop_name'])])
    track2list = [[point['lat'], point['lon']] for point in track]
    return track2list, stopsDots
