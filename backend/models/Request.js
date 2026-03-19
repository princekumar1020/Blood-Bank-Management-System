import mongoose from 'mongoose';

// 1. Schema (Blueprint) - Database ko batata hai ki data kaisa dikhega
const requestSchema = new mongoose.Schema({
    bloodGroup: {
        type: String,
        required: [true, "Blood group is required"],
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] // Sirf yahi options allowed hain
    },
    units: {
        type: Number,
        required: [true, "Units are required"],
        min: [1, "At least 1 unit is required"]
    },
    reason: {
        type: String,
        required: [true, "Reason is required"]
    },
    status: {
        type: String,
        default: 'Pending' // Nayi request humesha pending rahega jab tak admin approve na kare
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 2. Model - Ye database se baat karne ka main tool hai
const Request = mongoose.model('Request', requestSchema);
export default Request;