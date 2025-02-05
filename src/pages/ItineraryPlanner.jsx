import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
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
} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    customFields: [],
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleAddItinerary = () => {
    if (currentItinerary.title) {
      if (editIndex !== null) {
        // Update existing itinerary
        const updatedItineraries = [...itineraries];
        updatedItineraries[editIndex] = currentItinerary;
        setItineraries(updatedItineraries);
        setEditIndex(null);
      } else {
        // Add new itinerary
        setItineraries([...itineraries, currentItinerary]);
      }
      resetModal();
    }
  };

  const handleDeleteItinerary = (index) => {
    const newItineraries = itineraries.filter((_, i) => i !== index);
    setItineraries(newItineraries);
  };

  const handleEditItinerary = (index) => {
    setCurrentItinerary(itineraries[index]);
    setEditIndex(index);
    setOpenModal(true);
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
      customFields: [],
    });
    setEditIndex(null);
  };

  const handleAddCustomField = () => {
    setCurrentItinerary({
      ...currentItinerary,
      customFields: [
        ...currentItinerary.customFields,
        { label: "", value: "" },
      ],
    });
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomFields = [...currentItinerary.customFields];
    updatedCustomFields[index][field] = value;
    setCurrentItinerary({
      ...currentItinerary,
      customFields: updatedCustomFields,
    });
  };

  const removeCustomField = (index) => {
    const updatedCustomFields = currentItinerary.customFields.filter(
      (_, i) => i !== index
    );
    setCurrentItinerary({
      ...currentItinerary,
      customFields: updatedCustomFields,
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItineraries = Array.from(itineraries);
    const [reorderedItem] = reorderedItineraries.splice(result.source.index, 1);
    reorderedItineraries.splice(result.destination.index, 0, reorderedItem);
    setItineraries(reorderedItineraries);
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Itinerary Planner
          </h1>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            className="mb-4"
          >
            Add New Itinerary
          </Button>

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

          {/* Itinerary Modal */}
          <Dialog open={openModal} onClose={resetModal} maxWidth="md" fullWidth>
            <DialogTitle>
              {editIndex !== null ? "Edit Itinerary" : "Create New Itinerary"}
            </DialogTitle>
            <DialogContent>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  required
                  label="Title"
                  fullWidth
                  value={currentItinerary.title}
                  onChange={(e) =>
                    setCurrentItinerary({
                      ...currentItinerary,
                      title: e.target.value,
                    })
                  }
                  margin="normal"
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={currentItinerary.description}
                  onChange={(e) =>
                    setCurrentItinerary({
                      ...currentItinerary,
                      description: e.target.value,
                    })
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
                    setCurrentItinerary({
                      ...currentItinerary,
                      startDate: e.target.value,
                    })
                  }
                  margin="normal"
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={currentItinerary.endDate}
                  onChange={(e) =>
                    setCurrentItinerary({
                      ...currentItinerary,
                      endDate: e.target.value,
                    })
                  }
                  margin="normal"
                />
                <TextField
                  label="Budget"
                  type="number"
                  fullWidth
                  value={currentItinerary.budget}
                  onChange={(e) =>
                    setCurrentItinerary({
                      ...currentItinerary,
                      budget: e.target.value,
                    })
                  }
                  margin="normal"
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
                      setCurrentItinerary({
                        ...currentItinerary,
                        transportation: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="flight">Flight</MenuItem>
                    <MenuItem value="train">Train</MenuItem>
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
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
                          handleCustomFieldChange(
                            index,
                            "label",
                            e.target.value
                          )
                        }
                        className="flex-grow"
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
              </div>
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
