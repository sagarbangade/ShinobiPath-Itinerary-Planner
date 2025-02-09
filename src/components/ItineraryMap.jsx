import React, { useState, useMemo, useCallback, useEffect } from "react"; // ADDED useEffect import
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Box, Typography, Alert } from "@mui/material"; // Import Alert for error messages

const mapContainerStyle = {
  height: "400px",
  width: "100%",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

const ItineraryMap = ({ itineraryId, userItineraries }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [destinationDistances, setDestinationDistances] = useState({});
  const [distanceError, setDistanceError] = useState(null); // State for distance calculation errors
  const [mapLoadError, setMapLoadError] = useState(null); // State for map loading errors
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false); // Loading state for distance calculation

  const currentItinerary = useMemo(() => {
    return userItineraries.find((it) => it.id === itineraryId);
  }, [itineraryId, userItineraries]);

  const itineraryDestinations = useMemo(() => {
    if (!currentItinerary || !currentItinerary.destinations) {
      return [];
    }
    return currentItinerary.destinations;
  }, [currentItinerary]);

  const mapCenter = useMemo(() => {
    if (itineraryDestinations.length > 0) {
      let latSum = 0;
      let lngSum = 0;
      itineraryDestinations.forEach((dest) => {
        if (dest.location && dest.location.lat && dest.location.lng) {
          latSum += dest.location.lat;
          lngSum += dest.location.lng;
        }
      });
      return {
        lat: latSum / itineraryDestinations.length,
        lng: lngSum / itineraryDestinations.length,
      };
    } else {
      return { lat: 0, lng: 0 };
    }
  }, [itineraryDestinations]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCFfwfN3JhDm1sXkfBoUMfB-Tz-xYLjaXo", // Make sure to replace with your actual API Key in real app
    libraries: ["places", "geometry"],
  });

  // Set map load error if useJsApiLoader detects an error
  useEffect(() => {
    if (loadError) {
      setMapLoadError(loadError);
    } else {
      setMapLoadError(null); // Clear any previous error if loading succeeds
    }
  }, [loadError]);


  const calculateDistance = useCallback(async (origin, destination) => {
    if (!isLoaded) return null;

    const service = new window.google.maps.DistanceMatrixService();
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [{ lat: origin.lat, lng: origin.lng }],
          destinations: [{ lat: destination.lat, lng: destination.lng }],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === "OK") {
            const distance = response.rows[0].elements[0].distance;
            resolve(distance);
          } else {
            reject(status);
          }
        }
      );
    });
  }, [isLoaded]);

  useMemo(async () => {
    if (isLoaded && itineraryDestinations.length > 1) {
      const distances = {};
      let totalDistanceMeters = 0;
      setDistanceError(null); // Clear any previous distance error
      setIsCalculatingDistance(true); // Start loading state for distance calculation

      for (let i = 0; i < itineraryDestinations.length - 1; i++) {
        const origin = itineraryDestinations[i].location;
        const destination = itineraryDestinations[i + 1].location;
        try {
          const distanceData = await calculateDistance(origin, destination);
          if (distanceData) {
            distances[`${itineraryDestinations[i].id}-${itineraryDestinations[i + 1].id}`] = distanceData;
            totalDistanceMeters += distanceData.value;
          }
        } catch (error) {
          console.error("Error calculating distance:", error);
          setDistanceError("Error calculating distances. Please try again later.");
          setIsCalculatingDistance(false); // End loading state on error
          break; // Stop calculating further distances if one fails
        }
      }
      if (!distanceError) {
        distances['total'] = { value: totalDistanceMeters, text: formatDistance(totalDistanceMeters) };
        setDestinationDistances(distances);
        setIsCalculatingDistance(false); // End loading state after successful calculation
      }
    } else {
      setDestinationDistances({});
      setDistanceError(null);
      setIsCalculatingDistance(false); // Ensure loading state is off when not calculating
    }
  }, [itineraryDestinations, calculateDistance, isLoaded]);


  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1) + " km";
    } else if (meters > 0) {
      return meters.toFixed(0) + " m";
    } else {
      return "N/A";
    }
  };

  if (mapLoadError) {
    return (
      <Alert severity="error">
        Map could not be loaded. Please check your Google Maps API key and network connection.
      </Alert>
    );
  }

  if (!isLoaded) {
    return <Typography>Map is loading...</Typography>;
  }

  if (!currentItinerary) {
    return <Typography>Itinerary not found.</Typography>;
  }

  return (
    <>
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={itineraryDestinations.length > 0 ? 5 : 2}
      options={mapOptions}
    >
      {itineraryDestinations.map((location, index) => (
        <Marker
          key={index}
          position={{ lat: location.location.lat, lng: location.location.lng }}
          title={location.name}
          onClick={() => setSelectedPlace(location)}
        >
          {selectedPlace === location && (
            <InfoWindow
              position={{
                lat: location.location.lat,
                lng: location.location.lng,
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {location.name}
                </Typography>
                {location.formattedAddress && (
                  <Typography variant="body2">
                    {location.formattedAddress}
                  </Typography>
                )}
                {index < itineraryDestinations.length - 1 && destinationDistances[`${location.id}-${itineraryDestinations[index + 1].id}`] && (
                  <Typography variant="body2">
                    Distance to next destination: {formatDistance(destinationDistances[`${location.id}-${itineraryDestinations[index + 1].id}`]?.value)}
                  </Typography>
                )}
                {isCalculatingDistance && index === 0 && ( // Show loading near first marker while calculating
                  <Typography variant="body2" color="textSecondary">
                    Calculating distances...
                  </Typography>
                )}
              </Box>
            </InfoWindow>
          )}
        </Marker>
      ))}
      {distanceError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {distanceError}
        </Alert>
      )}

    </GoogleMap>
    {destinationDistances.total && (
      <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', textAlign: 'center' }}>
        Total Itinerary Distance: {destinationDistances.total?.text || 'N/A'}
      </Typography>
    )}
    </>
  );
};

export default ItineraryMap;