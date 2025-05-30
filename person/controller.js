const Flight = require('./model');

const getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find().sort({ createdAt: -1 });
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single flight
const getFlight = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        res.json(flight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new flight
const createFlight = async (req, res) => {
    try {

        const requiredFields = {
            'flightNumber': 'Flight number is required',
            'airline': 'Airline is required',
            'departure.city': 'Departure city is required',
            'departure.airport': 'Departure airport is required',
            'departure.time': 'Departure time is required',
            'arrival.city': 'Arrival city is required',
            'arrival.airport': 'Arrival airport is required',
            'arrival.time': 'Arrival time is required',
            'price': 'Price is required and must be a number',
            'seats': 'Number of seats is required and must be a whole number'
        };

        const errors = {};
        

        for (const [field, message] of Object.entries(requiredFields)) {
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                if (!req.body[parent]?.[child]) {
                    errors[field] = message;
                }
            } else if (!req.body[field]) {
                errors[field] = message;
            }
        }


        if (isNaN(parseFloat(req.body.price))) {
            errors.price = 'Price must be a valid number';
        }
        
        if (!Number.isInteger(parseInt(req.body.seats, 10))) {
            errors.seats = 'Seats must be a whole number';
        } else if (parseInt(req.body.seats, 10) <= 0) {
            errors.seats = 'Number of seats must be greater than 0';
        }


        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }


        const flight = new Flight({
            flightNumber: req.body.flightNumber.trim(),
            airline: req.body.airline.trim(),
            departure: {
                city: req.body.departure.city.trim(),
                airport: req.body.departure.airport.trim(),
                time: new Date(req.body.departure.time)
            },
            arrival: {
                city: req.body.arrival.city.trim(),
                airport: req.body.arrival.airport.trim(),
                time: new Date(req.body.arrival.time)
            },
            price: parseFloat(req.body.price),
            seats: parseInt(req.body.seats, 10),
            status: req.body.status || 'scheduled'
        });


        const newFlight = await flight.save();
        res.status(201).json(newFlight);
    } catch (error) {
        console.error('Error creating flight:', error);
        

        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'A flight with this flight number already exists' 
            });
        }
        

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }
        

        res.status(500).json({ 
            message: 'An error occurred while creating the flight',
            error: error.message 
        });
    }
};

// Update a flight
const updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }


        if (req.body.flightNumber) flight.flightNumber = req.body.flightNumber;
        if (req.body.airline) flight.airline = req.body.airline;
        if (req.body.departure) {
            if (req.body.departure.city) flight.departure.city = req.body.departure.city;
            if (req.body.departure.airport) flight.departure.airport = req.body.departure.airport;
            if (req.body.departure.time) flight.departure.time = new Date(req.body.departure.time);
        }
        if (req.body.arrival) {
            if (req.body.arrival.city) flight.arrival.city = req.body.arrival.city;
            if (req.body.arrival.airport) flight.arrival.airport = req.body.arrival.airport;
            if (req.body.arrival.time) flight.arrival.time = new Date(req.body.arrival.time);
        }
        if (req.body.price) flight.price = req.body.price;
        if (req.body.seats) flight.seats = req.body.seats;
        if (req.body.status) flight.status = req.body.status;

        const updatedFlight = await flight.save();
        res.json(updatedFlight);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a flight
const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        

        await Flight.deleteOne({ _id: req.params.id });
        
        res.json({ 
            success: true,
            message: 'Flight deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting flight:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to delete flight',
            error: error.message 
        });
    }
};

module.exports = {
    getAllFlights,
    getFlight,
    createFlight,
    updateFlight,
    deleteFlight
};