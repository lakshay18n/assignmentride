const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    vehicle: { type: String, required: true },
    plate: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    currentRideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null },
    rating: { type: Number, default: 4.5 }
});

module.exports = mongoose.model('Driver', driverSchema);
