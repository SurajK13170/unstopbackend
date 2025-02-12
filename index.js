const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const totalFloors = 10;
const roomsPerFloor = 10;
let rooms = {};

const initializeRooms = () => {
  rooms = {};
  for (let i = 1; i <= totalFloors; i++) {
    let floorRooms = i === 10 ? 7 : roomsPerFloor;
    for (let j = 1; j <= floorRooms; j++) {
      let roomNumber = i * 100 + j;
      rooms[roomNumber] = "available";
    }
  }
};

initializeRooms();

const bookRooms = (numRooms) => {
  console.log("Available rooms before booking:", rooms);

  let bookedRooms = [];
  let availableRooms = Object.keys(rooms).filter((r) => rooms[r] === "available");

  // If not enough rooms are available, return an error
  if (availableRooms.length < numRooms) {
    console.log("Booking failed: Not enough rooms available");
    return { success: false, message: "Not enough rooms available" };
  }

  // Try booking rooms on the same floor first
  for (let floor = 1; floor <= totalFloors; floor++) {
    let floorRooms = availableRooms.filter((r) => Math.floor(r / 100) === floor);
    if (floorRooms.length >= numRooms) {
      bookedRooms = floorRooms.slice(0, numRooms);
      break;
    }
  }

  // If not enough rooms on the same floor, spread across floors
  if (bookedRooms.length === 0) {
    bookedRooms = availableRooms.slice(0, numRooms);
  }

  // Mark rooms as booked
  bookedRooms.forEach((room) => {
    rooms[room] = "booked";
  });

  console.log("Rooms booked:", bookedRooms);
  return { success: true, bookedRooms };
};


app.get("/rooms", (req, res) => res.json(rooms));

app.post("/book", (req, res) => {
  const { numRooms } = req.body;
  if (numRooms < 1 || numRooms > 5) return res.status(400).json({ error: "Can book 1-5 rooms only" });

  const result = bookRooms(numRooms);
  res.json(result);
});

app.post("/reset", (req, res) => {
  initializeRooms();
  res.json({ success: true, message: "Rooms reset successfully" });
});

app.post("/randomize", (req, res) => {
  Object.keys(rooms).forEach((room) => {
    rooms[room] = Math.random() > 0.7 ? "booked" : "available";
  });
  res.json({ success: true, message: "Random room occupancy updated" });
});

app.listen(PORT || 8080, () => console.log(`Server running on port ${PORT}`));
