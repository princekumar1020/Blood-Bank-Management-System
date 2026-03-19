import Request from '../models/Request.js';

// Nayi blood request save karne ka function
export const createBloodRequest = async (req, res) => {
    try {
        const { bloodGroup, units, reason } = req.body;

        // Database mein naya record banana
        const newRequest = new Request({
            bloodGroup,
            units,
            reason
        });

        await newRequest.save();
        res.status(201).json({ message: "Blood Request Saved Successfully! ✅" });
    } catch (error) {
        res.status(400).json({ message: "Error saving request", error: error.message });
    }
};
// Database se saari requests nikalne wala function
export const getRequestsHistory = async (req, res) => {
    try {
        // Request model se find() method lagaya saara data mangwane ke liye
        // .sort({ createdAt: -1 }) se nayi request sabse upar dikhegi
        const history = await Request.find().sort({ createdAt: -1 }); 
        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Server mein issue hai, history nahi aayi." });
    }
};