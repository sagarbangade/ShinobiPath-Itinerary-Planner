import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ListItemText,
  ListItem,
  TextField,
} from "@mui/material";
import moment from "moment";
import {
  Flight,
  Hotel,
  CalendarToday,
  PinDrop as PinDropIcon,
  AttachMoney,
  Alarm,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
// Chart Libraries
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// Google Maps Imports  <-- ADD THESE
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow, // Optional, for info windows on markers
} from "@react-google-maps/api";

const CATEGORIES = ["leisure", "adventure", "cultural", "other"];
const LOCATION_TYPES = ["city", "state", "country"];

const COLORS = [
  "#2E86C1",
  "#1E8449",
  "#D4AC0D",
  "#CB4335",
  "#6C3483",
  "#3498DB",
];
const CHART_BACKGROUND_COLOR = "#F9F9F9";
const CARD_BACKGROUND_COLOR = "#FFFFFF";
const DASHBOARD_BACKGROUND_COLOR = "#F4F6F7";

// Google Maps options  <-- ADD THIS
const mapContainerStyle = {
  height: "400px", // Adjust map height as needed
  width: "100%",
};
const mapOptions = {
  styles: [
    // Optional: Customize map styles (e.g., remove POIs)
    {
      featureType: "poi",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
  disableDefaultUI: true, // Optional: Disable default UI controls
  zoomControl: true, // Optional: Enable zoom controls
  gestureHandling: "cooperative", // Optional: Gesture handling
};

// Define libraries outside of the component to prevent re-renders
const libraries = ["places"];

const Dashboard = () => {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState({
    type: "city",
    value: "",
  });
  const [userItineraries, setUserItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 }); // Default map center
  const [selectedPlace, setSelectedPlace] = useState(null); // For info window
  const isMapLoaded = useRef(false); // useRef to track map loading

  const getFilteredLocations = useCallback(
    (filterCategory, locationFilter) => {
      let locations = []; // Change to array of location objects

      let totalLat = 0; // For calculating map center
      let totalLng = 0;
      let locationCount = 0;

      userItineraries.forEach((itinerary) => {
        if (!filterCategory || itinerary.category === filterCategory) {
          itinerary.destinations.forEach((destination) => {
            if (
              destination.location &&
              destination.location.lat &&
              destination.location.lng &&
              destination.location.formattedAddress
            ) {
              const address = destination.location.formattedAddress;
              let locationPart = "";
              if (locationFilter.type === "city") {
                const parts = address.split(",");
                if (parts.length > 2) {
                  locationPart = parts[parts.length - 3].trim();
                }
              } else if (locationFilter.type === "state") {
                const parts = address.split(",");
                if (parts.length > 1) {
                  locationPart = parts[parts.length - 2].trim();
                }
              } else if (locationFilter.type === "country") {
                locationPart = parts.split(",").pop().trim();
              }

              if (
                !locationFilter.value ||
                locationPart
                  .toLowerCase()
                  .includes(locationFilter.value.toLowerCase())
              ) {
                locations.push(destination.location); // Push the entire location object
                totalLat += destination.location.lat;
                totalLng += destination.location.lng;
                locationCount++;
              }
            }
          });
        }
      });

      return locations; // Return array of location objects
    },
    [userItineraries]
  );

  const filteredLocations = useMemo(() => getFilteredLocations(categoryFilter, locationFilter), [getFilteredLocations, categoryFilter, locationFilter]);

  const getItinerariesCollection = useCallback(() => {
    if (!auth.currentUser) return null;
    return collection(db, "users", auth.currentUser.uid, "itineraries");
  }, []);

  const fetchOwnedItineraries = useCallback(async () => {
    if (!auth.currentUser) return [];
    const itinerariesCollection = getItinerariesCollection();
    if (!itinerariesCollection) return [];

    try {
      const snapshot = await getDocs(itinerariesCollection);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isShared: false,
        ownerId: auth.currentUser.uid,
      }));
    } catch (error) {
      console.error("Error fetching owned itineraries:", error);
      return [];
    }
  }, [getItinerariesCollection]);

  const fetchSharedItineraries = useCallback(async () => {
    if (!auth.currentUser) return [];
    const sharedItinerariesRef = collection(db, "sharedItineraries");
    const q = query(
      sharedItinerariesRef,
      where("collaborators", "array-contains", auth.currentUser.uid)
    );

    try {
      const querySnapshot = await getDocs(q);
      const sharedItinerariesData = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const itineraryRef = doc(
          db,
          "users",
          data.ownerId,
          "itineraries",
          data.itineraryId
        );
        try {
          const itinerarySnapshot = await getDoc(itineraryRef);
          if (itinerarySnapshot.exists()) {
            sharedItinerariesData.push({
              id: itinerarySnapshot.id,
              ...itinerarySnapshot.data(),
              isShared: true,
              ownerId: data.ownerId,
            });
          } else {
            console.warn(
              `Itinerary ${data.itineraryId} not found for owner ${data.ownerId}`
            );
          }
        } catch (fetchError) {
          console.error("Error fetching shared itinerary details:", fetchError);
        }
      }
      return sharedItinerariesData;
    } catch (error) {
      console.error("Error fetching shared itineraries metadata:", error);
      return [];
    }
  }, [auth.currentUser]);

  const fetchAllItineraries = useCallback(async () => {
    if (!auth.currentUser) {
      setUserItineraries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const ownedItineraries = await fetchOwnedItineraries();
      const sharedItineraries = await fetchSharedItineraries();
      const allItineraries = [...ownedItineraries, ...sharedItineraries];
      const uniqueItineraries = Array.from(
        new Map(allItineraries.map((item) => [item.id, item])).values()
      );
      setUserItineraries(uniqueItineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      alert("Error fetching itineraries. See console for details.");
    } finally {
      setLoading(false);
    }
  }, [fetchOwnedItineraries, fetchSharedItineraries]);

  useEffect(() => {
    fetchAllItineraries();
  }, [fetchAllItineraries]);

  // --- Data Processing / Statistics Functions ---
  const countUpcomingTrips = useCallback(
    () => {
      return userItineraries.filter(
        (itinerary) =>
          moment(itinerary.endDate).isAfter(moment()) &&
          (!categoryFilter || itinerary.category === categoryFilter)
      ).length;
    },
    [userItineraries, categoryFilter]
  );

  const countCompletedTrips = useCallback(
    () => {
      return userItineraries.filter(
        (itinerary) =>
          moment(itinerary.endDate).isBefore(moment()) &&
          (!categoryFilter || itinerary.category === categoryFilter)
      ).length;
    },
    [userItineraries, categoryFilter]
  );

  const calculateTotalExpenses = useCallback(
    () => {
      let totalExpenses = 0;
      userItineraries.forEach((itinerary) => {
        if (!categoryFilter || itinerary.category === categoryFilter) {
          itinerary.destinations.forEach((destination) => {
            (destination.expenses || []).forEach((expense) => {
              totalExpenses += parseFloat(expense.amount) || 0;
            });
            (destination.activities || []).forEach((activity) => {
              totalExpenses += parseFloat(activity.cost) || 0;
            });
          });
        }
      });
      return totalExpenses;
    },
    [userItineraries, categoryFilter]
  );

  const getUpcomingReminders = useCallback(() => {
    const reminders = [];
    userItineraries.forEach((itinerary) => {
      itinerary.destinations.forEach((destination) => {
        (destination.reminders || []).forEach((reminder) => {
          if (moment(reminder.date).isSameOrAfter(moment(), "day")) {
            reminders.push({
              ...reminder,
              destinationName: destination.name,
              itineraryTitle: itinerary.title,
            });
          }
        });
      });
    });
    return reminders
      .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
      .slice(0, 5);
  }, [userItineraries]);

  useEffect(() => {
    if (filteredLocations.length > 0) {
      let totalLat = 0;
      let totalLng = 0;
      filteredLocations.forEach((loc) => {
        totalLat += loc.lat;
        totalLng += loc.lng;
      });
      setMapCenter({
        lat: totalLat / filteredLocations.length,
        lng: totalLng / filteredLocations.length,
      });
    } else {
      setMapCenter({ lat: 0, lng: 0 });
    }
  }, [filteredLocations]);

  const handleLocationFilterChange = (event) => {
    setLocationFilter({
      ...locationFilter,
      [event.target.name]: event.target.value,
    });
  };
  const handleMarkerClick = useCallback((place) => {
    setSelectedPlace(place); // Open info window for marker
  }, []);

  const handleCreateNewPlanClick = () => {
    navigate("/itineraries");
  };

  const userName = auth.currentUser
    ? auth.currentUser.displayName || "User"
    : "User";

  // **CALCULATE STATISTICS HERE:**
  const upcomingTripsCount = useMemo(() => countUpcomingTrips(), [countUpcomingTrips]);
  const completedTripsCount = useMemo(() => countCompletedTrips(), [countCompletedTrips]);
  const totalExpensesAmount = useMemo(() => calculateTotalExpenses(), [calculateTotalExpenses]);
  const upcomingReminders = getUpcomingReminders();

  // --- Chart Data Preparation ---
  const categoryPieChartData = useMemo(() => CATEGORIES.map((category) => ({
    name: category,
    value: userItineraries.filter(
      (itinerary) => itinerary.category === category
    ).length,
  })), [userItineraries]);

  const expenseCategoryBarChartData = useMemo(() => EXPENSE_CATEGORIES.map((category) => {
    let categoryExpense = 0;
    userItineraries.forEach((itinerary) => {
      itinerary.destinations.forEach((destination) => {
        (destination.expenses || [])
          .filter((expense) => expense.category === category)
          .forEach((expense) => {
            categoryExpense += parseFloat(expense.amount) || 0;
          });
      });
    });
    return { name: category, value: categoryExpense };
  }), [userItineraries]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          backgroundColor: DASHBOARD_BACKGROUND_COLOR,
          minHeight: "100vh",
          py: 3,
        }}
      >
        <Box className="p-4 max-w-7xl mx-auto">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "black" }}
            >
              Welcome back, {userName} 👋
            </Typography>
            <Box>
              <FormControl
                size="small"
                sx={{
                  mr: 2,
                  backgroundColor: CARD_BACKGROUND_COLOR,
                  borderRadius: 1,
                  width: 150,
                }}
              >
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  id="category-filter"
                  value={categoryFilter}
                  label="Filter Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="warning"
                onClick={handleCreateNewPlanClick}
                sx={{ fontWeight: "bold" }}
              >
                Create New Plan
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <CircularProgress size={60} />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Summary Cards (same as before) */}
              <Grid item xs={12} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", padding: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="textSecondary"
                      gutterBottom
                    >
                      Upcoming Trips
                    </Typography>
                    <Typography
                      variant="h3"
                      color="primary"
                      sx={{ fontWeight: "bold" }}
                    >
                      {upcomingTripsCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", padding: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="textSecondary"
                      gutterBottom
                    >
                      Completed Trips
                    </Typography>
                    <Typography
                      variant="h3"
                      color="success"
                      sx={{ fontWeight: "bold" }}
                    >
                      {completedTripsCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", padding: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="textSecondary"
                      gutterBottom
                    >
                      Total Expenses
                    </Typography>
                    <Typography
                      variant="h3"
                      color="secondary"
                      sx={{ fontWeight: "bold" }}
                    >
                      ₹{totalExpensesAmount.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", padding: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="textSecondary"
                      gutterBottom
                    >
                      Locations Visited
                    </Typography>
                    <Typography
                      variant="h3"
                      color="warning"
                      sx={{ fontWeight: "bold" }}
                    >
                      {filteredLocations.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Charts Section (same as before) */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h3"
                      mb={2}
                      fontWeight="bold"
                      color="textPrimary"
                    >
                      Itinerary Categories
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart background={CHART_BACKGROUND_COLOR}>
                        <Pie
                          data={categoryPieChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50} // Added inner radius for donut chart
                          outerRadius={120} // Increased outer radius
                          paddingAngle={2} // Added padding between slices
                          fill="#8884d8"
                          labelLine={false} // Removed label lines
                          label={renderCustomLabel} // Custom label rendering for better positioning
                        >
                          {categoryPieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                        />{" "}
                        {/* Styled Legend */}
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h3"
                      mb={2}
                      fontWeight="bold"
                      color="textPrimary"
                    >
                      Expenses by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={expenseCategoryBarChartData}
                        background={CHART_BACKGROUND_COLOR}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#BDBDBD" />{" "}
                        {/* Lighter gridlines */}
                        <XAxis dataKey="name" tick={{ fill: "gray" }} />{" "}
                        {/* X-axis tick color */}
                        <YAxis tick={{ fill: "gray" }} />{" "}
                        {/* Y-axis tick color */}
                        <RechartsTooltip
                          wrapperStyle={{
                            backgroundColor: CARD_BACKGROUND_COLOR,
                            padding: "10px",
                            border: "1px solid #E0E0E0",
                            borderRadius: "5px",
                          }}
                        />{" "}
                        {/* Styled Tooltip */}
                        <Legend
                          iconType="plainline"
                          textStyle={{ color: "#757575" }}
                        />{" "}
                        {/* Styled Legend */}
                        <Bar
                          dataKey="value"
                          fill="#2ECC71"
                          barSize={30}
                          label={{ fill: "#424242" }}
                        />{" "}
                        {/* Bar styling: color, size, labels */}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              {/* Visited Locations Map Section */}
              <Grid item xs={12} md={12}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h3"
                      mb={2}
                      fontWeight="bold"
                      color="textPrimary"
                    >
                      Visited Locations on Map
                    </Typography>
                    {/* LoadScript rendering only once using useRef */}
                    {!isMapLoaded.current && (
                      <LoadScript
                        googleMapsApiKey="AIzaSyCFfwfN3JhDm1sXkfBoUMfB-Tz-xYLjaXo"
                        libraries={libraries} // Use the constant libraries
                        onLoad={() => { isMapLoaded.current = true; }} // Set ref when loaded
                      />
                    )}
                    {isMapLoaded.current && (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={2} // Adjust zoom level as needed
                        options={mapOptions}
                      >
                        {filteredLocations.map((location, index) => (
                          <Marker
                            key={index}
                            position={{ lat: location.lat, lng: location.lng }}
                            title={location.name} // Or use destination name if available
                            onClick={() => handleMarkerClick(location)} // Handle marker click
                          >
                            {selectedPlace === location && ( // Show info window if selected
                              <InfoWindow
                                position={{
                                  lat: location.lat,
                                  lng: location.lng,
                                }}
                                onCloseClick={() => setSelectedPlace(null)}
                              >
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                  >
                                    {location.name || location.formattedAddress}
                                  </Typography>
                                  <Typography variant="body2">
                                    {location.formattedAddress}
                                  </Typography>
                                </Box>
                              </InfoWindow>
                            )}
                          </Marker>
                        ))}
                      </GoogleMap>
                    )}
                    {!isMapLoaded.current && <CircularProgress />} {/* Loading indicator until map is loaded */}

                  </CardContent>
                </Card>
              </Grid>
              {/* Location Filter (same as before) */}
              <Grid item xs={12} md={4}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h3"
                      mb={3}
                      fontWeight="bold"
                      color="textPrimary"
                    >
                      Location Insights
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mb: 3,
                        flexDirection: "column",
                      }}
                    >
                      <FormControl
                        size="small"
                        sx={{ backgroundColor: "#F0F0F0", borderRadius: 1 }}
                      >
                        <InputLabel
                          id="location-type-label"
                          sx={{ color: "textSecondary" }}
                        >
                          Filter Type
                        </InputLabel>
                        <Select
                          labelId="location-type-label"
                          id="location-type"
                          name="type"
                          value={locationFilter.type}
                          label="Type"
                          onChange={handleLocationFilterChange}
                        >
                          {LOCATION_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label={`Filter by ${locationFilter.type}`}
                        name="value"
                        value={locationFilter.value}
                        onChange={handleLocationFilterChange}
                        sx={{ backgroundColor: "#F0F0F0", borderRadius: 1 }}
                      />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      mb={1}
                      color="textSecondary"
                    >
                      Filtered Locations:
                    </Typography>
                    <List
                      dense
                      style={{
                        maxHeight: 200,
                        overflow: "auto",
                        border: "1px solid #E0E0E0",
                        borderRadius: 1,
                        padding: 1,
                        backgroundColor: "#FAFAFA",
                      }}
                    >
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location, index) => (
                          <ListItem key={index} divider>
                            <ListItemText
                              primaryTypographyProps={{ color: "textPrimary" }}
                              primary={location.name}
                            />{" "}
                            {/* Display location name */}
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="No locations found." />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Upcoming Reminders (same as before) */}
              <Grid item xs={12} md={8}>
                <Card
                  elevation={3}
                  sx={{
                    backgroundColor: CARD_BACKGROUND_COLOR,
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h3"
                      mb={3}
                      fontWeight="bold"
                      color="textPrimary"
                    >
                      Next 5 Upcoming Reminders
                    </Typography>
                    <List dense>
                      {upcomingReminders.length > 0 ? (
                        upcomingReminders.map((reminder, index) => (
                          <ListItem key={index} divider>
                            <ListItemIcon sx={{ color: "#757575" }}>
                              <Alarm color="action" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  fontWeight="medium"
                                  color="textPrimary"
                                >
                                  {reminder.title}
                                </Typography>
                              }
                              secondary={`${reminder.destinationName} (${
                                reminder.itineraryTitle
                              }) - ${moment(reminder.date).format("LL")}`}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="No upcoming reminders." />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>


            </Grid>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={COLORS[index % COLORS.length]}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const EXPENSE_CATEGORIES = [
  "transportation",
  "accommodation",
  "food",
  "activities",
  "shopping",
  "other",
];

export default Dashboard;