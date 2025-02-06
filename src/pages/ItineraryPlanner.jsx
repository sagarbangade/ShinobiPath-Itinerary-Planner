import { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar"; // Assumed component
import Footer from "../components/Footer"; // Assumed component
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Label as LabelIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
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
  Grid,
  Card,
  CardContent,
  Tooltip,
  Menu,
  MenuList,
  ListItemIcon,
  Divider,
  CircularProgress,
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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const isFilterMenuOpen = Boolean(filterAnchorEl);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      const plans = itineraries.filter(
        (itinerary) =>
          moment(itinerary.startDate).format("YYYY-MM-DD") <= formattedDate &&
          moment(itinerary.endDate).format("YYYY-MM-DD") >= formattedDate &&
          (categoryFilter === "" || itinerary.category === categoryFilter)
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
      } else {
        setItineraries([...itineraries, currentItinerary]);
      }
      resetModal();
    }
  };

  const validateForm = (itinerary) => {
    const errors = {};
    if (!itinerary.title) errors.title = "Title is required";
    if (!itinerary.location) errors.location = "Location is required";
    if (!itinerary.startDate) errors.startDate = "Start Date is required";
    if (!itinerary.endDate) errors.endDate = "End Date is required";
    if (
      itinerary.startDate &&
      itinerary.endDate &&
      itinerary.startDate > itinerary.endDate
    )
      errors.endDate = "End Date must be after Start Date";
    if (
      isNaN(parseFloat(itinerary.budget)) ||
      parseFloat(itinerary.budget) <= 0
    )
      errors.budget = "Budget must be a positive number";
    return errors;
  };

  const handleDeleteItinerary = (index) => {
    setItineraries(itineraries.filter((_, i) => i !== index));
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
    return (parseFloat(currentItinerary.budget) || 0 - totalExpenses).toFixed(
      2
    );
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
    setCurrentItinerary((prev) => ({
      ...prev,
      customFields: prev.customFields.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeCustomField = (index) => {
    setCurrentItinerary((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
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
    setCurrentItinerary((prev) => ({
      ...prev,
      [tab]: prev[tab].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
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
    setCurrentItinerary((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }));
  };

  const handleDragEndModal = (tab, result) => {
    if (!result.destination) return;
    const items = [...currentItinerary[tab]];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCurrentItinerary((prev) => ({ ...prev, [tab]: items }));
  };

  const handleViewItinerary = (index) => setViewItineraryIndex(index);
  const handleCloseViewItinerary = () => setViewItineraryIndex(null);
  const handleDateSelect = (date) => setSelectedDate(date);
  const handleFilterMenuOpen = (event) =>
    setFilterAnchorEl(event.currentTarget);
  const handleFilterMenuClose = () => setFilterAnchorEl(null);
  const handleCategoryFilterSelect = (category) => setCategoryFilter(category);

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#3174ad",
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    },
  });

  const events = itineraries.map((itinerary) => ({
    title: itinerary.title,
    start: new Date(itinerary.startDate),
    end: new Date(itinerary.endDate),
  }));
  const handlePrint = () => window.print();
  const handleApplyFilter = () => handleFilterMenuClose();
  const handleClearFilter = () => {
    setCategoryFilter("");
    handleFilterMenuClose();
  };
  const filteredItineraries = itineraries.filter(
    (itinerary) =>
      categoryFilter === "" || itinerary.category === categoryFilter
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "gray.100",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Main Content Area - Centered */}
        <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
          {" "}
          {/* Max-width and auto margins for centering */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                flexDirection={{ xs: "column", sm: "row" }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: "bold" }}
                  mb={2}
                >
                  Itinerary Planner
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenModal(true)}
                    sx={{ bgcolor: "#009689", color: "white" }}
                  >
                    New
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{ color: "#1976D2", borderColor: "#1976D2" }}
                  >
                    Download
                  </Button>
                  <Tooltip title="Print Itinerary">
                    <IconButton aria-label="print" onClick={handlePrint}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
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
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuList>
                      {CATEGORIES.map((category) => (
                        <MenuItem
                          key={category}
                          onClick={() => handleCategoryFilterSelect(category)}
                          selected={category === categoryFilter}
                        >
                          <ListItemIcon>
                            <LabelIcon />
                          </ListItemIcon>
                          {category}
                        </MenuItem>
                      ))}
                    </MenuList>
                    <Divider />
                    <Box
                      sx={{
                        p: 1,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ClearIcon />}
                        onClick={handleClearFilter}
                        size="small"
                      >
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CheckIcon />}
                        onClick={handleApplyFilter}
                        size="small"
                      >
                        Apply
                      </Button>
                    </Box>
                  </Menu>
                </Box>
              </Box>
            </Grid>

            {loading ? (
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <CircularProgress />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={8}>
                  {selectedDate && (
                    <Card elevation={3} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ color: "#2E7D32", fontWeight: "bold" }}
                        >
                          Plans for{" "}
                          {moment(selectedDate).format("MMMM DD, YYYY")}
                        </Typography>
                        {plansForSelectedDate.length > 0 ? (
                          plansForSelectedDate.map((plan) => (
                            <Card key={plan.title} elevation={2} sx={{ mb: 1 }}>
                              <CardContent>
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: "bold" }}
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
                                  sx={{ fontStyle: "italic" }}
                                >
                                  Category: {plan.category}
                                </Typography>
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
                        <Box
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          sx={{ display: "grid", gap: 2 }}
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
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="h6"
                                        component="h2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        {itinerary.title}
                                      </Typography>
                                      <Typography
                                        variant="subtitle2"
                                        color="textSecondary"
                                      >
                                        {moment(itinerary.startDate).format(
                                          "LL"
                                        )}{" "}
                                        -{" "}
                                        {moment(itinerary.endDate).format("LL")}
                                      </Typography>
                                    </Box>
                                    <Box display="flex">
                                      <Tooltip title="View Details">
                                        <IconButton
                                          color="primary"
                                          onClick={() =>
                                            handleViewItinerary(index)
                                          }
                                        >
                                          <VisibilityIcon />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Edit Itinerary">
                                        <IconButton
                                          color="primary"
                                          onClick={() =>
                                            handleEditItinerary(index)
                                          }
                                        >
                                          <EditIcon />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete Itinerary">
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            handleDeleteItinerary(index)
                                          }
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
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: "bold", mb: 1 }}
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
              </>
            )}

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
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
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
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {itineraries[viewItineraryIndex].description}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                      Activities
                    </Typography>
                    {itineraries[viewItineraryIndex].activities.map(
                      (activity, index) => (
                        <Card key={index} elevation={2} sx={{ mb: 1 }}>
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
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
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseViewItinerary} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={openModal}
              onClose={resetModal}
              maxWidth="lg"
              fullWidth
              scroll="paper"
            >
              <DialogTitle>
                {editIndex !== null ? "Edit Itinerary" : "Create New Itinerary"}
              </DialogTitle>
              <DialogContent dividers>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{ mb: 2 }}
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
                    <Grid item xs={12} sm={6}>
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
                        error={!!formErrors.title}
                        helperText={formErrors.title}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                        error={!!formErrors.startDate}
                        helperText={formErrors.startDate}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                        error={!!formErrors.endDate}
                        helperText={formErrors.endDate}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                        error={!!formErrors.budget}
                        helperText={formErrors.budget}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
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
                        <Box
                          key={index}
                          display="flex"
                          gap={2}
                          mb={2}
                          alignItems="center"
                        >
                          <TextField
                            label="Field Label"
                            value={field.label}
                            sx={{ flexGrow: 1 }}
                            onChange={(e) =>
                              handleCustomFieldChange(
                                index,
                                "label",
                                e.target.value
                              )
                            }
                          />
                          <TextField
                            label="Field Value"
                            value={field.value}
                            sx={{ flexGrow: 1 }}
                            onChange={(e) =>
                              handleCustomFieldChange(
                                index,
                                "value",
                                e.target.value
                              )
                            }
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
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
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
                    sx={{ mb: 2 }}
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
                        <Box
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          sx={{ display: "grid", gap: 2 }}
                        >
                          {currentItinerary.activities.map(
                            (activity, index) => (
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
                                    sx={{ p: 2 }}
                                  >
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
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
                                      <Grid item xs={12} sm={6}>
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
                                      <Grid item xs={12} sm={6}>
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
                                      <Grid item xs={12} sm={6}>
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
                                      <Grid item xs={12} sm={6}>
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
                                      <Grid item xs={12} sm={6}>
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
                                        sx={{ textAlign: "right" }}
                                      >
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            handleDeleteItem(
                                              "activities",
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
                        </Box>
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
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        Budget Overview
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      sx={{ display: "flex", alignItems: "center" }}
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
                        sx={{ mb: 2 }}
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
                            <Box
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{ display: "grid", gap: 2 }}
                            >
                              {currentItinerary.expenses.map(
                                (expense, index) => (
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
                                        sx={{ p: 2 }}
                                      >
                                        <Grid container spacing={2}>
                                          <Grid item xs={12} sm={6}>
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
                                          <Grid item xs={12} sm={6}>
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
                                          <Grid item xs={12} sm={6}>
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
                                          <Grid item xs={12} sm={6}>
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
                                            sx={{ textAlign: "right" }}
                                          >
                                            <IconButton
                                              color="error"
                                              onClick={() =>
                                                handleDeleteItem(
                                                  "expenses",
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
                            </Box>
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
                        sx={{ mb: 2 }}
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
                            <Box
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{ display: "grid", gap: 2 }}
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
                                        sx={{ p: 2 }}
                                      >
                                        <Grid container spacing={2}>
                                          <Grid item xs={12} sm={6}>
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
                                          <Grid item xs={12} sm={6}>
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
                                          <Grid item xs={12} sm={6}>
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
                                          <Grid item xs={12} sm={6}>
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
                                            sx={{ textAlign: "right" }}
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
                            </Box>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
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
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default ItineraryPlanner;
