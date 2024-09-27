from django.urls import path
from .views import (

    submit_ais_data,
    submit_sar_data,
    get_latest_ais_data,
    get_vessel_history,
    get_vessel_details,
    get_ship_trajectory_and_anomaly

)

urlpatterns = [
    # Authentication Endpoints
    # path('login/', CustomAuthToken.as_view(), name='login'),
    # path('logout/', logout, name='logout'),
    # path('signup/', signup, name='signup'),
    
    # AIS and SAR Data Submission Endpoints
    path('submit-ais-data/', submit_ais_data, name='submit_ais_data'),
    path('submit-sar-data/', submit_sar_data, name='submit_sar_data'),
    path('get-vessel-history/',get_vessel_history, name='get_vessel_history'),
    
    # API for Periodic AIS Data Retrieval
    path('get-latest-ais-data/', get_latest_ais_data, name='get_latest_ais_data'),
    path('get-vessel-details/',get_vessel_details, name="get_vessel_details"),
    path('get-ship-trajectory/',get_ship_trajectory_and_anomaly, name="get_ship_trajectory_and_anomaly")
    
]
