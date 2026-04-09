const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

exports.assignDriver = async (rideId) => {
    try {
        const driver = await Driver.findOne({ isAvailable: true });
        if (!driver) return;

        const ride = await Ride.findById(rideId);
        if (!ride) return;

        driver.isAvailable = false;
        driver.currentRideId = rideId;
        await driver.save();

        ride.driverId = driver._id;
        ride.status = 'assigned';
        await ride.save();
    } catch (error) {
        console.error('Assign driver utility error:', error.message);
    }
};

exports.seedDrivers = async (req, res) => {
    try {
        const count = await Driver.countDocuments();
        if (count > 0) {
            return res.status(200).json({ success: true, message: 'Drivers already seeded', data: {} });
        }

        const dummyDrivers = [
            { name: 'Rahul', vehicle: 'Swift', plate: 'DL1CAB1234' },
            { name: 'Amit', vehicle: 'Innova', plate: 'UP1CAB5678' },
            { name: 'Suresh', vehicle: 'WagonR', plate: 'MH1CAB9012' },
            { name: 'Vijay', vehicle: 'Bolero', plate: 'HR1CAB3456' },
            { name: 'Manoj', vehicle: 'Ertiga', plate: 'KA1CAB7890' }
        ];

        await Driver.insertMany(dummyDrivers);
        res.status(201).json({ success: true, message: '5 drivers seeded successfully', data: dummyDrivers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', data: { error: error.message } });
    }
};

exports.getAvailableDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ isAvailable: true });
        res.status(200).json({ success: true, message: 'Available drivers fetched', data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', data: { error: error.message } });
    }
};
