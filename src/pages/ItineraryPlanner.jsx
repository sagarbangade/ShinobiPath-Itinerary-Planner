import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
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
  FilterList as FilterListIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  PinDrop as PinDropIcon,
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
  List, // <-- ADD List HERE
  ListItem, // <-- ADD ListItem HERE
  ListItemText, // <-- ADD ListItemText HERE
} from "@mui/material";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

//Firebase
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig"; // Import your Firebase config
import { v4 as uuidv4 } from "uuid";
// import ItineraryMap from "../components/ItineraryMap";
import BudgetChart from "../components/BudgetChart";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

const CATEGORIES = ["leisure", "adventure", "cultural", "other"];
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
const ACTIVITY_TYPES = [
  "sightseeing",
  "dining",
  "relaxation",
  "adventure",
  "other",
];

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ItineraryPlanner = () => {
  const [userItineraries, setUserItineraries] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    destinations: [],
    customFields: [],
    category: "leisure",
    isCollaborative: false,
    collaborators: [],
  });
  const [editItineraryId, setEditItineraryId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [viewItineraryId, setViewItineraryId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [plansForSelectedDate, setPlansForSelectedDate] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const isFilterMenuOpen = Boolean(filterAnchorEl);
  const [loading, setLoading] = useState(false);

  const getItinerariesCollection = useCallback(() => {
    if (!auth.currentUser) {
      return null;
    }
    return collection(db, "users", auth.currentUser.uid, "itineraries");
  }, []);

  const getUserIdByEmail = useCallback(async (email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error("Error getting user ID by email:", error);
      return null;
    }
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
        // Directly fetch itinerary data from the path stored in sharedItineraries
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
      // Combine and remove potential duplicates based on itinerary ID
      const allItineraries = [...ownedItineraries, ...sharedItineraries];
      const uniqueItineraries = Array.from(
        new Map(allItineraries.map((item) => [item.id, item])).values()
      ); // Deduplicate by ID
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

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      const plans = userItineraries.filter(
        (itinerary) =>
          itinerary.destinations.some(
            (destination) =>
              moment(destination.startDate).format("YYYY-MM-DD") <=
                formattedDate &&
              moment(destination.endDate).format("YYYY-MM-DD") >= formattedDate
          ) &&
          (categoryFilter === "" || itinerary.category === categoryFilter)
      );
      setPlansForSelectedDate(plans);
    } else {
      setPlansForSelectedDate([]);
    }
  }, [selectedDate, userItineraries, categoryFilter]);

  const handleAddItinerary = async () => {
    console.log("auth.currentUser:", auth.currentUser);
    const errors = validateForm(currentItinerary);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setLoading(true);

      try {
        if (editItineraryId) {
          // --- UPDATE ---
          const sharedItineraryRef = collection(db, "sharedItineraries");
          const sharedQuery = query(
            sharedItineraryRef,
            where("itineraryId", "==", editItineraryId)
          );
          const sharedSnapshot = await getDocs(sharedQuery);
          let ownerId;
          let isSharedItinerary = false;
          let sharedDocRef;

          if (!sharedSnapshot.empty) {
            const sharedDoc = sharedSnapshot.docs[0];
            sharedDocRef = sharedDoc.ref;
            const sharedData = sharedDoc.data();
            ownerId = sharedData.ownerId;
            isSharedItinerary = true;

            if (
              ownerId !== auth.currentUser.uid &&
              !sharedData.collaborators.includes(auth.currentUser.uid)
            ) {
              alert("You don't have permission to edit this shared itinerary.");
              setLoading(false);
              return;
            }

            const collaboratorUids = await Promise.all(
              currentItinerary.collaborators.map((email) =>
                getUserIdByEmail(email)
              )
            );
            const validCollaboratorUids = collaboratorUids.filter(
              (uid) => uid !== null
            );
            await updateDoc(sharedDocRef, {
              collaborators: validCollaboratorUids,
            }); // Update shared doc collaborators
          } else {
            ownerId = auth.currentUser.uid; // If not shared, owner is current user
          }

          const itineraryDocRef = doc(
            db,
            "users",
            ownerId,
            "itineraries",
            editItineraryId
          );
          await updateDoc(itineraryDocRef, currentItinerary);
        } else {
          // --- CREATE ---
          const itinerariesCollection = getItinerariesCollection();
          if (!itinerariesCollection) return;

          const newItinerary = {
            ...currentItinerary,
            destinations: currentItinerary.destinations.map((destination) => ({
              ...destination,
              id: uuidv4(),
              activities: (destination.activities || []).map((activity) => ({
                ...activity,
                id: uuidv4(),
              })),
              expenses: (destination.expenses || []).map((expense) => ({
                ...expense,
                id: uuidv4(),
              })),
              reminders: (destination.reminders || []).map((reminder) => ({
                ...reminder,
                id: uuidv4(),
              })),
            })),
          };

          const docRef = await addDoc(itinerariesCollection, newItinerary);
          const sharedItinerariesRef = collection(db, "sharedItineraries");
          await setDoc(doc(sharedItinerariesRef, docRef.id), {
            itineraryId: docRef.id,
            ownerId: auth.currentUser.uid,
            collaborators: [auth.currentUser.uid], // Owner is initial collaborator
          });
        }

        resetModal();
        await fetchAllItineraries();
      } catch (error) {
        console.error("Error saving itinerary:", error);
        alert("Error saving itinerary: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = (itinerary) => {
    const errors = {};
    if (!itinerary.title) errors.title = "Title is required";
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

  const handleDeleteItinerary = async (itineraryId) => {
    console.log("handleDeleteItinerary - itineraryId:", itineraryId); // Log itinerary ID
    console.log(
      "handleDeleteItinerary - itinerariesCollection path (getItinerariesCollection()):",
      getItinerariesCollection()?.path
    ); // Log collection path
    console.log(
      "handleDeleteItinerary - auth.currentUser.uid:",
      auth.currentUser.uid
    ); // Log user UID
    setLoading(true);
    try {
      const sharedItineraryRef = collection(db, "sharedItineraries");
      const sharedQuery = query(
        sharedItineraryRef,
        where("itineraryId", "==", itineraryId)
      );
      const sharedSnapshot = await getDocs(sharedQuery);
      let ownerId = auth.currentUser.uid; // Default to current user if not shared.

      if (!sharedSnapshot.empty) {
        const sharedDoc = sharedSnapshot.docs[0];
        const sharedData = sharedDoc.data();
        ownerId = sharedData.ownerId; // Get actual owner id from shared doc

        if (sharedData.ownerId !== auth.currentUser.uid) {
          alert("Only the owner can delete this shared itinerary.");
          setLoading(false);
          return;
        }
        await deleteDoc(doc(db, "sharedItineraries", sharedDoc.id)); // Delete shared doc
      }

      await deleteDoc(doc(db, "users", ownerId, "itineraries", itineraryId)); // Delete itinerary doc

      await fetchAllItineraries();
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      alert("Error deleting itinerary: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItinerary = async (itinerary) => {
    console.log("handleEditItinerary - itinerary.id:", itinerary.id); // Log itinerary ID
    console.log(
      "handleEditItinerary - itinerariesCollection path (getItinerariesCollection()):",
      getItinerariesCollection()?.path
    ); // Log collection path
    console.log(
      "handleEditItinerary - auth.currentUser.uid:",
      auth.currentUser.uid
    ); // Log user UID
    setLoading(true);
    try {
      const deepCopiedItinerary = JSON.parse(JSON.stringify(itinerary));
      if (itinerary.isShared) {
        const sharedItineraryRef = collection(db, "sharedItineraries");
        const sharedQuery = query(
          sharedItineraryRef,
          where("itineraryId", "==", itinerary.id)
        );
        const sharedSnapshot = await getDocs(sharedQuery);
        if (!sharedSnapshot.empty) {
          const sharedDoc = sharedSnapshot.docs[0];
          const sharedData = sharedDoc.data();
          if (
            sharedData.ownerId !== itinerary.ownerId &&
            !sharedData.collaborators.includes(auth.currentUser.uid)
          ) {
            alert("You do not have permission to edit this shared itinerary.");
            setLoading(false);
            return;
          }
          const collaboratorEmails = await Promise.all(
            sharedData.collaborators.map((uid) => {
              return getDoc(doc(db, "users", uid)).then((userSnap) =>
                userSnap.exists() ? userSnap.data().email : null
              );
            })
          );
          deepCopiedItinerary.collaborators = collaboratorEmails.filter(
            (email) => email != null
          );
        }
      }

      setCurrentItinerary(deepCopiedItinerary);
      setEditItineraryId(itinerary.id);
      setOpenModal(true);
      setFormErrors({});
    } catch (error) {
      console.error("Error preparing to edit itinerary:", error);
      alert("Error preparing to edit itinerary: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setOpenModal(false);
    setCurrentItinerary({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      destinations: [],
      customFields: [],
      category: "leisure",
      isCollaborative: false,
      collaborators: [],
    });
    setEditItineraryId(null);
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

    const { source, destination } = result;

    if (source.droppableId === "destinations") {
      setCurrentItinerary((prev) => {
        const reorderedDestinations = [...prev.destinations];
        const [movedDestination] = reorderedDestinations.splice(
          source.index,
          1
        );
        reorderedDestinations.splice(destination.index, 0, movedDestination);
        return { ...prev, destinations: reorderedDestinations };
      });
    }

    if (source.droppableId.startsWith("destination-")) {
      const [, destinationIndexStr, type] = source.droppableId.split("-");
      const destinationIndex = parseInt(destinationIndexStr, 10);

      setCurrentItinerary((prev) => {
        const updatedDestinations = [...prev.destinations];
        const items = [
          ...(updatedDestinations[destinationIndex][`${type}s`] || []),
        ];

        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        updatedDestinations[destinationIndex] = {
          ...updatedDestinations[destinationIndex],
          [`${type}s`]: items,
        };
        return { ...prev, destinations: updatedDestinations };
      });
    }

    if (source.droppableId === "itineraries") {
      const reorderedItineraries = Array.from(userItineraries);
      const [reorderedItem] = reorderedItineraries.splice(source.index, 1);
      reorderedItineraries.splice(destination.index, 0, reorderedItem);
      setUserItineraries(reorderedItineraries);
    }
  };

  const handleInputChange = (destinationIndex, tab, index, field, value) => {
    setCurrentItinerary((prev) => {
      const updatedDestinations = [...prev.destinations];
      const destination = updatedDestinations[destinationIndex];
      const updatedTabItems = [...(destination[tab] || [])];

      let updatedValue = value;
      if (
        (tab === "activities" && field === "cost") ||
        (tab === "expenses" && field === "amount")
      ) {
        updatedValue = isNaN(parseFloat(value)) ? "" : parseFloat(value);
      }

      updatedTabItems[index] = {
        ...updatedTabItems[index],
        [field]: updatedValue,
      };

      updatedDestinations[destinationIndex] = {
        ...destination,
        [tab]: updatedTabItems,
      };

      return { ...prev, destinations: updatedDestinations };
    });
  };

  const handleAddDestination = () => {
    setCurrentItinerary((prev) => ({
      ...prev,
      destinations: [
        ...prev.destinations,
        {
          id: uuidv4(),
          name: "",
          startDate: "",
          endDate: "",
          activities: [],
          expenses: [],
          reminders: [],
          activeSubTab: 0,
        },
      ],
    }));
  };

  const handleAddActivity = (destinationIndex) => {
    setCurrentItinerary((prev) => {
      const updatedDestinations = [...prev.destinations];
      const newActivity = {
        id: uuidv4(),
        title: "",
        time: "",
        date: "",
        type: "sightseeing",
        cost: "",
        notes: "",
      };
      updatedDestinations[destinationIndex] = {
        ...updatedDestinations[destinationIndex],
        activities: [
          ...(updatedDestinations[destinationIndex].activities || []),
          newActivity,
        ],
      };
      return { ...prev, destinations: updatedDestinations };
    });
  };

  const handleAddExpense = (destinationIndex) => {
    setCurrentItinerary((prev) => {
      const updatedDestinations = [...prev.destinations];
      const newExpense = {
        id: uuidv4(),
        item: "",
        amount: "",
        category: "transportation",
        date: "",
        time: "",
      };
      updatedDestinations[destinationIndex] = {
        ...updatedDestinations[destinationIndex],
        expenses: [
          ...(updatedDestinations[destinationIndex].expenses || []),
          newExpense,
        ],
      };
      return { ...prev, destinations: updatedDestinations };
    });
  };

  const handleAddReminder = (destinationIndex) => {
    setCurrentItinerary((prev) => {
      const updatedDestinations = [...prev.destinations];
      const newReminder = {
        id: uuidv4(),
        title: "",
        date: "",
        time: "",
        type: "activity",
      };
      updatedDestinations[destinationIndex] = {
        ...updatedDestinations[destinationIndex],
        reminders: [
          ...(updatedDestinations[destinationIndex].reminders || []),
          newReminder,
        ],
      };
      return { ...prev, destinations: updatedDestinations };
    });
  };

  const handleDeleteDestination = (destinationIndex) => {
    console.log("auth.currentUser:", auth.currentUser);
    setCurrentItinerary((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== destinationIndex),
    }));
  };

  const handleDeleteItem = (destinationIndex, tab, index) => {
    setCurrentItinerary((prev) => {
      const updatedDestinations = [...prev.destinations];
      updatedDestinations[destinationIndex] = {
        ...updatedDestinations[destinationIndex],
        [tab]: updatedDestinations[destinationIndex][tab].filter(
          (_, i) => i !== index
        ),
      };
      return { ...prev, destinations: updatedDestinations };
    });
  };

  const handleAddCollaborator = async () => {
    console.log("auth.currentUser:", auth.currentUser);
    console.log("handleAddCollaborator - editItineraryId:", editItineraryId); // Log itinerary ID
    // console.log("handleAddCollaborator - sharedItinerariesRef path:", sharedItinerariesRef.path); // Log collection path
    console.log(
      "handleAddCollaborator - auth.currentUser.uid:",
      auth.currentUser.uid
    ); // Log user UID
    if (!newCollaboratorEmail) {
      alert("Please enter an email address.");
      return;
    }
    if (!isValidEmail(newCollaboratorEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (newCollaboratorEmail === auth.currentUser.email) {
      alert("You cannot add yourself as a collaborator.");
      return;
    }

    setLoading(true);
    try {
      const collaboratorUid = await getUserIdByEmail(newCollaboratorEmail);
      if (!collaboratorUid) {
        alert("No user found with that email address.");
        setLoading(false);
        return;
      }

      const sharedItinerariesRef = collection(db, "sharedItineraries");
      const sharedDocQuery = query(
        sharedItinerariesRef,
        where("itineraryId", "==", editItineraryId)
      );
      const sharedDocSnapshot = await getDocs(sharedDocQuery);

      if (sharedDocSnapshot.empty) {
        alert("Itinerary sharing information not found.");
        setLoading(false);
        return;
      }

      const sharedDoc = sharedDocSnapshot.docs[0];
      const sharedData = sharedDoc.data();

      if (auth.currentUser.uid !== sharedData.ownerId) {
        alert("Only the owner can add collaborators.");
        setLoading(false);
        return;
      }
      if (sharedData.collaborators.includes(collaboratorUid)) {
        alert("User is already a collaborator.");
        setLoading(false);
        return;
      }

      const updatedCollaborators = [
        ...sharedData.collaborators,
        collaboratorUid,
      ];
      await updateDoc(sharedDoc.ref, { collaborators: updatedCollaborators });

      setCurrentItinerary((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, newCollaboratorEmail],
      }));
      setNewCollaboratorEmail("");
      alert("Collaborator added successfully!");
      await fetchAllItineraries();
    } catch (error) {
      console.error("Error adding collaborator:", error);
      alert("Error adding collaborator: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorEmail) => {
    setLoading(true);
    try {
      const collaboratorUid = await getUserIdByEmail(collaboratorEmail);
      if (!collaboratorUid) {
        alert("No user found with that email address.");
        setLoading(false);
        return;
      }

      const sharedItinerariesRef = collection(db, "sharedItineraries");
      const sharedDocQuery = query(
        sharedItinerariesRef,
        where("itineraryId", "==", editItineraryId)
      );
      const sharedDocSnapshot = await getDocs(sharedDocQuery);

      if (sharedDocSnapshot.empty) {
        console.log("Shared itinerary document not found.");
        setLoading(false);
        return;
      }
      const sharedDoc = sharedDocSnapshot.docs[0];
      const sharedData = sharedDoc.data();

      if (auth.currentUser.uid !== sharedData.ownerId) {
        alert("Only the owner can remove collaborators.");
        setLoading(false);
        return;
      }
      if (
        sharedData.collaborators.length <= 1 &&
        sharedData.collaborators.includes(collaboratorUid) &&
        sharedData.ownerId === auth.currentUser.uid
      ) {
        alert(
          "Owner cannot remove themselves if they are the only collaborator."
        );
        setLoading(false);
        return;
      }

      const updatedCollaborators = sharedData.collaborators.filter(
        (uid) => uid !== collaboratorUid
      );
      await updateDoc(sharedDoc.ref, { collaborators: updatedCollaborators });

      setCurrentItinerary((prev) => ({
        ...prev,
        collaborators: prev.collaborators.filter(
          (email) => email !== collaboratorEmail
        ),
      }));

      await fetchAllItineraries();
    } catch (error) {
      console.error("Error removing collaborator:", error);
      alert("Error removing collaborator: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItinerary = (itineraryId) => setViewItineraryId(itineraryId);
  const handleCloseViewItinerary = () => setViewItineraryId(null);
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

  const events = userItineraries.flatMap((itinerary) =>
    itinerary.destinations.map((destination) => ({
      title: `${itinerary.title} - ${destination.name}`,
      start: new Date(destination.startDate),
      end: new Date(destination.endDate),
    }))
  );
  const handleApplyFilter = () => handleFilterMenuClose();
  const handleClearFilter = () => {
    setCategoryFilter("");
    handleFilterMenuClose();
  };

  const filteredItineraries = userItineraries.filter(
    (itinerary) =>
      categoryFilter === "" || itinerary.category === categoryFilter
  );
  const handleDestinationChange = (index, field, value) => {
    setCurrentItinerary((prev) => {
      const updatedDestinations = [...prev.destinations];
      updatedDestinations[index] = {
        ...updatedDestinations[index],
        [field]: value,
      };
      return { ...prev, destinations: updatedDestinations };
    });
  };

  const handleItineraryInputChange = (field, value) => {
    setCurrentItinerary((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#f5f5f5",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Box sx={{ maxWidth: "1280px", mx: "auto" }}>
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
                    sx={{ bgcolor: "#ff6d12", color: "white" }}
                  >
                    New
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{ color: "#ff6d12", borderColor: "#ff6d12" }}
                  >
                    Download
                  </Button>

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
                          plansForSelectedDate.map((plan) =>
                            plan.destinations.map((destination, index) => (
                              <Card
                                key={`${plan.id}-${index}`}
                                elevation={2}
                                sx={{ mb: 1 }}
                              >
                                <CardContent>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {plan.title} - {destination.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    Location: {destination.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    {moment(destination.startDate).format("LL")}{" "}
                                    - {moment(destination.endDate).format("LL")}
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
                          )
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
                              key={itinerary.id}
                              draggableId={itinerary.id}
                              index={index}
                            >
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  elevation={4} // Slightly more pronounced elevation
                                  sx={{
                                    backgroundColor: "#fff", // Still white background for cleanliness
                                    border: "1px solid rgba(0, 0, 0, 0.1)", // Very light border
                                    borderRadius: "8px", // More rounded corners for a softer look
                                    boxShadow: "5px 5px 15px rgba(0,0,0,0.1)", // More noticeable shadow for depth
                                    overflow: "hidden", // Clip content for cleaner borders
                                    position: "relative", // For category banner positioning
                                  }}
                                >
                                  {/* Category Banner (Top Left Corner) */}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: "8px", // Height of the banner
                                      backgroundColor:
                                        itinerary.category === "leisure"
                                          ? "#a5d6a7" // Green banner
                                          : itinerary.category === "adventure"
                                          ? "#90caf9" // Blue banner
                                          : itinerary.category === "cultural"
                                          ? "#ffe0b2" // Orange banner
                                          : "#e0e0e0", // Grey banner default
                                    }}
                                  />

                                  <CardContent
                                    sx={{
                                      display: "flex",
                                      flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                      },
                                      justifyContent: "space-between",
                                      alignItems: {
                                        xs: "flex-start",
                                        sm: "center",
                                      },
                                      gap: { xs: 2, sm: 0 },
                                      padding: 3, // Slightly more padding inside
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: { xs: "100%", sm: "auto" },
                                        mb: { xs: 2, sm: 0 },
                                      }}
                                    >
                                      <Typography
                                        variant="h5" // Slightly larger title
                                        component="h2"
                                        sx={{
                                          fontWeight: "bold",
                                          color: "textPrimary",
                                          mb: 0.5,
                                        }}
                                      >
                                        {itinerary.title}
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          mb: 1,
                                        }}
                                      >
                                        {" "}
                                        {/* Box for Category + icon + spacing */}
                                        <ListItemIcon
                                          sx={{
                                            minWidth: "auto",
                                            mr: 0.5,
                                            color: "textSecondary",
                                          }}
                                        >
                                          {" "}
                                          {/* Icon styling */}
                                          {itinerary.category === "leisure" ? (
                                            <LabelIcon
                                              sx={{ fontSize: "1.2rem" }}
                                            />
                                          ) : itinerary.category ===
                                            "adventure" ? (
                                            <ShareIcon
                                              sx={{ fontSize: "1.2rem" }}
                                            />
                                          ) : itinerary.category ===
                                            "cultural" ? (
                                            <LabelIcon
                                              sx={{ fontSize: "1.2rem" }}
                                            />
                                          ) : (
                                            <LabelIcon
                                              sx={{ fontSize: "1.2rem" }}
                                            />
                                          )}
                                        </ListItemIcon>
                                        <Typography
                                          variant="subtitle1" // Subtitle1 for Category
                                          sx={{
                                            fontWeight: "semibold",
                                            color: "textSecondary",
                                          }}
                                        >
                                          {itinerary.category.toUpperCase()}
                                        </Typography>
                                        {itinerary.isCollaborative && (
                                          <Chip
                                            label="Collaborative"
                                            size="small"
                                            icon={
                                              <ShareIcon
                                                sx={{ fontSize: "1rem" }}
                                              />
                                            }
                                            sx={{
                                              ml: 1,
                                              backgroundColor:
                                                "rgba(0, 0, 0, 0.08)",
                                              color: "textSecondary",
                                            }}
                                          />
                                        )}
                                      </Box>

                                      <Typography
                                        variant="body2" // Body2 for Dates
                                        color="textSecondary"
                                        sx={{
                                          mt: 0,
                                          mb: 1,
                                          fontSize: "0.95rem",
                                        }} // Adjusted date styling
                                      >
                                        {moment(itinerary.startDate).format(
                                          "LL"
                                        )}{" "}
                                        -{" "}
                                        {moment(itinerary.endDate).format("LL")}
                                      </Typography>

                                      {itinerary.destinations.length > 0 && (
                                        <Box sx={{ mt: 1.5 }}>
                                          <Typography
                                            variant="overline" // Overline for "Destinations" label - small caps
                                            sx={{
                                              fontWeight: "bold",
                                              color: "grey",
                                              display: "block",
                                              mb: 0.5,
                                            }} // Block display and margin
                                          >
                                            Destinations
                                          </Typography>
                                          <List dense sx={{ py: 0 }}>
                                            {" "}
                                            {/* Using MUI List for cleaner vertical spacing */}
                                            {itinerary.destinations.map(
                                              (destination, index) => (
                                                <ListItem
                                                  key={index}
                                                  sx={{ py: 0.3 }}
                                                >
                                                  {" "}
                                                  {/* Reduced vertical padding in list item */}
                                                  <ListItemIcon
                                                    sx={{
                                                      minWidth: "auto",
                                                      mr: 1,
                                                      color: "grey",
                                                    }}
                                                  >
                                                    {" "}
                                                    {/* Map pin icon */}
                                                    <PinDropIcon
                                                      sx={{ fontSize: "1rem" }}
                                                    />
                                                  </ListItemIcon>
                                                  <ListItemText
                                                    primaryTypographyProps={{
                                                      variant: "body2",
                                                      color: "textPrimary",
                                                    }} // Body2 for destination names
                                                    primary={destination.name}
                                                  />
                                                </ListItem>
                                              )
                                            )}
                                          </List>
                                        </Box>
                                      )}
                                    </Box>
                                    <Box
                                      display="flex"
                                      sx={{
                                        flexDirection: {
                                          xs: "row",
                                          sm: "column",
                                        },
                                        alignItems: {
                                          xs: "center",
                                          sm: "flex-end",
                                        },
                                      }}
                                    >
                                      <Tooltip title="View Details">
                                        <IconButton
                                          color="primary"
                                          size="small"
                                          onClick={() =>
                                            handleViewItinerary(itinerary.id)
                                          }
                                        >
                                          <VisibilityIcon
                                            sx={{ fontSize: "1.3rem" }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Edit Itinerary">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleEditItinerary(itinerary)
                                          }
                                        >
                                          <EditIcon
                                            sx={{ fontSize: "1.3rem", color: "orange" }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete Itinerary">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleDeleteItinerary(itinerary.id)
                                          }
                                        >
                                          <DeleteIcon
                                            sx={{ fontSize: "1.3rem", color: "red" }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                      
                                      <Tooltip title="Download Itinerary">
                                        <IconButton
                                          size="small"
                                          // onClick={() =>
                                            
                                          // }
                                        >
                                          <DownloadIcon
                                            sx={{ fontSize: "1.3rem", color: "green" }}
                                          />
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
              open={viewItineraryId !== null}
              onClose={handleCloseViewItinerary}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Itinerary Details</DialogTitle>
              <DialogContent>
                {viewItineraryId !== null &&
                  userItineraries.find((it) => it.id === viewItineraryId) && (
                    <>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {
                          userItineraries.find(
                            (it) => it.id === viewItineraryId
                          ).title
                        }
                      </Typography>
                      <Typography variant="subtitle1">
                        {moment(
                          userItineraries.find(
                            (it) => it.id === viewItineraryId
                          ).startDate
                        ).format("LL")}{" "}
                        -{" "}
                        {moment(
                          userItineraries.find(
                            (it) => it.id === viewItineraryId
                          ).endDate
                        ).format("LL")}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {
                          userItineraries.find(
                            (it) => it.id === viewItineraryId
                          ).description
                        }
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ mt: 2, fontWeight: "bold" }}
                      >
                        Destinations
                      </Typography>
                      {userItineraries
                        .find((it) => it.id === viewItineraryId)
                        .destinations.map((destination, index) => (
                          <Card key={index} elevation={2} sx={{ mb: 1 }}>
                            <CardContent>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: "bold" }}
                              >
                                {destination.name}
                              </Typography>
                              <Typography variant="body2">
                                {moment(destination.startDate).format("LL")} -{" "}
                                {moment(destination.endDate).format("LL")}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      {/* <ItineraryMap
                        destinations={
                          userItineraries.find(
                            (it) => it.id === viewItineraryId
                          ).destinations
                        }
                      /> */}
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
                {editItineraryId ? "Edit Itinerary" : "Create New Itinerary"}
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
                  <Tab label="Destinations" />
                  <Tab label="Sharing" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  {/* Basic Info Form - Same as before */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        label="Title"
                        fullWidth
                        value={currentItinerary.title}
                        onChange={(e) =>
                          handleItineraryInputChange("title", e.target.value)
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
                          handleItineraryInputChange(
                            "description",
                            e.target.value
                          )
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
                          handleItineraryInputChange(
                            "startDate",
                            e.target.value
                          )
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
                          handleItineraryInputChange("endDate", e.target.value)
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
                          handleItineraryInputChange("budget", e.target.value)
                        }
                        error={!!formErrors.budget}
                        helperText={formErrors.budget}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={currentItinerary.category}
                          label="Category"
                          onChange={(e) =>
                            handleItineraryInputChange(
                              "category",
                              e.target.value
                            )
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
                  </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  {/* Destinations Tab - Same as before */}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddDestination}
                    sx={{ mb: 2 }}
                  >
                    Add Destination
                  </Button>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="destinations">
                      {(provided) => (
                        <Box
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {currentItinerary.destinations.map(
                            (destination, destinationIndex) => (
                              <Draggable
                                key={destination.id}
                                draggableId={destination.id}
                                index={destinationIndex}
                              >
                                {(provided) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    elevation={2}
                                    sx={{ p: 2, mb: 2 }}
                                  >
                                    <Box
                                      {...provided.dragHandleProps}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 1,
                                      }}
                                    >
                                      <Typography variant="h6">
                                        Destination {destinationIndex + 1}
                                      </Typography>
                                      <IconButton
                                        color="error"
                                        onClick={() =>
                                          handleDeleteDestination(
                                            destinationIndex
                                          )
                                        }
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Destination Name"
                                          fullWidth
                                          value={destination.name}
                                          onChange={(e) =>
                                            handleDestinationChange(
                                              destinationIndex,
                                              "name",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="Start Date"
                                          type="date"
                                          fullWidth
                                          InputLabelProps={{ shrink: true }}
                                          value={destination.startDate}
                                          onChange={(e) =>
                                            handleDestinationChange(
                                              destinationIndex,
                                              "startDate",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          label="End Date"
                                          type="date"
                                          fullWidth
                                          InputLabelProps={{ shrink: true }}
                                          value={destination.endDate}
                                          onChange={(e) =>
                                            handleDestinationChange(
                                              destinationIndex,
                                              "endDate",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </Grid>

                                      <Grid item xs={12}>
                                        <Tabs
                                          value={destination.activeSubTab || 0}
                                          onChange={(e, newValue) =>
                                            handleDestinationChange(
                                              destinationIndex,
                                              "activeSubTab",
                                              newValue
                                            )
                                          }
                                          variant="scrollable"
                                          scrollButtons="auto"
                                          allowScrollButtonsMobile
                                          sx={{ mb: 2 }}
                                        >
                                          <Tab label="Activities" />
                                          <Tab label="Expenses" />
                                          <Tab label="Reminders" />
                                        </Tabs>
                                      </Grid>

                                      <Grid item xs={12}>
                                        {destination.activeSubTab ===
                                          0 /* Activities Panel - Same as before */ && (
                                          <Box sx={{ mb: 2 }}>
                                            <Button
                                              variant="outlined"
                                              onClick={() =>
                                                handleAddActivity(
                                                  destinationIndex
                                                )
                                              }
                                              startIcon={<AddIcon />}
                                            >
                                              Add Activity
                                            </Button>
                                            <Droppable
                                              droppableId={`destination-${destinationIndex}-activity`}
                                            >
                                              {(provided) => (
                                                <Box
                                                  {...provided.droppableProps}
                                                  ref={provided.innerRef}
                                                  sx={{ mb: 2 }}
                                                >
                                                  {destination.activities.map(
                                                    (activity, index) => (
                                                      <Draggable
                                                        key={activity.id}
                                                        draggableId={
                                                          activity.id
                                                        }
                                                        index={index}
                                                      >
                                                        {(provided) => (
                                                          <Card
                                                            ref={
                                                              provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            elevation={1}
                                                            sx={{ p: 1, mb: 1 }}
                                                          >
                                                            {/* Activity Form Fields - Same as before */}
                                                            <Grid
                                                              container
                                                              spacing={1}
                                                            >
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Activity Title"
                                                                  size="small"
                                                                  fullWidth
                                                                  value={
                                                                    activity.title
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "activities",
                                                                      index,
                                                                      "title",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Date"
                                                                  type="date"
                                                                  size="small"
                                                                  fullWidth
                                                                  InputLabelProps={{
                                                                    shrink: true,
                                                                  }}
                                                                  value={
                                                                    activity.date
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "activities",
                                                                      index,
                                                                      "date",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Time"
                                                                  type="time"
                                                                  size="small"
                                                                  fullWidth
                                                                  InputLabelProps={{
                                                                    shrink: true,
                                                                  }}
                                                                  value={
                                                                    activity.time
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "activities",
                                                                      index,
                                                                      "time",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <FormControl
                                                                  fullWidth
                                                                  size="small"
                                                                >
                                                                  <InputLabel>
                                                                    Type
                                                                  </InputLabel>
                                                                  <Select
                                                                    value={
                                                                      activity.type
                                                                    }
                                                                    label="Type"
                                                                    onChange={(
                                                                      e
                                                                    ) =>
                                                                      handleInputChange(
                                                                        destinationIndex,
                                                                        "activities",
                                                                        index,
                                                                        "type",
                                                                        e.target
                                                                          .value
                                                                      )
                                                                    }
                                                                  >
                                                                    {ACTIVITY_TYPES.map(
                                                                      (
                                                                        type
                                                                      ) => (
                                                                        <MenuItem
                                                                          key={
                                                                            type
                                                                          }
                                                                          value={
                                                                            type
                                                                          }
                                                                        >
                                                                          {type}
                                                                        </MenuItem>
                                                                      )
                                                                    )}
                                                                  </Select>
                                                                </FormControl>
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Cost"
                                                                  type="number"
                                                                  size="small"
                                                                  fullWidth
                                                                  value={
                                                                    activity.cost
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "activities",
                                                                      index,
                                                                      "cost",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                              >
                                                                <TextField
                                                                  label="Notes"
                                                                  size="small"
                                                                  fullWidth
                                                                  multiline
                                                                  rows={2}
                                                                  value={
                                                                    activity.notes
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "activities",
                                                                      index,
                                                                      "notes",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sx={{
                                                                  textAlign:
                                                                    "right",
                                                                }}
                                                              >
                                                                <IconButton
                                                                  color="error"
                                                                  size="small"
                                                                  onClick={() =>
                                                                    handleDeleteItem(
                                                                      destinationIndex,
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
                                          </Box>
                                        )}

                                        {destination.activeSubTab ===
                                          1 /* Expenses Panel - Same as before */ && (
                                          <Box sx={{ mb: 2 }}>
                                            <Button
                                              variant="outlined"
                                              onClick={() =>
                                                handleAddExpense(
                                                  destinationIndex
                                                )
                                              }
                                              startIcon={<AddIcon />}
                                            >
                                              Add Expense
                                            </Button>
                                            <Droppable
                                              droppableId={`destination-${destinationIndex}-expense`}
                                            >
                                              {(provided) => (
                                                <Box
                                                  {...provided.droppableProps}
                                                  ref={provided.innerRef}
                                                  sx={{ mb: 2 }}
                                                >
                                                  {destination.expenses.map(
                                                    (expense, index) => (
                                                      <Draggable
                                                        key={expense.id}
                                                        draggableId={expense.id}
                                                        index={index}
                                                      >
                                                        {(provided) => (
                                                          <Card
                                                            ref={
                                                              provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            elevation={1}
                                                            sx={{ p: 1, mb: 1 }}
                                                          >
                                                            {/* Expense Form Fields - Same as before */}
                                                            <Grid
                                                              container
                                                              spacing={1}
                                                            >
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Item"
                                                                  fullWidth
                                                                  size="small"
                                                                  value={
                                                                    expense.item
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "expenses",
                                                                      index,
                                                                      "item",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Amount"
                                                                  type="number"
                                                                  size="small"
                                                                  fullWidth
                                                                  value={
                                                                    expense.amount
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "expenses",
                                                                      index,
                                                                      "amount",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <FormControl
                                                                  fullWidth
                                                                  size="small"
                                                                >
                                                                  <InputLabel>
                                                                    Category
                                                                  </InputLabel>
                                                                  <Select
                                                                    value={
                                                                      expense.category
                                                                    }
                                                                    label="Category"
                                                                    onChange={(
                                                                      e
                                                                    ) =>
                                                                      handleInputChange(
                                                                        destinationIndex,
                                                                        "expenses",
                                                                        index,
                                                                        "category",
                                                                        e.target
                                                                          .value
                                                                      )
                                                                    }
                                                                  >
                                                                    {EXPENSE_CATEGORIES.map(
                                                                      (
                                                                        category
                                                                      ) => (
                                                                        <MenuItem
                                                                          key={
                                                                            category
                                                                          }
                                                                          value={
                                                                            category
                                                                          }
                                                                        >
                                                                          {
                                                                            category
                                                                          }
                                                                        </MenuItem>
                                                                      )
                                                                    )}
                                                                  </Select>
                                                                </FormControl>
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Date"
                                                                  size="small"
                                                                  type="date"
                                                                  fullWidth
                                                                  InputLabelProps={{
                                                                    shrink: true,
                                                                  }}
                                                                  value={
                                                                    expense.date
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "expenses",
                                                                      index,
                                                                      "date",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Time"
                                                                  type="time"
                                                                  size="small"
                                                                  fullWidth
                                                                  InputLabelProps={{
                                                                    shrink: true,
                                                                  }}
                                                                  value={
                                                                    expense.time
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "expenses",
                                                                      index,
                                                                      "time",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sx={{
                                                                  textAlign:
                                                                    "right",
                                                                }}
                                                              >
                                                                <IconButton
                                                                  color="error"
                                                                  size="small"
                                                                  onClick={() =>
                                                                    handleDeleteItem(
                                                                      destinationIndex,
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
                                          </Box>
                                        )}

                                        {destination.activeSubTab ===
                                          2 /* Reminders Panel - Same as before */ && (
                                          <Box sx={{ mb: 2 }}>
                                            <Button
                                              variant="outlined"
                                              onClick={() =>
                                                handleAddReminder(
                                                  destinationIndex
                                                )
                                              }
                                              startIcon={<AddIcon />}
                                            >
                                              Add Reminder
                                            </Button>
                                            <Droppable
                                              droppableId={`destination-${destinationIndex}-reminder`}
                                            >
                                              {(provided) => (
                                                <Box
                                                  {...provided.droppableProps}
                                                  ref={provided.innerRef}
                                                  sx={{ mb: 2 }}
                                                >
                                                  {destination.reminders.map(
                                                    (reminder, index) => (
                                                      <Draggable
                                                        key={reminder.id}
                                                        draggableId={
                                                          reminder.id
                                                        }
                                                        index={index}
                                                      >
                                                        {(provided) => (
                                                          <Card
                                                            ref={
                                                              provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            elevation={1}
                                                            sx={{ p: 1, mb: 1 }}
                                                          >
                                                            {/* Reminder Form Fields - Same as before */}
                                                            <Grid
                                                              container
                                                              spacing={1}
                                                            >
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Reminder Title"
                                                                  fullWidth
                                                                  size="small"
                                                                  value={
                                                                    reminder.title
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "reminders",
                                                                      index,
                                                                      "title",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <FormControl
                                                                  fullWidth
                                                                  size="small"
                                                                >
                                                                  <InputLabel>
                                                                    Type
                                                                  </InputLabel>
                                                                  <Select
                                                                    value={
                                                                      reminder.type
                                                                    }
                                                                    label="Type"
                                                                    onChange={(
                                                                      e
                                                                    ) =>
                                                                      handleInputChange(
                                                                        destinationIndex,
                                                                        "reminders",
                                                                        index,
                                                                        "type",
                                                                        e.target
                                                                          .value
                                                                      )
                                                                    }
                                                                  >
                                                                    {REMINDER_TYPES.map(
                                                                      (
                                                                        type
                                                                      ) => (
                                                                        <MenuItem
                                                                          key={
                                                                            type
                                                                          }
                                                                          value={
                                                                            type
                                                                          }
                                                                        >
                                                                          {type}
                                                                        </MenuItem>
                                                                      )
                                                                    )}
                                                                  </Select>
                                                                </FormControl>
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Date"
                                                                  type="date"
                                                                  fullWidth
                                                                  size="small"
                                                                  InputLabelProps={{
                                                                    shrink: true,
                                                                  }}
                                                                  value={
                                                                    reminder.date
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "reminders",
                                                                      index,
                                                                      "date",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                              >
                                                                <TextField
                                                                  label="Time"
                                                                  type="time"
                                                                  fullWidth
                                                                  size="small"
                                                                  InputLabelProps={{
                                                                    shrink: true,
                                                                  }}
                                                                  value={
                                                                    reminder.time
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) =>
                                                                    handleInputChange(
                                                                      destinationIndex,
                                                                      "reminders",
                                                                      index,
                                                                      "time",
                                                                      e.target
                                                                        .value
                                                                    )
                                                                  }
                                                                />
                                                              </Grid>
                                                              <Grid
                                                                item
                                                                xs={12}
                                                                sx={{
                                                                  textAlign:
                                                                    "right",
                                                                }}
                                                              >
                                                                <IconButton
                                                                  color="error"
                                                                  size="small"
                                                                  onClick={() =>
                                                                    handleDeleteItem(
                                                                      destinationIndex,
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
                                          </Box>
                                        )}
                                      </Grid>
                                      <Grid item xs={12}>
                                        <BudgetChart
                                          expenses={destination.expenses}
                                          activities={destination.activities}
                                          budget={currentItinerary.budget}
                                        />
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
                  {/* Sharing Tab - Same as before, but ensure collaborator logic uses UIDs internally */}
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentItinerary.isCollaborative}
                            onChange={(e) =>
                              handleItineraryInputChange(
                                "isCollaborative",
                                e.target.checked
                              )
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
                                onDelete={() =>
                                  handleRemoveCollaborator(collaborator)
                                }
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
                  {editItineraryId ? "Update" : "Save"}
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
