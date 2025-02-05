import { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import Navbar from "../components/Navbar";

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [newTrip, setNewTrip] = useState("");

  const user = auth.currentUser;

  // Fetch itineraries from Firestore
  useEffect(() => {
    if (user) {
      const fetchItineraries = async () => {
        const querySnapshot = await getDocs(collection(db, "itineraries"));
        setItineraries(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      };
      fetchItineraries();
    }
  }, [user]);

  // Add a new itinerary
  const addItinerary = async () => {
    if (!newTrip.trim()) return;
    await addDoc(collection(db, "itineraries"), { name: newTrip, userId: user.uid });
    setNewTrip("");
  };

  // Delete an itinerary
  const deleteItinerary = async (id) => {
    await deleteDoc(doc(db, "itineraries", id));
    setItineraries(itineraries.filter((trip) => trip.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4">
        <h1 className="text-xl font-bold">Your Itineraries</h1>

        <div className="my-4">
          <input
            type="text"
            placeholder="Add new trip..."
            value={newTrip}
            onChange={(e) => setNewTrip(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={addItinerary} className="bg-blue-500 text-white px-4 py-2">
            Add
          </button>
        </div>

        <ul>
          {itineraries.map((trip) => (
            <li key={trip.id} className="flex justify-between p-2 bg-white my-2">
              <span>{trip.name}</span>
              <button
                onClick={() => deleteItinerary(trip.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ItineraryList;
