from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from .serializers import AISDataSerializer, SARDataSerializer
import numpy as np
# Load the ML model (AIS anomaly detection)
anomaly_detection_model = joblib.load('isolation_forest_model_new.pkl')
csv_file_path = 'anomalies.csv'
print(type(anomaly_detection_model))



# AIS data submission (from CSV, model prediction, and response)
@api_view(['POST'])
def submit_ais_data(request):
    time = request.data.get('time')  # Expected format: 'YYYY-MM-DDTHH:MM:SS'
    mmsi_list = request.data.get('mmsi_list', [])
    
    if not time or not mmsi_list:
        return Response({"error": "Time and MMSI list are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        time = pd.to_datetime(time)
    except ValueError:
        return Response({"error": "Invalid time format."}, status=status.HTTP_400_BAD_REQUEST)
    
    unique_ships_data, ship_features = get_ship_data_by_time_and_mmsi(csv_file_path, time, mmsi_list)
    
    # Make predictions using the ML model
    predictions = anomaly_detection_model.predict(ship_features)
    
    # Prepare response data
    unique_ships_data['anomaly'] = predictions
    response_data = unique_ships_data[['MMSI', 'LAT', 'LON', 'SOG', 'COG', 'anomaly']].to_dict(orient='records')
    
    return Response(response_data)

# SAR data submission
@api_view(['POST'])
def submit_sar_data(request):
    serializer = SARDataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# New API: Periodic AIS data retrieval for the frontend
def get_ship_data_by_time_and_mmsi(csv_file_path, time, mmsi_list):
    # Load data
    df = pd.read_csv(csv_file_path)
    
    # Convert BaseDateTime to datetime object
    df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime'])
    
    # Sort by BaseDateTime for rolling calculations
    df = df.sort_values('BaseDateTime')

    # Calculate additional features needed by the model
    df['SOG_Change'] = df.groupby('MMSI')['SOG'].diff().fillna(0)
    df['COG_Change'] = df.groupby('MMSI')['COG'].diff().fillna(0)
    df['Heading_Change'] = df.groupby('MMSI')['Heading'].diff().fillna(0)
    df['SOG_Roll_Mean'] = df.groupby('MMSI')['SOG'].transform(lambda x: x.rolling(window=3, min_periods=1).mean())
    df['SOG_Roll_Std'] = df.groupby('MMSI')['SOG'].transform(lambda x: x.rolling(window=3, min_periods=1).std()).fillna(0)
    
    # Filter by MMSI and time
    df_filtered = df[(df['MMSI'].isin(mmsi_list)) & (df['BaseDateTime'] == time)]
    
    # Extract time-based features
    df_filtered['hour'] = df_filtered['BaseDateTime'].dt.hour
    df_filtered['day_of_week'] = df_filtered['BaseDateTime'].dt.dayofweek
    
    # Encode Status
    label_encoder_status = LabelEncoder()
    df_filtered['status_encoded'] = label_encoder_status.fit_transform(df_filtered['Status'])
    
    # Define required features for the model
    required_features = ['SOG', 'SOG_Change', 'COG', 'COG_Change', 'Heading', 'Heading_Change', 
                         'status_encoded', 'SOG_Roll_Mean', 'SOG_Roll_Std', 'hour', 'day_of_week']
    ship_features = df_filtered[required_features].values
    
    return df_filtered, ship_features

# New API: Periodic AIS data retrieval for the frontend
@api_view(['POST'])
def get_latest_ais_data(request):
    try:
        # Extract the `time` and `mmsi_list` from the POST request data
        requested_time = request.data.get('time')
        mmsi_list = request.data.get('mmsi_list')

        # Ensure mmsi_list is a list
        if not isinstance(mmsi_list, list):
            return Response({"error": "mmsi_list should be a list of MMSI numbers"}, status=status.HTTP_400_BAD_REQUEST)

        # Convert BaseDateTime to datetime in the data
        time = pd.to_datetime(requested_time)

        # Get the ship data and the features required by the model
        filtered_data, ship_features = get_ship_data_by_time_and_mmsi(csv_file_path, time, mmsi_list)

        # Make predictions using the anomaly detection model
        predictions = anomaly_detection_model.predict(ship_features)

        # Add predictions to the response data
        filtered_data['anomaly'] = predictions
        response_data = filtered_data[['MMSI', 'LAT', 'LON', 'SOG', 'COG', 'anomaly']].to_dict(orient='records')

        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
def get_vessel_history(request):
    mmsi = request.data.get('mmsi')
    
    if not mmsi:
        return Response({"error": "MMSI is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Load data from CSV
        df = pd.read_csv(csv_file_path)
        
        # Filter by MMSI
        df_filtered = df[df['MMSI'] == int(mmsi)]
        
        if df_filtered.empty:
            return Response({"error": "No data found for the given MMSI."}, status=status.HTTP_404_NOT_FOUND)
        
        # Convert BaseDateTime to datetime
        df_filtered['BaseDateTime'] = pd.to_datetime(df_filtered['BaseDateTime'])
        
        # Extract time-based features
        df_filtered.loc[:, 'hour'] = df_filtered['BaseDateTime'].dt.hour
        df_filtered.loc[:, 'day_of_week'] = df_filtered['BaseDateTime'].dt.dayofweek
        df_filtered.loc[:, 'month'] = df_filtered['BaseDateTime'].dt.month

        # Calculate rolling features (mean and std for SOG)
        df_filtered['SOG_Roll_Mean'] = df_filtered['SOG'].rolling(window=3).mean().fillna(df_filtered['SOG'].mean())
        df_filtered['SOG_Roll_Std'] = df_filtered['SOG'].rolling(window=3).std().fillna(0)

        # Calculate SOG, COG, and Heading changes
        df_filtered['SOG_Change'] = df_filtered['SOG'].diff().fillna(0)
        df_filtered['COG_Change'] = df_filtered['COG'].diff().fillna(0)
        df_filtered['Heading_Change'] = df_filtered['Heading'].diff().fillna(0)
        
        # Encode Status
        label_encoder_status = LabelEncoder()
        df_filtered['status_encoded'] = label_encoder_status.fit_transform(df_filtered['Status'])
        
        # Define features for model prediction (11 features)
        required_features = [
            'SOG', 'SOG_Change', 'COG', 'COG_Change', 'Heading', 'Heading_Change', 'status_encoded', 
            'SOG_Roll_Mean', 'SOG_Roll_Std', 'hour', 'day_of_week'
        ]
        ship_features = df_filtered[required_features].values
        
        # Make predictions
        predictions = anomaly_detection_model.predict(ship_features)
        df_filtered['anomaly'] = predictions
        
        # Ensure all values are valid JSON-compatible floats
        df_filtered = df_filtered.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        # Prepare response data
        response_data = df_filtered[['MMSI', 'LAT', 'LON', 'CallSign', 'IMO', 'SOG', 'anomaly']].to_dict(orient='records')
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
@api_view(['POST'])
def get_vessel_details(request):
    # Extract MMSI, LAT, LON, and time from the request data
    mmsi = request.data.get('mmsi')
    lat = request.data.get('lat')
    lon = request.data.get('lon')
    time = request.data.get('time')
    
    if not mmsi or not lat or not lon or not time:
        return Response({"error": "MMSI, latitude, longitude, and time are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Load data from CSV
        df = pd.read_csv(csv_file_path)
        
        # Convert BaseDateTime to datetime object
        df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime'])
        
        # Filter by MMSI, LAT, LON, and time
        df_filtered = df[(df['MMSI'] == int(mmsi)) & 
                         (df['LAT'] == float(lat)) & 
                         (df['LON'] == float(lon)) &
                         (df['BaseDateTime'] == pd.to_datetime(time))]
        
        if df_filtered.empty:
            return Response({"error": "No data found for the given MMSI, latitude, longitude, and time."}, status=status.HTTP_404_NOT_FOUND)
        
        # Extract vessel details (only the first match)
        vessel_details = df_filtered.iloc[0]
        
        response_data = {
            "MMSI": vessel_details.get('MMSI'),
            "Call Sign": vessel_details.get('CallSign', 'N/A'),
            "IMO": vessel_details.get('IMO', 'N/A'),
            "Speed (SOG)": vessel_details.get('SOG', 'N/A'),
            "Course (COG)": vessel_details.get('COG', 'N/A'),
            "Latitude": vessel_details.get('LAT'),
            "Longitude": vessel_details.get('LON'),
            "Time": vessel_details.get('BaseDateTime').strftime('%Y-%m-%dT%H:%M:%S')
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
def get_ship_trajectory(mmsi):
    # Load data
    df = pd.read_csv(csv_file_path)
    
    # Convert BaseDateTime to datetime object
    df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime'])
    
    # Filter by MMSI
    df_filtered = df[df['MMSI'] == mmsi]
    print(df_filtered)
    if df_filtered.empty:
        raise ValidationError("No data available for the specified ship.")
    
    # Get the first and last recorded time
    first_time = df_filtered['BaseDateTime'].min()
    last_time = df_filtered['BaseDateTime'].max()
    
    # Filter data based on the first recorded time
    df_filtered = df_filtered[df_filtered['BaseDateTime'] >= first_time]
    
    # Extract time-based features
    df_filtered['hour'] = df_filtered['BaseDateTime'].dt.hour
    df_filtered['day_of_week'] = df_filtered['BaseDateTime'].dt.dayofweek
    df_filtered['month'] = df_filtered['BaseDateTime'].dt.month
    
    # Encode Status
    label_encoder_status = LabelEncoder()
    df_filtered['status_encoded'] = label_encoder_status.fit_transform(df_filtered['Status'])
    
    # Define required features for the model
    required_features = [
        'SOG', 'SOG_Change', 'COG', 'COG_Change', 
        'Heading', 'Heading_Change', 'Status', 
        'SOG_Roll_Mean', 'SOG_Roll_Std', 'hour', 'day_of_week'
    ]
    
    # Ensure all required features are present in the DataFrame
    for feature in required_features:
        if feature not in df_filtered.columns:
            df_filtered[feature] = 0
    
    # Extract features for the model
    ship_features = df_filtered[required_features].values
    
    # Make predictions using the ML model
    predictions = anomaly_detection_model.predict(ship_features)
    df_filtered['anomaly'] = predictions
    
    return df_filtered, first_time, last_time

@api_view(['POST'])
def get_ship_trajectory_and_anomaly(request):
    mmsi = request.data.get('mmsi')
    

    if not mmsi:
        return Response({"error": "MMSI is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        mmsi = int(mmsi)
    except ValueError:
        return Response({"error": "Invalid MMSI format."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        ship_trajectory, first_time, last_time = get_ship_trajectory(mmsi)
        trajectory_data = ship_trajectory[['BaseDateTime', 'LAT', 'LON', 'SOG', 'COG', 'anomaly']].to_dict(orient='records')
        
        # Find if there was any anomaly
        anomalies_present = any(ship_trajectory['anomaly'] == 1)
        
        return Response({
            "first_time": first_time.isoformat(),
            "last_time": last_time.isoformat(),
            "trajectory": trajectory_data,
            "anomalies_present": anomalies_present
        }, status=status.HTTP_200_OK)
    
    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
