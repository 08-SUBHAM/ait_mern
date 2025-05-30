const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true
    },
    airline: {
        type: String,
        required: true
    },
    departure: {
        city: {
            type: String,
            required: true
        },
        airport: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        }
    },
    arrival: {
        city: {
            type: String,
            required: true
        },
        airport: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    seats: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['scheduled', 'delayed', 'departed', 'arrived', 'cancelled'],
        default: 'scheduled'
    }
}, { timestamps: true });

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;