import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import ShipData from './ShipData.json';

const mumbaiPosition = [19.076, 72.8777];
const shipIconUrl = 'https://cdn-icons-png.flaticon.com/128/6984/6984902.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const shipIcon = new L.Icon({
  iconUrl: shipIconUrl,
  iconSize: [48, 48],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapComponent = () => {
  const [cursorPosition, setCursorPosition] = useState({ lat: mumbaiPosition[0], lng: mumbaiPosition[1] });
  const [selectedShip, setSelectedShip] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [date, setDate] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const mapRef = useRef(null);

  const MapEvents = () => {
    useMapEvents({
      mousemove(e) {
        const { lat, lng } = e.latlng;
        setCursorPosition({ lat, lng });
      },
    });
    return null;
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowOptions(false);
  };

  const handleSortByClick = () => {
    setShowOptions(!showOptions);
  };

  const updateMapCenter = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 10);
    }
  };

  const handleImoNumberChange = () => {
    const ship = ShipData.find((ship) => ship.IMO === imoNumber);
    if (ship) {
      const index = ShipData.indexOf(ship);
      updateMapCenter(ship.LAT, ship.LON);
      setSelectedShip(index);
    }
  };

  const getShipImages = (shipIndex) => {
    try {
      const img1 = require(`./sar-images/Hardcode images/${shipIndex + 1}/img1.jpg`);
      const img2 = require(`./sar-images/Hardcode images/${shipIndex + 1}/img2.jpg`);
      return { img1, img2 };
    } catch (err) {
      console.error(`Error loading images for ship ${shipIndex + 1}:`, err);
      return null;
    }
  };

  return (
    <div className="relative flex-grow h-full w-full bg-[#021526]">
      
      <MapContainer
        center={mumbaiPosition}
        zoom={10}
        ref={mapRef}
        className="h-full w-full shadow-md"
        style={{ height: 'calc(100vh - 140px)' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
        <Marker position={mumbaiPosition}>
          <Popup>
            Mumbai Coastline <br />
            Latitude: {mumbaiPosition[0]} <br />
            Longitude: {mumbaiPosition[1]}
          </Popup>
        </Marker>
        {ShipData.map((ship, index) => (
          <Marker 
            key={index} 
            position={[ship.LAT, ship.LON]} 
            icon={shipIcon}
            eventHandlers={{
              click: () => setSelectedShip(index),
            }}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <span style={{ fontFamily: 'Helvetica, sans-serif', color: '#55679C'}}>
                {ship.VesselName} <br /> Latitude: {ship.LAT} <br /> Longitude: {ship.LON}
              </span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      
      {selectedShip !== null && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed left-14 top-24 h-auto max-h-[calc(100vh-180px)] w-1/3 bg-[#021526] bg-opacity-90 shadow-lg z-[1000] p-6 rounded-xl overflow-y-auto"
          style={{ fontFamily: 'Helvetica, sans-serif' }}
        >
          <button
            className="absolute top-3 right-3 text-[#FFF4EA] hover:text-[#6EACDA] focus:outline-none focus:ring-2 focus:ring-[#6EACDA] rounded-full transition-colors duration-200"
            onClick={() => setSelectedShip(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="text-center mb-6">
            <h3 className="font-extrabold text-3xl text-[#FFFBE6] mb-4">
              {ShipData[selectedShip].VesselName}
            </h3>
            <div className="flex justify-center gap-4 mt-4">
              {getShipImages(selectedShip) ? (
                <>
                  <img
                    src={getShipImages(selectedShip).img1}
                    alt={`Ship ${selectedShip + 1} - Image 1`}
                    className="mx-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                    style={{ width: '45%' }}
                  />
                  <img
                    src={getShipImages(selectedShip).img2}
                    alt={`Ship ${selectedShip + 1} - Image 2`}
                    className="mx-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                    style={{ width: '45%' }}
                  />
                </>
              ) : (
                <p className="text-[#FFF4EA]">Images not available</p>
              )}
            </div>
          </div>

          <div className="pt-4 text-left text-[#FFFFFF]">
            <table className="w-full mt-4 text-base border-collapse rounded-lg overflow-hidden">
              <tbody>
                {[
                  { label: "Vessel No", value: ShipData[selectedShip].IMO },
                  { label: "IMO No", value: ShipData[selectedShip].IMO },
                  { label: "SOG", value: `${ShipData[selectedShip].SOG} km/hr` },
                  { label: "COG", value: `${ShipData[selectedShip].COG}°` },
                  { label: "Latitude", value: ShipData[selectedShip].LAT.toFixed(4) },
                  { label: "Longitude", value: ShipData[selectedShip].LON.toFixed(4) },
                  { label: "Date", value: ShipData[selectedShip].BaseDateTime },
                ].map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-[#55679C]" : "bg-[#7C93C3]"}>
                    <td className="font-semibold py-3 px-4">{item.label}:</td>
                    <td className="py-3 px-4">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <footer className="absolute bottom-0 left-0 right-0 bg-[#021526] text-[#D1E9F6] text-lg p-6 z-50" style={{ fontFamily: 'Helvetica, sans-serif', height: '80px' }}>
        <p className="text-center">Latitude: {cursorPosition.lat.toFixed(4)} | Longitude: {cursorPosition.lng.toFixed(4)}</p>
      </footer>

      <motion.button
        className="absolute bottom-24 right-4 z-[1000] bg-[#26355D] hover:bg-[#D1E9F6] hover:text-[#26355D] text-[#D1E9F6] font-bold py-3 px-6 rounded-full shadow-lg transition-colors duration-300"
        onClick={handleSortByClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ fontFamily: 'Helvetica, sans-serif' }}
      >
        Find Ship <i className="ri-menu-line ml-2"></i>
      </motion.button>

      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-40 right-4 bg-[#FFF4EA] p-4 shadow-lg z-[1000] w-48 rounded-lg"
          style={{ fontFamily: 'Helvetica, sans-serif' }}
        >
          <ul>
            {['Date', 'IMO number', 'Position'].map((option) => (
              <li key={option} className="mb-2">
                <button
                  className="w-full text-left hover:bg-[#6EACDA] hover:text-[#021526] py-2 px-3 rounded transition-colors duration-200"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-40 right-4 bg-[#FFF4EA] p-6 shadow-lg z-[1000] w-72 rounded-xl"
          style={{ fontFamily: 'Helvetica, sans-serif' }}
        >
          {selectedOption === "Position" && (
            <>
              <input
                type="text"
                placeholder="Latitude (From -90° to 90°)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full mb-3 p-2 border border-[#26355D] rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#6EACDA] transition-colors duration-200"
              />
              <input
                type="text"
                placeholder="Longitude (From -180° to 180°)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full mb-3 p-2 border border-[#26355D] rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#6EACDA] transition-colors duration-200"
              />
              <motion.button
                onClick={() => {
                  const lat = parseFloat(latitude);
                  const lng = parseFloat(longitude);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    updateMapCenter(lat, lng);
                  }
                }}
                className="w-full bg-[#03346E] hover:bg-[#26355D] text-[#6EACDA] font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Update Position
              </motion.button>
            </>
          )}

          {selectedOption === "IMO number" && (
            <>
              <input
                type="text"
                placeholder="IMO Number"
                value={imoNumber}
                onChange={(e) => setImoNumber(e.target.value)}
                className="w-full mb-3 p-2 border border-[#26355D] rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#6EACDA] transition-colors duration-200"
              />
              <motion.button
                onClick={handleImoNumberChange}
                className="w-full bg-[#03346E] hover:bg-[#26355D] text-[#6EACDA] font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Find Ship
              </motion.button>
            </>
          )}

          {selectedOption === "Date" && (
            <>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mb-3 p-2 border border-[#26355D] rounded-lg focus:ring-2 focus:ring-[#6EACDA] focus:border-[#6EACDA] transition-colors duration-200"
              />
              <motion.button
                onClick={() => {
                  console.log("Filtering by date:", date);
                }}
                className="w-full bg-[#03346E] hover:bg-[#26355D] text-[#6EACDA] font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Filter by Date
              </motion.button>
            </>
          )}

          <motion.button
            onClick={() => setSelectedOption(null)}
className="mt-3 w-full bg-[#26355D] hover:bg-[#03346E] text-[#6EACDA] font-bold py-2 px-4 rounded-lg transition-colors duration-300"
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
>
Close
</motion.button>
</motion.div>
)}
</div>
);
};
export default MapComponent;