import requests
import geopandas as gpd
import pandas as pd
import os
from shapely.geometry import Point
from alive_progress import alive_bar

# ----------------------------------------------------------Locality - OSM -----------------------------------------------------------------
# Extracts locality data from OpenStreetMap for the Lisbon Metropolitan Area
def get_osm_data():
    print("" * 50)
    print("A obter os dados do Open Street Map...")
    print("" * 50)
    query = """
    [out:json];
    area[name="Lisboa"]->.lisboaArea;
    area[name="Setúbal"]->.setubalArea;
    (
    node["place"~"suburb|neighbourhood|hamlet|isolated_dwelling|village"](area.lisboaArea);
    node["place"~"suburb|neighbourhood|hamlet|isolated_dwelling|village"](area.setubalArea);
    );
    out body;
    """
    
    # Sends the request to the Overpass API
    response = requests.get("http://overpass-api.de/api/interpreter", params={'data': query})
    
    # Checks if the request was successful
    if response.status_code == 200:
        print("Os dados do OSM foram obtidos com sucesso.")
        print("" * 50)
        return response.json()
    else:
        print(f"Erro ao obter os dados do OSM: {response.status_code}")
        print("" * 50)
        return None

# Function to convert OSM data into points
def osm_to_geodataframe(osm_data):
    nodes = osm_data['elements']
    data = []

    with alive_bar(len(nodes), spinner='fish',title="A processar os dados do OSM" ) as bar:
        for node in nodes:
            lon = node['lon']
            lat = node['lat']
            name = node.get('tags', {}).get('name', None)
            place = node.get('tags', {}).get('place', None)
        
            if name:
                data.append({
                    'name': name,
                    'place': place,
                    'geometry': Point(lon, lat)
                })
            bar()
    
    # Georeferences the Localities
    gdf = gpd.GeoDataFrame(data, crs="EPSG:4326") #WGS84 - default for OSM
    return gdf

# Executes the function to get OSM data
osm_data = get_osm_data()
if osm_data:
    # Converts OSM data to a shapefile
    localidades_gdf = osm_to_geodataframe(osm_data)
    
    # Path to save the locality shapefile
    localidades_path = r'C:\\Users\\InêsClemente\\OneDrive - TML\\TML - Inês\\DGC\\1 - Análises\\Localidades por paragem\\Localidades.shp'
    
    # Saves the GeoDataFrame as a shapefile
    print("A guardar as localidades no formato shapefile...")
    print("" * 50)    
    localidades_gdf.to_file(localidades_path)
    print(f"O ficheiro shapefile foi guardado em: {localidades_path}")
    print("" * 50)
else:
    print("Não foi possível obter os dados OSM.")
    print("" * 50)
    
#-----------------------------------------------------------Processes---------------------------------------------------------------------
# File paths
lugares_path = r"C:\\Users\\InêsClemente\\OneDrive - TML\\TML - Inês\\DGC\\1 - Análises\\Localidades por paragem\\Lugares_BGRI.shp"
localidades_path = r"C:\\Users\\InêsClemente\\OneDrive - TML\\TML - Inês\\DGC\\1 - Análises\\Localidades por paragem\\Localidades.shp"
stops_path = r"C:\\Users\\InêsClemente\\OneDrive - TML\\TML - Inês\\DGC\\1 - Análises\\Localidades por paragem\\stops.txt"

# Loads the shapefiles using the geopandas library
lugares = gpd.read_file(lugares_path)  # Polygons
localidades = gpd.read_file(localidades_path)  # Points

# Ensures both files are in the same coordinate system
if lugares.crs != "EPSG:4326":
    lugares = lugares.to_crs("EPSG:4326")
if localidades.crs != "EPSG:4326":
    localidades = localidades.to_crs("EPSG:4326")

#-------------------------------------------------------- Localidades e Lugares ------------------------------------------------------------
# Spatial join: associates the polygon (place) with the point (locality) that contains it
lugares_com_localidades = gpd.sjoin(lugares, localidades, how="left", predicate="contains")

# Selects the relevant columns
lugares_com_localidades = lugares_com_localidades[['geometry','Lugar', 'name']]

