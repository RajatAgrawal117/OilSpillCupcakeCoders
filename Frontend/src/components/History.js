import React, { useState, useEffect } from "react";
import "./shipData.css";

const ShipDataAccordion = () => {
  const [ships, setShips] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    import('./ShipData.json').then(data => {
      setShips(data.default);
    });
  }, []);

  const getAnomalyText = (anomaly) => {
    return anomaly === -1 ? "No Anomaly Detected" : "Anomaly Detected";
  };

  const getAnomalyClass = (anomaly) => {
    return anomaly === -1 ? "no-anomaly" : "anomaly-detected";
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="ShipDataContainer">
      <h2 className="title">Ship History Data</h2>
      <div className="accordion" id="shipAccordion">
        {ships.map((ship, index) => {
          const itemId = `collapse${index}`;
          const buttonId = `heading${index}`;
          const isActive = activeIndex === index;

          return (
            <div className="accordion-item" key={index}>
              <h2 className="accordion-header" id={buttonId}>
                <button
                  className={`accordion-button ${isActive ? 'active' : ''}`}
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isActive}
                  aria-controls={itemId}
                >
                  <span className="ship-imo">{ship.IMO}</span>
                  <span className={`anomaly-status ${getAnomalyClass(ship.anomaly)}`}>
                    {getAnomalyText(ship.anomaly)}
                  </span>
                </button>
              </h2>
              <div
                id={itemId}
                className={`accordion-collapse ${isActive ? 'show' : ''}`}
              >
                <div className="accordion-body">
                  <div className="ship-description">
                    <p><strong>Vessel Name:</strong> {ship.VesselName}</p>
                    <p><strong>IMO:</strong> {ship.IMO}</p>
                    <p><strong>Coordinates:</strong> {ship.LAT}, {ship.LON}</p>
                    <p><strong>Speed:</strong> {ship.SOG} knots</p>
                    <p><strong>Anomaly Status:</strong> {getAnomalyText(ship.anomaly)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipDataAccordion;
