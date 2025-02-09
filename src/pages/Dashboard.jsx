import React, { useState, useCallback, useEffect } from "react";
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

const CATEGORIES = ["leisure", "adventure", "cultural", "other"];
const LOCATION_TYPES = ["city", "state", "country"];

// Custom color palette (more visually appealing)
const COLORS = ["#2E86C1", "#1E8449", "#D4AC0D", "#CB4335", "#6C3483", "#3498DB"]; // Blues, Greens, Golds, Reds, Purples, Light Blues
const CHART_BACKGROUND_COLOR = "#F9F9F9"; // Light gray chart background
const CARD_BACKGROUND_COLOR = "#FFFFFF";     // White card background
const DASHBOARD_BACKGROUND_COLOR = "#F4F6F7"; // Light gray dashboard background

const Dashboard = () => {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState({
    type: "city",
    value: "",
  });
  const [userItineraries, setUserItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    // ... (rest of fetchSharedItineraries and fetchAllItineraries are the same) ...
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
    const fetchData = async () => {
      setLoading(true);
      await fetchAllItineraries();
      setLoading(false);
    };
    fetchData();
  }, [fetchAllItineraries]);

  // --- Data Processing / Statistics Functions ---
  const countUpcomingTrips = useCallback(
    (filterCategory) => {
      return userItineraries.filter(
        (itinerary) =>
          moment(itinerary.endDate).isAfter(moment()) &&
          (!filterCategory || itinerary.category === filterCategory)
      ).length;
    },
    [userItineraries, categoryFilter]
  );

  const countCompletedTrips = useCallback(
    (filterCategory) => {
      return userItineraries.filter(
        (itinerary) =>
          moment(itinerary.endDate).isBefore(moment()) &&
          (!filterCategory || itinerary.category === filterCategory)
      ).length;
    },
    [userItineraries, categoryFilter]
  );

  const calculateTotalExpenses = useCallback(
    (filterCategory) => {
      let totalExpenses = 0;
      userItineraries.forEach((itinerary) => {
        if (!filterCategory || itinerary.category === filterCategory) {
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

  const getFilteredLocations = useCallback(
    (filterCategory, locationFilter) => {
      const locations = new Set();
      userItineraries.forEach((itinerary) => {
        if (!filterCategory || itinerary.category === filterCategory) {
          itinerary.destinations.forEach((destination) => {
            if (
              destination.location &&
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
                locationPart.toLowerCase().includes(locationFilter.value.toLowerCase())
              ) {
                locations.add(locationPart);
              }
            }
          });
        }
      });
      return Array.from(locations);
    },
    [userItineraries, categoryFilter, locationFilter]
  );


  const handleLocationFilterChange = (event) => {
    setLocationFilter({
      ...locationFilter,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateNewPlanClick = () => {
    navigate("/itineraries");
  };

  const userName = auth.currentUser
    ? auth.currentUser.displayName || "User"
    : "User";

  // **CALCULATE STATISTICS HERE:**
  const upcomingTripsCount = countUpcomingTrips(categoryFilter);
  const completedTripsCount = countCompletedTrips(categoryFilter);
  const filteredLocations = getFilteredLocations(categoryFilter, locationFilter);
  const totalExpensesAmount = calculateTotalExpenses(categoryFilter);
  const upcomingReminders = getUpcomingReminders();

  // --- Chart Data Preparation ---
  const categoryPieChartData = CATEGORIES.map((category) => ({
    name: category,
    value: userItineraries.filter((itinerary) => itinerary.category === category).length,
  }));

  const expenseCategoryBarChartData = EXPENSE_CATEGORIES.map((category) => {
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
  });


  return (
    <Box sx={{ backgroundColor: DASHBOARD_BACKGROUND_COLOR, minHeight: '100vh', py: 3 }}> {/* Dashboard Background */}
      <Navbar />
      <Box className="p-4 max-w-7xl mx-auto"> {/* Increased max width for content */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4} // Increased margin bottom
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "primary.dark" }} // Darker primary color
          >
            Welcome back, {userName} 👋
          </Typography>
          <Box>
            <FormControl size="small" sx={{ mr: 2, backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 1 }}> {/* Filter Background */}
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
              color="primary"
              onClick={handleCreateNewPlanClick}
              sx={{ fontWeight: 'bold' }} // Bold button text
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
              height: "300px", // Increased height for loading
            }}
          >
            <CircularProgress size={60} /> {/* Larger loader */}
          </Box>
        ) : (
          <Grid container spacing={4}> {/* Increased spacing */}
            {/* --- Summary Cards Section --- */}
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}> {/* Card Styling */}
                <CardContent sx={{ textAlign: "center", padding: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="textSecondary" gutterBottom> {/* Subtitle styling */}
                    Upcoming Trips
                  </Typography>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}> {/* Statistic number styling */}
                    {upcomingTripsCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center", padding: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="textSecondary" gutterBottom>
                    Completed Trips
                  </Typography>
                  <Typography variant="h3" color="success" sx={{ fontWeight: 'bold' }}>
                    {completedTripsCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center", padding: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="textSecondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold' }}>
                    ₹{totalExpensesAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center", padding: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="textSecondary" gutterBottom>
                    Locations Visited
                  </Typography>
                  <Typography variant="h3" color="warning" sx={{ fontWeight: 'bold' }}>
                    {filteredLocations.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* --- Charts Section --- */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" mb={2} fontWeight="bold" color="textPrimary"> {/* Chart title styling */}
                    Itinerary Categories
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}> {/* Increased chart height */}
                    <PieChart background={CHART_BACKGROUND_COLOR}> {/* Chart Background */}
                      <Pie
                        data={categoryPieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}    // Added inner radius for donut chart
                        outerRadius={120}   // Increased outer radius
                        paddingAngle={2}    // Added padding between slices
                        fill="#8884d8"
                        labelLine={false}    // Removed label lines
                        label={renderCustomLabel} // Custom label rendering for better positioning
                      >
                        {categoryPieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend layout="vertical" align="right" verticalAlign="middle" /> {/* Styled Legend */}
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>


            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" mb={2} fontWeight="bold" color="textPrimary">
                    Expenses by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={expenseCategoryBarChartData} background={CHART_BACKGROUND_COLOR}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#BDBDBD"/> {/* Lighter gridlines */}
                      <XAxis dataKey="name" tick={{fill: 'gray'}}/>        {/* X-axis tick color */}
                      <YAxis tick={{fill: 'gray'}}/>        {/* Y-axis tick color */}
                      <RechartsTooltip wrapperStyle={{backgroundColor: CARD_BACKGROUND_COLOR, padding: '10px', border: '1px solid #E0E0E0', borderRadius: '5px'}}/> {/* Styled Tooltip */}
                      <Legend iconType="plainline" textStyle={{color: '#757575'}}/>  {/* Styled Legend */}
                      <Bar dataKey="value" fill="#2ECC71" barSize={30} label={{ fill: '#424242' }}/> {/* Bar styling: color, size, labels */}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>


            {/* --- Location Filter Section --- */}
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" mb={3} fontWeight="bold" color="textPrimary"> {/* Filter title styling */}
                    Location Insights
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: 'column' }}> {/* Filter controls spacing */}
                    <FormControl size="small" sx={{ backgroundColor: '#F0F0F0', borderRadius: 1 }}> {/* Filter Select Background */}
                      <InputLabel id="location-type-label" sx={{ color: 'textSecondary' }}>Filter Type</InputLabel> {/* Filter Label Styling */}
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
                      sx={{ backgroundColor: '#F0F0F0', borderRadius: 1 }} // Filter Textfield Background
                    />
                  </Box>
                  <Typography variant="subtitle1" mb={1} color="textSecondary">
                    Filtered Locations:
                  </Typography>
                  <List dense style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #E0E0E0', borderRadius: 1, padding: 1, backgroundColor: '#FAFAFA' }}> {/* Location List Styling */}
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((location, index) => (
                        <ListItem key={index} divider>
                          <ListItemText primaryTypographyProps={{color: 'textPrimary'}} primary={location}/> {/* Location Text Color */}
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


            {/* --- Upcoming Reminders Section --- */}
            <Grid item xs={12} md={8}>
              <Card elevation={3} sx={{ backgroundColor: CARD_BACKGROUND_COLOR, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" mb={3} fontWeight="bold" color="textPrimary"> {/* Reminder Title Styling */}
                    Next 5 Upcoming Reminders
                  </Typography>
                  <List dense>
                    {upcomingReminders.length > 0 ? (
                      upcomingReminders.map((reminder, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon sx={{ color: '#757575' }}> {/* Reminder Icon Color */}
                            <Alarm color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography fontWeight="medium" color="textPrimary">{reminder.title}</Typography>} // Reminder Primary text styling
                            secondary={`${reminder.destinationName} (${reminder.itineraryTitle}) - ${moment(reminder.date).format("LL")}`} // Reminder Secondary text styling
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
      <Footer />
    </Box>
  );
};

// Custom label rendering for PieChart (for better positioning)
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index, name
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3; // Adjust label position
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} 	dominantBaseline="central">
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