# --------------------------------------------------------------- Stops --------------------------------------------------------------------
# Loads the CSV with 'stop_id'
stops_df = pd.read_csv(stops_path, encoding='utf-8-sig')
#stops_df = pd.read_csv(stops_path, dtype={'stop_id': str}, encoding='utf-8-sig')

# Checks the column names of the CSV file
print("Colunas disponíveis no ficheiro stops.csv:", stops_df.columns)
print("" * 50)

# Loads the CSV as a GeoDataFrame
stops_gdf = gpd.GeoDataFrame(
    stops_df,
    geometry=gpd.points_from_xy(stops_df.stop_lon, stops_df.stop_lat),
    crs="EPSG:4326"  # Latitude/Longitude
)

#------------------------------------------------------ Stops - Lugares - Localidades ------------------------------------------------------
# Spatial join to associate 'stop_id' with polygons
lugares_com_stops = gpd.sjoin(stops_gdf[['stop_id','stop_name','stop_lat','stop_lon','geometry']], lugares_com_localidades, how="left",predicate="within")
print(lugares_com_stops)

# Ensure 'stop_id' is still a string after all operations
lugares_com_stops['stop_id'] = lugares_com_stops['stop_id'].astype(str)

# Renames the 'name' column to 'Localidade'
lugares_com_stops.rename(columns={'name': 'Localidade'}, inplace=True)

# Creates a new column 'Localidades_stops'
lugares_com_stops['Localidades_stops'] = lugares_com_stops.apply(
    lambda x: x['Localidade'] if pd.notna(x['Localidade']) and x['Localidade'] != '' else x['Lugar'],
    axis=1
)

# Organizes the columns in the order to display
lugares_com_stops = lugares_com_stops[['stop_id','stop_name','stop_lat','stop_lon','Lugar','Localidade','Localidades_stops','geometry']]

# Print to verify if stop_id still has the leading zeros
print(lugares_com_stops.head())

#----------------------------------------------------------------- Save ------------------------------------------------------------------
# Path to the folder to save the file
output_directory = r"C:\\Users\\InêsClemente\\OneDrive - TML\\TML - Inês\\DGC\\1 - Análises\\Localidades por paragem\\Resultado"
if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# Complete path for the shapefile (result)
output_shapefile_path = os.path.join(output_directory, "lugares_com_stops.shp")

# Renames columns to have 10 characters or less
lugares_com_stops.rename(columns={
    'Localidade': 'Locality', 
    'Localidades_stops': 'Local_stop'
}, inplace=True)

# Converts to GeoDataFrame if it is not already
#if not isinstance(lugares_com_stops, gpd.GeoDataFrame):
    #lugares_com_stops = gpd.GeoDataFrame(lugares_com_stops, geometry='geometry', crs=lugares.crs)

# Saves the new shapefile with polygons (places) and corresponding 'stop_id'
lugares_com_stops.to_file(output_shapefile_path)
print(f"A shapefile (resultado) de localidades por paragem foi guardada em: {output_shapefile_path}")
print("" * 50)

# Complete path for the CSV file (result)
output_stops_path = os.path.join(output_directory, "lugares_com_stops.csv")

# Garante que 'stop_id' está formatado corretamente como string (sem conversão para int)
lugares_com_stops['stop_id'] = lugares_com_stops['stop_id'].apply(lambda x: f"{x}")

# Converts 'stop_id' to integer and then to string
#lugares_com_stops.drop(columns='geometry').to_csv(output_stops_path, index=False)
#lugares_com_stops['stop_id'] = lugares_com_stops['stop_id'].astype(int).astype(str)

# Displays the first rows of the result
print("-" * 200)
print("" * 50)
print(lugares_com_stops['stop_id'].apply(lambda x: f"'{x}'").head())  # Força a exibição com zeros à esquerda
print("" * 50)

# Saves the DataFrame as a CSV file, excluding the geometry
lugares_com_stops.drop(columns='geometry').to_csv(output_stops_path, index=False, encoding='utf-8-sig')
print(f"O ficheiro Paragens com localidades .csv foi guardado em: {output_stops_path}")
print("" * 50)
