import { useState, useCallback } from "react";
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
  Visibility as VisibilityIcon, // Import the visibility icon
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
} from "@mui/material";

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
  const [formErrors, setFormErrors] = useState({}); // State for form errors
  const [viewItineraryIndex, setViewItineraryIndex] = useState(null); // new state for viewing itinerary

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
    if (itinerary.startDate && itinerary.endDate && itinerary.startDate > itinerary.endDate) {
      errors.endDate = "End Date must be after Start Date";
    }
    if (isNaN(parseFloat(itinerary.budget)) || parseFloat(itinerary.budget) <= 0) {
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
    setCurrentItinerary({ ...itineraries[index] }); // Create a copy to avoid direct mutation
    setEditIndex(index);
    setOpenModal(true);
    setFormErrors({}); // Clear errors when editing
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
    setFormErrors({}); // Clear form errors
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

    setCurrentItinerary((prev) => ({ ...prev, customFields: updatedCustomFields }));
  };

  const removeCustomField = (index) => {
    const updatedCustomFields = currentItinerary.customFields.filter((_, i) => i !== index);
    setCurrentItinerary((prev) => ({ ...prev, customFields: updatedCustomFields }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItineraries = Array.from(itineraries);
    const [reorderedItem] = reorderedItineraries.splice(result.source.index, 1);
    reorderedItineraries.splice(result.destination.index, 0, reorderedItem);
    setItineraries(reorderedItineraries);
  };

  // Generic input change handler for activities, expenses, and reminders
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
        { title: "", time: "", type: "sightseeing", cost: "", notes: "", location: "" },
      ],
    }));
  };

  const handleAddExpense = () => {
    setCurrentItinerary((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { item: "", amount: "", category: "transportation", date: "" }],
    }));
  };

  const handleAddReminder = () => {
    setCurrentItinerary((prev) => ({
      ...prev,
      reminders: [...prev.reminders, { title: "", date: "", time: "", type: "activity" }],
    }));
  };

  const handleDeleteItem = (tab, index) => {
    setCurrentItinerary((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((_, i) => i !== index),
    }));
  };

  const handleAddCollaborator = () => {
    if (newCollaboratorEmail && !currentItinerary.collaborators.includes(newCollaboratorEmail) && isValidEmail(newCollaboratorEmail)) {
      setCurrentItinerary((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, newCollaboratorEmail],
      }));
      setNewCollaboratorEmail(""); // Clear the input
    } else if (newCollaboratorEmail && currentItinerary.collaborators.includes(newCollaboratorEmail)) {
      alert("Collaborator already added");
    } else if (newCollaboratorEmail && !isValidEmail(newCollaboratorEmail)) {
      alert("Please enter a valid email.");
    }
  };

  const handleRemoveCollaborator = (index) => {
    const newCollaborators = currentItinerary.collaborators.filter((_, i) => i !== index);
    setCurrentItinerary((prev) => ({ ...prev, collaborators: newCollaborators }));
  };

  // Drag and drop handlers for activity, expense, and reminder modal

  const handleDragEndModal = (tab, result) => {
    if (!result.destination) return;

    const items = [...currentItinerary[tab]];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCurrentItinerary((prev) => ({ ...prev, [tab]: items }));
  };

  // Function to handle viewing an itinerary
  const handleViewItinerary = (index) => {
    setViewItineraryIndex(index);
  };

  // Function to close the itinerary view
  const handleCloseViewItinerary = () => {
    setViewItineraryIndex(null);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Itinerary Planner</h1>
            <div className="space-x-2 flex gap-2">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
              >
                New Itinerary
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Download Plans
              </Button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="itineraries">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {itineraries.map((itinerary, index) => (
                    <Draggable
                      key={`${itinerary.title}-${index}`}
                      draggableId={`${itinerary.title}-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <h2 className="text-xl font-semibold">
                              {itinerary.title}
                            </h2>
                            <p className="text-gray-600">
                              {itinerary.startDate} - {itinerary.endDate}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewItinerary(index)} // Open view dialog
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditItinerary(index)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteItinerary(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

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
                  <Typography variant="h6">
                    {itineraries[viewItineraryIndex].title}
                  </Typography>
                  <Typography variant="subtitle1">
                    {itineraries[viewItineraryIndex].startDate} - {itineraries[viewItineraryIndex].endDate}
                  </Typography>
                  <Typography variant="body1">
                    {itineraries[viewItineraryIndex].description}
                  </Typography>
                  <Typography variant="h6">Activities</Typography>
                  {itineraries[viewItineraryIndex].activities.map((activity, index) => (
                    <div key={index}>
                      <Typography variant="subtitle2">{activity.title}</Typography>
                      <Typography variant="body2">
                        {activity.time} - {activity.location}
                      </Typography>
                    </div>
                  ))}
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
              >
                <Tab label="Basic Info" />
                <Tab label="Activities" />
                <Tab label="Expenses" />
                <Tab label="Reminders" />
                <Tab label="Sharing" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    required
                    label="Title"
                    fullWidth
                    value={currentItinerary.title}
                    onChange={(e) =>
                      setCurrentItinerary((prev) => ({ ...prev, title: e.target.value }))
                    }
                    margin="normal"
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                  />
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
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={currentItinerary.startDate}
                    onChange={(e) =>
                      setCurrentItinerary((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    margin="normal"
                    error={!!formErrors.startDate}
                    helperText={formErrors.startDate}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={currentItinerary.endDate}
                    onChange={(e) =>
                      setCurrentItinerary((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    margin="normal"
                    error={!!formErrors.endDate}
                    helperText={formErrors.endDate}
                  />
                  <TextField
                    label="Budget"
                    type="number"
                    fullWidth
                    value={currentItinerary.budget}
                    onChange={(e) =>
                      setCurrentItinerary((prev) => ({ ...prev, budget: e.target.value }))
                    }
                    margin="normal"
                    error={!!formErrors.budget}
                    helperText={formErrors.budget}
                  />
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

                  {/* Custom Fields Section */}
                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Custom Fields</h3>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddCustomField}
                      >
                        Add Field
                      </Button>
                    </div>
                    {currentItinerary.customFields.map((field, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <TextField
                          label="Field Label"
                          value={field.label}
                          onChange={(e) =>
                            handleCustomFieldChange(index, "label", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <TextField
                          label="Field Value"
                          value={field.value}
                          onChange={(e) =>
                            handleCustomFieldChange(index, "value", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeCustomField(index)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </div>
                    ))}
                  </div>

                  <TextField
                    required
                    label="Location"
                    fullWidth
                    value={currentItinerary.location}
                    onChange={(e) =>
                      setCurrentItinerary((prev) => ({ ...prev, location: e.target.value }))
                    }
                    error={!!formErrors.location}
                    helperText={formErrors.location}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={currentItinerary.category}
                      label="Category"
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({ ...prev, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
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
                <DragDropContext onDragEnd={(result) => handleDragEndModal("activities", result)}>
                  <Droppable droppableId="activities">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {currentItinerary.activities.map((activity, index) => (
                          <Draggable key={index} draggableId={`activity-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="grid grid-cols-2 gap-4 mb-4 p-4 border rounded"
                              >
                                <TextField
                                  label="Activity Title"
                                  fullWidth
                                  value={activity.title}
                                  onChange={(e) =>
                                    handleInputChange("activities", index, "title", e.target.value)
                                  }
                                />
                                <TextField
                                  label="Location"
                                  fullWidth
                                  value={activity.location}
                                  onChange={(e) =>
                                    handleInputChange("activities", index, "location", e.target.value)
                                  }
                                />
                                <TextField
                                  label="Time"
                                  type="time"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  value={activity.time}
                                  onChange={(e) =>
                                    handleInputChange("activities", index, "time", e.target.value)
                                  }
                                />
                                <FormControl fullWidth>
                                  <InputLabel>Type</InputLabel>
                                  <Select
                                    value={activity.type}
                                    label="Type"
                                    onChange={(e) =>
                                      handleInputChange("activities", index, "type", e.target.value)
                                    }
                                  >
                                    {ACTIVITY_TYPES.map((type) => (
                                      <MenuItem key={type} value={type}>
                                        {type}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  label="Cost"
                                  type="number"
                                  fullWidth
                                  value={activity.cost}
                                  onChange={(e) =>
                                    handleInputChange("activities", index, "cost", e.target.value)
                                  }
                                />
                                <TextField
                                  label="Notes"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  value={activity.notes}
                                  onChange={(e) =>
                                    handleInputChange("activities", index, "notes", e.target.value)
                                  }
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteItem("activities", index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </div>
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
                <div className="mb-4">
                  <Typography variant="h6" className="mb-2">
                    Budget Overview
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      label="Total Budget"
                      type="number"
                      fullWidth
                      value={currentItinerary.budget}
                      onChange={(e) =>
                        setCurrentItinerary((prev) => ({ ...prev, budget: e.target.value }))
                      }
                    />
                    <Typography variant="body1" className="flex items-center">
                      Remaining: ${calculateRemaining()}
                    </Typography>
                  </div>
                </div>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddExpense}
                  className="mb-4"
                >
                  Add Expense
                </Button>
                <DragDropContext onDragEnd={(result) => handleDragEndModal("expenses", result)}>
                  <Droppable droppableId="expenses">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {currentItinerary.expenses.map((expense, index) => (
                          <Draggable key={index} draggableId={`expense-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="grid grid-cols-2 gap-4 mb-4 p-4 border rounded"
                              >
                                <TextField
                                  label="Item"
                                  fullWidth
                                  value={expense.item}
                                  onChange={(e) =>
                                    handleInputChange("expenses", index, "item", e.target.value)
                                  }
                                />
                                <TextField
                                  label="Amount"
                                  type="number"
                                  fullWidth
                                  value={expense.amount}
                                  onChange={(e) =>
                                    handleInputChange("expenses", index, "amount", e.target.value)
                                  }
                                />
                                <FormControl fullWidth>
                                  <InputLabel>Category</InputLabel>
                                  <Select
                                    value={expense.category}
                                    label="Category"
                                    onChange={(e) =>
                                      handleInputChange("expenses", index, "category", e.target.value)
                                    }
                                  >
                                    {EXPENSE_CATEGORIES.map((category) => (
                                      <MenuItem key={category} value={category}>
                                        {category}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  label="Date"
                                  type="date"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  value={expense.date}
                                  onChange={(e) =>
                                    handleInputChange("expenses", index, "date", e.target.value)
                                  }
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteItem("expenses", index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddReminder}
                  className="mb-4"
                >
                  Add Reminder
                </Button>

                <DragDropContext onDragEnd={(result) => handleDragEndModal("reminders", result)}>
                  <Droppable droppableId="reminders">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {currentItinerary.reminders.map((reminder, index) => (
                          <Draggable key={index} draggableId={`reminder-${index}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="grid grid-cols-2 gap-4 mb-4 p-4 border rounded"
                              >
                                <TextField
                                  label="Reminder Title"
                                  fullWidth
                                  value={reminder.title}
                                  onChange={(e) =>
                                    handleInputChange("reminders", index, "title", e.target.value)
                                  }
                                />
                                <FormControl fullWidth>
                                  <InputLabel>Type</InputLabel>
                                  <Select
                                    value={reminder.type}
                                    label="Type"
                                    onChange={(e) =>
                                      handleInputChange("reminders", index, "type", e.target.value)
                                    }
                                  >
                                    {REMINDER_TYPES.map((type) => (
                                      <MenuItem key={type} value={type}>
                                        {type}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  label="Date"
                                  type="date"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  value={reminder.date}
                                  onChange={(e) =>
                                    handleInputChange("reminders", index, "date", e.target.value)
                                  }
                                />
                                <TextField
                                  label="Time"
                                  type="time"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  value={reminder.time}
                                  onChange={(e) =>
                                    handleInputChange("reminders", index, "time", e.target.value)
                                  }
                                />
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteItem("reminders", index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabPanel>

              <TabPanel value={activeTab} index={4}>
                <div className="space-y-4">
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

                  {currentItinerary.isCollaborative && (
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        label="Add Collaborator Email"
                        fullWidth
                        placeholder="Enter email address"
                        value={newCollaboratorEmail}
                        onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                      />
                      <Button variant="contained" startIcon={<ShareIcon />} onClick={handleAddCollaborator}>
                        Add Collaborator
                      </Button>
                    </div>
                  )}

                  {currentItinerary.collaborators.length > 0 && (
                    <div className="mt-4">
                      <Typography variant="subtitle1" className="mb-2">
                        Current Collaborators
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        {currentItinerary.collaborators.map((collaborator, index) => (
                          <Chip
                            key={index}
                            label={collaborator}
                            onDelete={() => handleRemoveCollaborator(index)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItineraryPlanner;