const flightList = document.getElementById('flightList');
const flightForm = document.getElementById('flightForm');
const flightModal = new bootstrap.Modal(document.getElementById('flightModal'));
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const saveFlightBtn = document.getElementById('saveFlight');
const confirmDeleteBtn = document.getElementById('confirmDelete');

let currentFlightId = null;


document.addEventListener('DOMContentLoaded', loadFlights);
document.getElementById('addFlightBtn')?.addEventListener('click', () => showFlightForm());
saveFlightBtn.addEventListener('click', saveFlight);
confirmDeleteBtn.addEventListener('click', deleteFlight);


async function loadFlights() {
    try {

        flightList.innerHTML = `
            <div class="col-12">
                <div class="card loading" style="height: 150px;"></div>
            </div>
            <div class="col-12">
                <div class="card loading" style="height: 150px; animation-delay: 0.2s;"></div>
            </div>
        `;
        
        const response = await fetch('/api/flights');
        const flights = await response.json();
        
        flightList.innerHTML = '';
        
        if (flights.length === 0) {
            flightList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        No flights found. Click the "Add New Flight" button to get started.
                    </div>
                </div>`;
            return;
        }
        
        flights.forEach(flight => {
            const flightCard = createFlightCard(flight);
            flightList.appendChild(flightCard);
        });
    } catch (error) {
        console.error('Error loading flights:', error);
        flightList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Failed to load flights. Please refresh the page or try again later.
                </div>
            </div>`;
    }
}


function createFlightCard(flight) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    
    const statusClass = {
        'scheduled': 'bg-primary',
        'delayed': 'bg-warning text-dark',
        'departed': 'bg-info',
        'arrived': 'bg-success',
        'cancelled': 'bg-danger'
    }[flight.status] || 'bg-secondary';
    
    const departureTime = new Date(flight.departure.time).toLocaleString();
    const arrivalTime = new Date(flight.arrival.time).toLocaleString();
    
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">${flight.airline} ${flight.flightNumber}</h5>
                <span class="badge ${statusClass}">${flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}</span>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                    <div>
                        <h6 class="mb-0">${flight.departure.city} (${flight.departure.airport})</h6>
                        <small class="text-muted">${departureTime}</small>
                    </div>
                    <div class="text-end">
                        <h6 class="mb-0">${flight.arrival.city} (${flight.arrival.airport})</h6>
                        <small class="text-muted">${arrivalTime}</small>
                    </div>
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="h4">$${flight.price.toFixed(2)}</span>
                        <small class="text-muted d-block">per seat</small>
                    </div>
                    <div>
                        <span class="h5">${flight.seats}</span>
                        <small class="text-muted d-block">seats left</small>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-transparent">
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editFlight('${flight._id}')">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${flight._id}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}


function showFlightForm(flight = null) {
    const form = document.getElementById('flightForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (flight) {

        modalTitle.textContent = 'Edit Flight';
        currentFlightId = flight._id;
        

        document.getElementById('flightNumber').value = flight.flightNumber;
        document.getElementById('airline').value = flight.airline;
        document.getElementById('departureCity').value = flight.departure.city;
        document.getElementById('departureAirport').value = flight.departure.airport;
        document.getElementById('departureTime').value = new Date(flight.departure.time).toISOString().slice(0, 16);
        document.getElementById('arrivalCity').value = flight.arrival.city;
        document.getElementById('arrivalAirport').value = flight.arrival.airport;
        document.getElementById('arrivalTime').value = new Date(flight.arrival.time).toISOString().slice(0, 16);
        document.getElementById('price').value = flight.price;
        document.getElementById('seats').value = flight.seats;
        document.getElementById('status').value = flight.status;
    } else {

        modalTitle.textContent = 'Add New Flight';
        currentFlightId = null;
        form.reset();
    }
    
    flightModal.show();
}


async function saveFlight() {

    const saveButton = document.getElementById('saveFlight');
    const saveSpinner = document.getElementById('saveSpinner');
    const saveText = document.getElementById('saveText');
    
    // Show loading state
    saveButton.disabled = true;
    saveSpinner.classList.remove('d-none');
    saveText.textContent = 'Saving...';
    

    const flightData = {
        flightNumber: document.getElementById('flightNumber').value.trim(),
        airline: document.getElementById('airline').value.trim(),
        departure: {
            city: document.getElementById('departureCity').value.trim(),
            airport: document.getElementById('departureAirport').value.trim(),
            time: document.getElementById('departureTime').value
        },
        arrival: {
            city: document.getElementById('arrivalCity').value.trim(),
            airport: document.getElementById('arrivalAirport').value.trim(),
            time: document.getElementById('arrivalTime').value
        },
        price: parseFloat(document.getElementById('price').value),
        seats: parseInt(document.getElementById('seats').value, 10),
        status: document.getElementById('status').value
    };
    

    if (!flightData.flightNumber || !flightData.airline || 
        !flightData.departure.city || !flightData.departure.airport || !flightData.departure.time ||
        !flightData.arrival.city || !flightData.arrival.airport || !flightData.arrival.time ||
        isNaN(flightData.price) || isNaN(flightData.seats)) {
        
        // Reset button state
        saveButton.disabled = false;
        saveSpinner.classList.add('d-none');
        saveText.textContent = 'Save changes';
        
        alert('Please fill in all required fields with valid data.');
        return;
    }
    
    try {
        const url = currentFlightId 
            ? `/api/flights/${currentFlightId}` 
            : '/api/flights';
            
        const method = currentFlightId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(flightData)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            // Handle validation errors or other server-side errors
            const errorMessage = responseData.errors 
                ? Object.values(responseData.errors).join('\n')
                : responseData.message || 'Failed to save flight';
            throw new Error(errorMessage);
        }
        
        // Show success message
        alert('Flight saved successfully!');
        
        // Hide modal and refresh the flight list
        const modal = bootstrap.Modal.getInstance(document.getElementById('flightModal'));
        modal.hide();
        
        await loadFlights();
    } catch (error) {
        console.error('Error saving flight:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        saveButton.disabled = false;
        saveSpinner.classList.add('d-none');
        saveText.textContent = 'Save changes';
    }
}


function confirmDelete(flightId) {
    currentFlightId = flightId;
    confirmModal.show();
}


async function deleteFlight() {
    if (!currentFlightId) return;
    
    const deleteButton = document.getElementById('confirmDelete');
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm me-1';
    spinner.role = 'status';
    spinner.setAttribute('aria-hidden', 'true');
    
    const originalButtonText = deleteButton.innerHTML;
    deleteButton.disabled = true;
    deleteButton.innerHTML = '';
    deleteButton.appendChild(spinner);
    deleteButton.appendChild(document.createTextNode(' Deleting...'));
    
    try {
        const response = await fetch(`/api/flights/${currentFlightId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete flight');
        }
        
        // Show success message
        alert('Flight deleted successfully!');
        
        // Hide the confirmation modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        modal.hide();
        
        // Refresh the flight list
        await loadFlights();
    } catch (error) {
        console.error('Error deleting flight:', error);
        alert(`Error: ${error.message || 'Failed to delete flight. Please try again.'}`);
    } finally {
        // Reset the button state
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
    }
}


window.editFlight = async (flightId) => {
    try {
        const response = await fetch(`/api/flights/${flightId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch flight data');
        }
        const flight = await response.json();
        showFlightForm(flight);
    } catch (error) {
        console.error('Error fetching flight:', error);
        alert('Failed to load flight data. Please try again.');
    }
};

window.confirmDelete = confirmDelete;
