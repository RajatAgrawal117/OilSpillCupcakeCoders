# Oil Spill Detection Using AIS and Satellite Datasets

## Overview
This project focuses on detecting oil spills in the marine environment by integrating Automatic Identification System (AIS) data with satellite datasets. The primary goal is to leverage both datasets to improve the detection and monitoring of oil spills using machine learning and geospatial analysis techniques.

---

## Contents
- [Overview](#overview)
- [Datasets](#datasets)
- [Requirements](#requirements)
- [Installation](#installation)
- [Data Preprocessing](#data-preprocessing)
- [Model Development](#model-development)
- [Results](#results)
- [Future Work](#future-work)
- [References](#references)

---

## Datasets

### Satellite Data
1. **Sentinel-1 (SAR)**: Synthetic Aperture Radar (SAR) data for high-resolution imagery, useful for oil spill detection.
   - Access: [Copernicus Open Access Hub](https://scihub.copernicus.eu/)
2. **Sentinel-2 (Optical)**: Multispectral optical data to visually detect oil slicks.
   - Access: [Copernicus Open Access Hub](https://scihub.copernicus.eu/)
3. **Landsat 8**: Optical imagery with moderate resolution.
   - Access: [NASA Earthdata](https://earthdata.nasa.gov/)
4. **MODIS (Aqua/Terra)**: Lower resolution but high-frequency data for large-scale monitoring.
   - Access: [NASA Earthdata](https://earthdata.nasa.gov/)

### AIS Data
- **Automatic Identification System (AIS)**: Historical and real-time vessel movement data for tracking ships and correlating oil spills.
   - Access: [MarineTraffic](https://www.marinetraffic.com/)

---

## Requirements

### Programming Languages & Libraries
- **Python** 3.8+
- **Libraries**:
  - `numpy`
  - `pandas`
  - `geopandas`
  - `rasterio`
  - `scikit-learn`
  - `tensorflow` (for deep learning models)
  - `opencv-python` (for image processing)
  - `matplotlib`, `seaborn` (for visualization)
  - `gdal` (for geospatial data processing)

### Tools
- **Google Earth Engine**: For large-scale satellite data analysis.
- **QGIS/ArcGIS**: For mapping and visualization of geospatial data.
- **ESA SNAP**: For processing Sentinel SAR data.

---

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/oil-spill-detection.git
    cd oil-spill-detection
    ```

2. Create and activate a virtual environment:
    ```bash
    python3 -m venv env
    source env/bin/activate
    ```

3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Set up the required satellite data by downloading from [Copernicus Open Access Hub](https://scihub.copernicus.eu/) and [NASA Earthdata](https://earthdata.nasa.gov/).

---

## Data Preprocessing

1. **Satellite Data Preprocessing**:
    - **SAR Data (Sentinel-1)**: Perform noise reduction (speckle filtering) and apply radiometric calibration.
    - **Optical Data (Sentinel-2, Landsat)**: Perform atmospheric correction and resampling.
    - Use **ESA SNAP** or **Google Earth Engine** for preprocessing satellite data.

2. **AIS Data Preprocessing**:
    - Filter and clean AIS data to remove incomplete records.
    - Match AIS vessel trajectories with satellite imagery timestamps.
    - Tools: `pandas`, `geopandas`

---

## Model Development

1. **Feature Engineering**:
    - Extract features from satellite images (e.g., texture, reflectance) to detect oil spills.
    - Extract vessel metadata (speed, heading, destination) from AIS data.

2. **Oil Spill Detection Model**:
    - **Machine Learning**: Use classification algorithms (Random Forest, SVM) to detect oil spills based on features from AIS and satellite data.
    - **Deep Learning**: Use Convolutional Neural Networks (CNN) to process SAR and optical imagery for oil slick detection.

3. **Data Fusion**:
    - Combine AIS data and satellite imagery into a unified geospatial framework.
    - Perform correlation analysis to link vessel movements with oil spill events.

---

## Results

- Visualize the detected oil spills on a map with vessel movements.
- Evaluate model performance using metrics such as accuracy, precision, recall, and F1-score.

---

## Future Work

- **Real-time Detection**: Implement a real-time system using AIS and satellite feeds.
- **Enhanced Models**: Incorporate more advanced deep learning techniques to improve detection accuracy.
- **Collaboration with Authorities**: Share findings with maritime authorities for real-world monitoring.

---

## References

1. "Automatic Detection of Marine Oil Spills in Satellite SAR Imagery", *Remote Sensing of Environment*.
2. "AIS Data for Marine Environmental Monitoring", *Marine Pollution Bulletin*.
3. "SAR-based Detection of Oil Spills", *IEEE Transactions on Geoscience and Remote Sensing*.

---

