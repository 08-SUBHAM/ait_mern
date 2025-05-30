const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { 
    getAllFlights, 
    getFlight, 
    createFlight, 
    updateFlight, 
    deleteFlight 
} = require('./controller');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const mongoURI = 'mongodb://localhost:27017/flightDB';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));


app.get('/api/flights', getAllFlights);
app.get('/api/flights/:id', getFlight);
app.post('/api/flights', createFlight);
app.put('/api/flights/:id', updateFlight);
app.delete('/api/flights/:id', deleteFlight);


app.get('/flights', (req, res) => {
    res.render('flights');
});


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
