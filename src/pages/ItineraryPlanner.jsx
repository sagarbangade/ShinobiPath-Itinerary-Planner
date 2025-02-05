import { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Label as LabelIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon, // Added Print Icon
  FilterList as FilterListIcon, // Added Filter Icon
} from "@mui/icons-material";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  Typography,
  FormHelperText,
  Grid, // Added Grid Layout
  Card, // Added Card Component
  CardContent, // Added Card Content
  Tooltip, //Added Tooltip
  Menu, //Added Menu for filter
  MenuList, //Added Menu List for fitler
  ListItemIcon, //List icon for Filter
} from "@mui/material";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box p={3}>{children}</Box>}
  </div>
);

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

const CATEGORIES = ["leisure", "adventure", "cultural"];
const TRANSPORTATIONS = ["car", "flight", "train", "bus", "other"];
const EXPENSE_CATEGORIES = [
  "transportation",
  "accommodation",
  "food",
  "activities",
  "shopping",
  "other",
];
const REMINDER_TYPES = ["activity", "reservation", "transportation", "other"];
const ACTIVITY_TYPES = ["sightseeing", "dining", "relaxation", "adventure"];

// Validation function (basic email check)
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ItineraryPlanner = () => {
  const [itineraries, setItineraries] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    transportation: "",
    location: "",
    activities: [],
    customFields: [],
    expenses: [],
    category: "leisure",
    isCollaborative: false,
    collaborators: [],
    reminders: [],
  });
  const [editIndex, setEditIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [viewItineraryIndex, setViewItineraryIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [plansForSelectedDate, setPlansForSelectedDate] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(""); // Added Category Filter
  const [filterAnchorEl, setFilterAnchorEl] = useState(null); //Anchor for Category Filter
  const isFilterMenuOpen = Boolean(filterAnchorEl); // Open for Category Filter

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      const plans = itineraries.filter(
        (itinerary) =>
          moment(itinerary.startDate).format("YYYY-MM-DD") <= formattedDate &&
          moment(itinerary.endDate).format("YYYY-MM-DD") >= formattedDate &&
          (categoryFilter === "" || itinerary.category === categoryFilter) // Apply Category Filter
      );
      setPlansForSelectedDate(plans);
    } else {
      setPlansForSelectedDate([]);
    }
  }, [selectedDate, itineraries, categoryFilter]);

  const handleAddItinerary = () => {
    const errors = validateForm(currentItinerary);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (editIndex !== null) {
        const updatedItineraries = [...itineraries];
        updatedItineraries[editIndex] = currentItinerary;
        setItineraries(updatedItineraries);
        setEditIndex(null);
      } else {
        setItineraries([...itineraries, currentItinerary]);
      }
      resetModal();
    }
  };

  const validateForm = (itinerary) => {
    const errors = {};
    if (!itinerary.title) {
      errors.title = "Title is required";
    }
    if (!itinerary.location) {
      errors.location = "Location is required";
    }
    if (!itinerary.startDate) {
      errors.startDate = "Start Date is required";
    }
    if (!itinerary.endDate) {
      errors.endDate = "End Date is required";
    }
    if (
      itinerary.startDate &&
      itinerary.endDate &&
      itinerary.startDate > itinerary.endDate
    ) {
      errors.endDate = "End Date must be after Start Date";
    }
    if (
      isNaN(parseFloat(itinerary.budget)) ||
      parseFloat(itinerary.budget) <= 0
    ) {
      errors.budget = "Budget must be a positive number";
    }

    return errors;
  };

  const handleDeleteItinerary = (index) => {
    const newItineraries = itineraries.filter((_, i) => i !== index);
    setItineraries(newItineraries);
  };

  const calculateRemaining = useCallback(() => {
    const totalExpenses =
      currentItinerary.expenses.reduce(
        (sum, expense) => sum + (parseFloat(expense.amount) || 0),
        0
      ) +
      currentItinerary.activities.reduce(
        (sum, activity) => sum + (parseFloat(activity.cost) || 0),
        0
      );
    const budget = parseFloat(currentItinerary.budget) || 0;
    return (budget - totalExpenses).toFixed(2);
  }, [currentItinerary]);

  const handleEditItinerary = (index) => {
    setCurrentItinerary({ ...itineraries[index] });
    setEditIndex(index);
    setOpenModal(true);
    setFormErrors({});
  };

  const resetModal = () => {
    setOpenModal(false);
    setCurrentItinerary({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      transportation: "",
      location: "",
      activities: [],
      customFields: [],
      expenses: [],
      category: "leisure",
      isCollaborative: false,
      collaborators: [],
      reminders: [],
    });
    setEditIndex(null);
    setActiveTab(0);
    setNewCollaboratorEmail("");
    setFormErrors({});
  };

  const handleAddCustomField = () => {
    setCurrentItinerary((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { label: "", value: "" }],
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomFields = currentItinerary.customFields.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    setCurrentItinerary((prev) => ({
      ...prev,
      customFields: updatedCustomFields,
    }));
  };

  const removeCustomField = (index) => {
    const updatedCustomFields = currentItinerary.customFields.filter(
      (_, i) => i !== index
    );
    setCurrentItinerary((prev) => ({
      ...prev,
      customFields: updatedCustomFields,
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItineraries = Array.from(itineraries);
    const [reorderedItem] = reorderedItineraries.splice(result.source.index, 1);
    reorderedItineraries.splice(result.destination.index, 0, reorderedItem);
    setItineraries(reorderedItineraries);
  };

  const handleInputChange = (tab, index, field, value) => {
    setCurrentItinerary((prev) => {
      const updatedItems = prev[tab].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, [tab]: updatedItems };
    });
  };

  const handleAddActivity = () => {
    setCurrentItinerary((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          title: "",
          time: "",
          type: "sightseeing",
          cost: "",
          notes: "",
          location: "",
        },
      ],
    }));
  };

  const handleAddExpense = () => {
    setCurrentItinerary((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        { item: "", amount: "", category: "transportation", date: "" },
      ],
    }));
  };

  const handleAddReminder = () => {
    setCurrentItinerary((prev) => ({
      ...prev,
      reminders: [
        ...prev.reminders,
        { title: "", date: "", time: "", type: "activity" },
      ],
    }));
  };

  const handleDeleteItem = (tab, index) => {
    setCurrentItinerary((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((_, i) => i !== index),
    }));
  };

  const handleAddCollaborator = () => {
    if (
      newCollaboratorEmail &&
      !currentItinerary.collaborators.includes(newCollaboratorEmail) &&
      isValidEmail(newCollaboratorEmail)
    ) {
      setCurrentItinerary((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, newCollaboratorEmail],
      }));
      setNewCollaboratorEmail("");
    } else if (
      newCollaboratorEmail &&
      currentItinerary.collaborators.includes(newCollaboratorEmail)
    ) {
      alert("Collaborator already added");
    } else if (newCollaboratorEmail && !isValidEmail(newCollaboratorEmail)) {
      alert("Please enter a valid email.");
    }
  };

  const handleRemoveCollaborator = (index) => {
    const newCollaborators = currentItinerary.collaborators.filter(
      (_, i) => i !== index
    );
    setCurrentItinerary((prev) => ({
      ...prev,
      collaborators: newCollaborators,
    }));
  };

  const handleDragEndModal = (tab, result) => {
    if (!result.destination) return;

    const items = [...currentItinerary[tab]];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCurrentItinerary((prev) => ({ ...prev, [tab]: items }));
  };

  const handleViewItinerary = (index) => {
    setViewItineraryIndex(index);
  };

  const handleCloseViewItinerary = () => {
    setViewItineraryIndex(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  // Filter Menu
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };
  const handleCategoryFilterSelect = (category) => {
    setCategoryFilter(category);
    handleFilterMenuClose();
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const backgroundColor = "#3174ad";
    const style = {
      backgroundColor: backgroundColor,
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const events = itineraries.map((itinerary) => ({
    title: itinerary.title,
    start: new Date(itinerary.startDate),
    end: new Date(itinerary.endDate),
  }));

  //Print itinerary
  const handlePrint = () => {
    window.print();
  };
  const filteredItineraries = itineraries.filter(
    (itinerary) =>
      categoryFilter === "" || itinerary.category === categoryFilter
  );

  return (
    <div>
      <Navbar />
      <div
        className="p-6 bg-gray-100 min-h-screen "
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <Grid container spacing={3} className="max-w-7xl mx-auto">
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography
                variant="h4"
                component="h1"
                style={{ fontWeight: "bold" }}
              >
                Itinerary Planner
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenModal(true)}
                  style={{ backgroundColor: "#2E7D32", color: "white" }} // Forest Green
                >
                  New Itinerary
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  style={{ color: "#1976D2", borderColor: "#1976D2" }}
                >
                  Download Plans
                </Button>
                {/* Print button */}
                <Tooltip title="Print Itinerary">
                  <IconButton aria-label="print" onClick={handlePrint}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                {/* Category Filter button */}
                <Tooltip title="Filter by Category">
                  <IconButton
                    aria-label="filter"
                    aria-controls="filter-menu"
                    aria-haspopup="true"
                    onClick={handleFilterMenuOpen}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="filter-menu"
                  anchorEl={filterAnchorEl}
                  open={isFilterMenuOpen}
                  onClose={handleFilterMenuClose}
                >
                  <MenuList>
                    <MenuItem onClick={() => handleCategoryFilterSelect("")}>
                      <ListItemIcon>
                        <LabelIcon />
                      </ListItemIcon>
                      All Categories
                    </MenuItem>
                    {CATEGORIES.map((category) => (
                      <MenuItem
                        key={category}
                        onClick={() => handleCategoryFilterSelect(category)}
                      >
                        <ListItemIcon>
                          <LabelIcon />
                        </ListItemIcon>
                        {category}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={8}>
            {selectedDate && (
              <Card elevation={3} style={{ marginBottom: "20px" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    style={{ color: "#2E7D32", fontWeight: "bold" }}
                  >
                    Plans for {moment(selectedDate).format("MMMM DD, YYYY")}
                  </Typography>
                  {plansForSelectedDate.length > 0 ? (
                    plansForSelectedDate.map((plan) => (
                      <Card
                        key={plan.title}
                        elevation={2}
                        style={{ marginBottom: "10px" }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: "bold" }}
                          >
                            {plan.title}
                          </Typography>
                          <Typography variant="body2">
                            Location: {plan.location}
                          </Typography>
                          <Typography variant="body2">
                            {moment(plan.startDate).format("LL")} -{" "}
                            {moment(plan.endDate).format("LL")}
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{ fontStyle: "italic" }}
                          >
                            Category: {plan.category}
                          </Typography>
                          {/* Display other relevant details here */}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body1">
                      No plans for this date.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="itineraries">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {filteredItineraries.map((itinerary, index) => (
                      <Draggable
                        key={`${itinerary.title}-${index}`}
                        draggableId={`${itinerary.title}-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={3}
                          >
                            <CardContent
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <Typography
                                  variant="h6"
                                  component="h2"
                                  style={{ fontWeight: "bold" }}
                                >
                                  {itinerary.title}
                                </Typography>
                                <Typography
                                  variant="subtitle2"
                                  color="textSecondary"
                                >
                                  {moment(itinerary.startDate).format("LL")} -{" "}
                                  {moment(itinerary.endDate).format("LL")}
                                </Typography>
                              </div>
                              <Box display="flex">
                                <Tooltip title="View Details">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleViewItinerary(index)}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Itinerary">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleEditItinerary(index)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Itinerary">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDeleteItinerary(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Grid>

          <Grid item xs={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography
                  variant="h6"
                  component="h3"
                  style={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Calendar
                </Typography>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  onSelectSlot={({ start }) => handleDateSelect(start)}
                  selectable={true}
                  eventPropGetter={eventStyleGetter}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* View Itinerary Dialog */}
          <Dialog
            open={viewItineraryIndex !== null}
            onClose={handleCloseViewItinerary}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Itinerary Details</DialogTitle>
            <DialogContent>
              {viewItineraryIndex !== null && (
                <>
                  <Typography
                    variant="h5"
                    style={{ fontWeight: "bold", marginBottom: "10px" }}
                  >
                    {itineraries[viewItineraryIndex].title}
                  </Typography>
                  <Typography variant="subtitle1">
                    {moment(itineraries[viewItineraryIndex].startDate).format(
                      "LL"
                    )}{" "}
                    -{" "}
                    {moment(itineraries[viewItineraryIndex].endDate).format(
                      "LL"
                    )}
                  </Typography>
                  <Typography variant="body1" style={{ marginTop: "10px" }}>
                    {itineraries[viewItineraryIndex].description}
                  </Typography>
                  <Typography
                    variant="h6"
                    style={{ marginTop: "20px", fontWeight: "bold" }}
                  >
                    Activities
                  </Typography>
                  {itineraries[viewItineraryIndex].activities.map(
                    (activity, index) => (
                      <Card
                        key={index}
                        elevation={2}
                        style={{ marginBottom: "10px" }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle2"
                            style={{ fontWeight: "bold" }}
                          >
                            {activity.title}
                          </Typography>
                          <Typography variant="body2">
                            {activity.time} - {activity.location}
                          </Typography>
                        </CardContent>
                      </Card>
                    )
                  )}
                  {/* Display other details as needed (Expenses, Reminders, etc.) */}
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewItinerary} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Itinerary Modal */}
          <Dialog open={openModal} onClose={resetModal} maxWidth="lg" fullWidth>
            <DialogTitle>
              {editIndex !== null ? "Edit Itinerary" : "Create New Itinerary"}
            </DialogTitle>
            <DialogContent>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                className="mb-4"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Basic Info" />
                <Tab label="Activities" />
                <Tab label="Expenses" />
                <Tab label="Reminders" />
                <Tab label="Sharing" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TextField
                      required
                      label="Title"
                      fullWidth
                      value={currentItinerary.title}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      margin="normal"
                      error={!!formErrors.title}
                      helperText={formErrors.title}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      value={currentItinerary.description}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={currentItinerary.startDate}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      margin="normal"
                      error={!!formErrors.startDate}
                      helperText={formErrors.startDate}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={currentItinerary.endDate}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      margin="normal"
                      error={!!formErrors.endDate}
                      helperText={formErrors.endDate}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Budget"
                      type="number"
                      fullWidth
                      value={currentItinerary.budget}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({
                          ...prev,
                          budget: e.target.value,
                        }))
                      }
                      margin="normal"
                      error={!!formErrors.budget}
                      helperText={formErrors.budget}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="transportation-label">
                        Transportation
                      </InputLabel>
                      <Select
                        labelId="transportation-label"
                        label="Transportation"
                        value={currentItinerary.transportation}
                        onChange={(e) =>
                          setCurrentItinerary((prev) => ({
                            ...prev,
                            transportation: e.target.value,
                          }))
                        }
                      >
                        {TRANSPORTATIONS.map((transport) => (
                          <MenuItem key={transport} value={transport}>
                            {transport}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Custom Fields Section */}
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="h6" component="h4">
                        Custom Fields
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddCustomField}
                      >
                        Add Field
                      </Button>
                    </Box>
                    {currentItinerary.customFields.map((field, index) => (
                      <Box key={index} display="flex" gap={2} mb={2}>
                        <TextField
                          label="Field Label"
                          value={field.label}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "label",
                              e.target.value
                            )
                          }
                          fullWidth
                        />
                        <TextField
                          label="Field Value"
                          value={field.value}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                          fullWidth
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeCustomField(index)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      required
                      label="Location"
                      fullWidth
                      value={currentItinerary.location}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      error={!!formErrors.location}
                      helperText={formErrors.location}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={currentItinerary.category}
                        label="Category"
                        onChange={(e) =>
                          setCurrentItinerary((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                      >
                        {CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddActivity}
                  className="mb-4"
                >
                  Add Activity
                </Button>
                <DragDropContext
                  onDragEnd={(result) =>
                    handleDragEndModal("activities", result)
                  }
                >
                  <Droppable droppableId="activities">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {currentItinerary.activities.map((activity, index) => (
                          <Draggable
                            key={index}
                            draggableId={`activity-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                elevation={2}
                                style={{
                                  marginBottom: "10px",
                                  padding: "10px",
                                }} // Added padding
                              >
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Activity Title"
                                      fullWidth
                                      value={activity.title}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "activities",
                                          index,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Location"
                                      fullWidth
                                      value={activity.location}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "activities",
                                          index,
                                          "location",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Time"
                                      type="time"
                                      fullWidth
                                      InputLabelProps={{ shrink: true }}
                                      value={activity.time}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "activities",
                                          index,
                                          "time",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <FormControl fullWidth>
                                      <InputLabel>Type</InputLabel>
                                      <Select
                                        value={activity.type}
                                        label="Type"
                                        onChange={(e) =>
                                          handleInputChange(
                                            "activities",
                                            index,
                                            "type",
                                            e.target.value
                                          )
                                        }
                                      >
                                        {ACTIVITY_TYPES.map((type) => (
                                          <MenuItem key={type} value={type}>
                                            {type}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Cost"
                                      type="number"
                                      fullWidth
                                      value={activity.cost}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "activities",
                                          index,
                                          "cost",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      label="Notes"
                                      fullWidth
                                      multiline
                                      rows={2}
                                      value={activity.notes}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "activities",
                                          index,
                                          "notes",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={12}
                                    style={{ textAlign: "right" }}
                                  >
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        handleDeleteItem("activities", index)
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography
                      variant="h6"
                      component="h4"
                      style={{ fontWeight: "bold", marginBottom: "10px" }}
                    >
                      Budget Overview
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Total Budget"
                      type="number"
                      fullWidth
                      value={currentItinerary.budget}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({
                          ...prev,
                          budget: e.target.value,
                        }))
                      }
                      margin="normal"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography variant="body1">
                      Remaining: ${calculateRemaining()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddExpense}
                      className="mb-4"
                    >
                      Add Expense
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <DragDropContext
                      onDragEnd={(result) =>
                        handleDragEndModal("expenses", result)
                      }
                    >
                      <Droppable droppableId="expenses">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {currentItinerary.expenses.map((expense, index) => (
                              <Draggable
                                key={index}
                                draggableId={`expense-${index}`}
                                index={index}
                              >
                                {(provided) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    elevation={2}
                                    style={{
                                      marginBottom: "10px",
                                      padding: "10px",
                                    }} // Added padding
                                  >
                                    <Grid container spacing={2}>
                                      <Grid item xs={6}>
                                        <TextField
                                          label="Item"
                                          fullWidth
                                          value={expense.item}
                                          onChange={(e) =>
                                            handleInputChange(
                                              "expenses",
                                              index,
                                              "item",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={6}>
                                        <TextField
                                          label="Amount"
                                          type="number"
                                          fullWidth
                                          value={expense.amount}
                                          onChange={(e) =>
                                            handleInputChange(
                                              "expenses",
                                              index,
                                              "amount",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={6}>
                                        <FormControl fullWidth>
                                          <InputLabel>Category</InputLabel>
                                          <Select
                                            value={expense.category}
                                            label="Category"
                                            onChange={(e) =>
                                              handleInputChange(
                                                "expenses",
                                                index,
                                                "category",
                                                e.target.value
                                              )
                                            }
                                          >
                                            {EXPENSE_CATEGORIES.map(
                                              (category) => (
                                                <MenuItem
                                                  key={category}
                                                  value={category}
                                                >
                                                  {category}
                                                </MenuItem>
                                              )
                                            )}
                                          </Select>
                                        </FormControl>
                                      </Grid>
                                      <Grid item xs={6}>
                                        <TextField
                                          label="Date"
                                          type="date"
                                          fullWidth
                                          InputLabelProps={{ shrink: true }}
                                          value={expense.date}
                                          onChange={(e) =>
                                            handleInputChange(
                                              "expenses",
                                              index,
                                              "date",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </Grid>
                                      <Grid
                                        item
                                        xs={12}
                                        style={{ textAlign: "right" }}
                                      >
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            handleDeleteItem("expenses", index)
                                          }
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddReminder}
                      className="mb-4"
                    >
                      Add Reminder
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <DragDropContext
                      onDragEnd={(result) =>
                        handleDragEndModal("reminders", result)
                      }
                    >
                      <Droppable droppableId="reminders">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {currentItinerary.reminders.map(
                              (reminder, index) => (
                                <Draggable
                                  key={index}
                                  draggableId={`reminder-${index}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      elevation={2}
                                      style={{
                                        marginBottom: "10px",
                                        padding: "10px",
                                      }} // Added padding
                                    >
                                      <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                          <TextField
                                            label="Reminder Title"
                                            fullWidth
                                            value={reminder.title}
                                            onChange={(e) =>
                                              handleInputChange(
                                                "reminders",
                                                index,
                                                "title",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </Grid>
                                        <Grid item xs={6}>
                                          <FormControl fullWidth>
                                            <InputLabel>Type</InputLabel>
                                            <Select
                                              value={reminder.type}
                                              label="Type"
                                              onChange={(e) =>
                                                handleInputChange(
                                                  "reminders",
                                                  index,
                                                  "type",
                                                  e.target.value
                                                )
                                              }
                                            >
                                              {REMINDER_TYPES.map((type) => (
                                                <MenuItem
                                                  key={type}
                                                  value={type}
                                                >
                                                  {type}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                          <TextField
                                            label="Date"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={reminder.date}
                                            onChange={(e) =>
                                              handleInputChange(
                                                "reminders",
                                                index,
                                                "date",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </Grid>
                                        <Grid item xs={6}>
                                          <TextField
                                            label="Time"
                                            type="time"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={reminder.time}
                                            onChange={(e) =>
                                              handleInputChange(
                                                "reminders",
                                                index,
                                                "time",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </Grid>
                                        <Grid
                                          item
                                          xs={12}
                                          style={{ textAlign: "right" }}
                                        >
                                          <IconButton
                                            color="error"
                                            onClick={() =>
                                              handleDeleteItem(
                                                "reminders",
                                                index
                                              )
                                            }
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Grid>
                                      </Grid>
                                    </Card>
                                  )}
                                </Draggable>
                              )
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentItinerary.isCollaborative}
                          onChange={(e) =>
                            setCurrentItinerary((prev) => ({
                              ...prev,
                              isCollaborative: e.target.checked,
                            }))
                          }
                        />
                      }
                      label="Enable Collaboration"
                    />
                  </Grid>

                  {currentItinerary.isCollaborative && (
                    <>
                      <Grid item xs={6}>
                        <TextField
                          label="Add Collaborator Email"
                          fullWidth
                          placeholder="Enter email address"
                          value={newCollaboratorEmail}
                          onChange={(e) =>
                            setNewCollaboratorEmail(e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="contained"
                          startIcon={<ShareIcon />}
                          onClick={handleAddCollaborator}
                        >
                          Add Collaborator
                        </Button>
                      </Grid>
                    </>
                  )}

                  {currentItinerary.collaborators.length > 0 && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        style={{ marginBottom: "10px" }}
                      >
                        Current Collaborators
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {currentItinerary.collaborators.map(
                          (collaborator, index) => (
                            <Chip
                              key={index}
                              label={collaborator}
                              onDelete={() => handleRemoveCollaborator(index)}
                            />
                          )
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={resetModal}
                color="secondary"
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItinerary}
                color="primary"
                startIcon={<SaveIcon />}
                variant="contained"
              >
                {editIndex !== null ? "Update" : "Save"}
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </div>
      <Footer />
    </div>
  );
};

export default ItineraryPlanner;
