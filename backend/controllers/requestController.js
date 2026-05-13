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

// 🔴 NAYA: Edit (Update) karne ka function 🔴
export const updateBloodRequest = async (req, res) => {
    try {
        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Isse update hone ke baad naya data return hota hai
        );
        
        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }
        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: "Error updating request", error });
    }
};

// 🔴 NAYA: Delete karne ka function 🔴
export const deleteBloodRequest = async (req, res) => {
    try {
        const deletedRequest = await Request.findByIdAndDelete(req.params.id);
        
        if (!deletedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }
        res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting request", error });
    }
};