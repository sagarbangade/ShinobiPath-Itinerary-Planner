import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
// import { geocodeByAddress, getLatLng } from "react-google-maps-api"; // This is the line

const containerStyle = {
  width: "100%",
  height: "400px",
};

const ItineraryMap = ({ destinations }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [markerPositions, setMarkerPositions] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDHTUzAPE4mdiY6bKHtghFPEzmOJQUXI6I", // Use the environment variable
  });

  const onLoad = useCallback(
    (map) => {
      setMap(map);
      const bounds = new window.google.maps.LatLngBounds();
      if (markerPositions.length > 0) {
        markerPositions.forEach((marker) => bounds.extend(marker));
        map.fitBounds(bounds);
      }
    },
    [markerPositions]
  );

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    const fetchCoordinates = async () => {
      const positions = [];
      for (const destination of destinations) {
        try {
          const results = await geocodeByAddress(destination.name);
          const latLng = await getLatLng(results[0]);
          positions.push(latLng);
        } catch (error) {
          console.error("Geocoding error:", error);
          positions.push(null);
        }
      }
      setMarkerPositions(positions);
    };

    if (destinations && destinations.length > 0) {
      fetchCoordinates();
    }
  }, [destinations]);

  useEffect(() => {
    if (markerPositions.length > 1 && markerPositions.every((pos) => pos !== null)) {
      const directionsService = new window.google.maps.DirectionsService();
      const waypoints = markerPositions
        .slice(1, -1)
        .map((pos) => ({ location: pos, stopover: true }));

      directionsService.route(
        {
          origin: markerPositions[0],
          destination: markerPositions[markerPositions.length - 1],
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Error fetching directions: ${status}`);
            setDirections(null);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [markerPositions]);

  const handleMarkerClick = (index) => {
    setActiveMarker(index);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPositions[0] || { lat: 0, lng: 0 }}
      zoom={4}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markerPositions.map((position, index) =>
        position ? (
          <Marker key={index} position={position} onClick={() => handleMarkerClick(index)}>
            {activeMarker === index && (
              <InfoWindow onCloseClick={handleInfoWindowClose}>
                <div>
                  <p>
                    <b>{destinations[index].name}</b>
                  </p>
                  <p>
                    {destinations[index].startDate} - {destinations[index].endDate}
                  </p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ) : null
      )}

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: "#2196F3",
              strokeWeight: 5,
            },
            suppressMarkers: true,
          }}
        />
      )}
    </GoogleMap>
  ) : (
    <div>Loading map...</div>
  );
};

export default ItineraryMap;