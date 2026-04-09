const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'assigned', 'ongoing', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    fare: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ride', rideSchema);
