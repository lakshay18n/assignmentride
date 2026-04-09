const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { assignDriver } = require('./driverController');

exports.createRide = async (req, res) => {
    try {
        const { pickupLocation, dropLocation } = req.body;
        const fare = Math.floor(Math.random() * (500 - 80 + 1)) + 80;

        const ride = new Ride({
            userId: req.user.id,
            pickupLocation,
            dropLocation,
            fare
        });

        await ride.save();
        await assignDriver(ride._id);

        res.status(201).json({ success: true, message: 'Ride created successfully', data: ride });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', data: { error: error.message } });
    }
};

exports.cancelRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found', data: {} });
        }

        if (ride.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized', data: {} });
        }

        if (ride.status !== 'pending' && ride.status !== 'assigned') {
            return res.status(400).json({ success: false, message: 'Cannot cancel ride in current status', data: {} });
        }

        const oldStatus = ride.status;
        ride.status = 'cancelled';
        await ride.save();

        if (oldStatus === 'assigned' && ride.driverId) {
            await Driver.findByIdAndUpdate(ride.driverId, { 
                isAvailable: true,
                currentRideId: null
            });
        }

        res.status(200).json({ success: true, message: 'Ride cancelled successfully', data: ride });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', data: { error: error.message } });
    }
};

exports.getUserRides = async (req, res) => {
    try {
        const rides = await Ride.find({ userId: req.user.id })
            .populate('driverId');
        
        res.status(200).json({ success: true, message: 'Rides fetched successfully', data: rides });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', data: { error: error.message } });
    }
};
