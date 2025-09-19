// data/seedData.js - Initialize sample data for Sri Lankan inter-provincial buses
const crypto = require('crypto');

// In-memory data store (replace with database in production)
const dataStore = {
    routes: new Map(),
    buses: new Map(),
    trips: new Map(),
    operators: new Map(),
    locations: new Map(),
    apiKeys: new Map(),
    stops: new Map()
};

// Sri Lankan inter-provincial bus routes based on actual NTC routes
const routeDefinitions = [
    {
        routeId: 'RT001',
        routeNumber: '1',
        name: 'Colombo - Kandy',
        origin: 'Colombo (Pettah)',
        destination: 'Kandy (Central Bus Stand)',
        distance: 115,
        estimatedDuration: 180, // minutes
        operatingHours: { start: '04:00', end: '23:30' },
        frequency: 15, // minutes
        fareNormal: 410.00,
        fareAC: 525.00,
        coordinates: {
            origin: { latitude: 6.9271, longitude: 79.8612 },
            destination: { latitude: 7.2906, longitude: 80.6337 }
        },
        waypoints: [
            { name: 'Peliyagoda', latitude: 6.9488, longitude: 79.8890, estimatedTime: 15 },
            { name: 'Kiribathgoda', latitude: 6.9804, longitude: 79.9297, estimatedTime: 25 },
            { name: 'Nittambuwa', latitude: 7.1378, longitude: 80.0947, estimatedTime: 45 },
            { name: 'Warakapola', latitude: 7.2247, longitude: 80.2014, estimatedTime: 75 },
            { name: 'Kegalle', latitude: 7.2513, longitude: 80.3464, estimatedTime: 105 },
            { name: 'Mawanella', latitude: 7.2511, longitude: 80.4547, estimatedTime: 135 },
            { name: 'Peradeniya', latitude: 7.2599, longitude: 80.5977, estimatedTime: 165 }
        ]
    },
    {
        routeId: 'RT002', 
        routeNumber: '2',
        name: 'Colombo - Galle',
        origin: 'Colombo (Pettah)',
        destination: 'Galle (Bus Station)',
        distance: 119,
        estimatedDuration: 150,
        operatingHours: { start: '04:30', end: '23:00' },
        frequency: 20,
        fareNormal: 390.00,
        fareAC: 525.00,
        coordinates: {
            origin: { latitude: 6.9271, longitude: 79.8612 },
            destination: { latitude: 6.0329, longitude: 80.2168 }
        },
        waypoints: [
            { name: 'Wellawatte', latitude: 6.8648, longitude: 79.8540, estimatedTime: 10 },
            { name: 'Mount Lavinia', latitude: 6.8411, longitude: 79.8639, estimatedTime: 20 },
            { name: 'Moratuwa', latitude: 6.7738, longitude: 79.8816, estimatedTime: 30 },
            { name: 'Panadura', latitude: 6.7132, longitude: 79.9026, estimatedTime: 45 },
            { name: 'Kalutara', latitude: 6.5854, longitude: 79.9607, estimatedTime: 65 },
            { name: 'Beruwala', latitude: 6.4788, longitude: 79.9830, estimatedTime: 85 },
            { name: 'Bentota', latitude: 6.4256, longitude: 79.9951, estimatedTime: 95 },
            { name: 'Ambalangoda', latitude: 6.2350, longitude: 80.0538, estimatedTime: 115 }
        ]
    },
    {
        routeId: 'RT003',
        routeNumber: '87-2',
        name: 'Colombo - Jaffna',
        origin: 'Colombo (Pettah)',
        destination: 'Jaffna (Central Bus Stand)',
        distance: 396,
        estimatedDuration: 480,
        operatingHours: { start: '05:00', end: '22:00' },
        frequency: 60,
        fareNormal: 1323.00,
        fareAC: 1750.00,
        coordinates: {
            origin: { latitude: 6.9271, longitude: 79.8612 },
            destination: { latitude: 9.6615, longitude: 80.0255 }
        },
        waypoints: [
            { name: 'Negombo', latitude: 7.2083, longitude: 79.8358, estimatedTime: 45 },
            { name: 'Puttalam', latitude: 8.0362, longitude: 79.8288, estimatedTime: 120 },
            { name: 'Anuradhapura', latitude: 8.3114, longitude: 80.4037, estimatedTime: 240 },
            { name: 'Vavuniya', latitude: 8.7514, longitude: 80.4971, estimatedTime: 330 },
            { name: 'Kilinochchi', latitude: 9.3964, longitude: 80.4103, estimatedTime: 390 },
            { name: 'Elephant Pass', latitude: 9.5431, longitude: 80.1731, estimatedTime: 435 }
        ]
    },
    {
        routeId: 'RT004',
        routeNumber: '57-1',
        name: 'Colombo - Anuradhapura',
        origin: 'Colombo (Pettah)',
        destination: 'Anuradhapura (New Bus Stand)',
        distance: 206,
        estimatedDuration: 270,
        operatingHours: { start: '04:45', end: '23:15' },
        frequency: 30,
        fareNormal: 690.00,
        fareAC: 920.00,
        coordinates: {
            origin: { latitude: 6.9271, longitude: 79.8612 },
            destination: { latitude: 8.3114, longitude: 80.4037 }
        },
        waypoints: [
            { name: 'Negombo', latitude: 7.2083, longitude: 79.8358, estimatedTime: 45 },
            { name: 'Chilaw', latitude: 7.5759, longitude: 79.7953, estimatedTime: 90 },
            { name: 'Puttalam', latitude: 8.0362, longitude: 79.8288, estimatedTime: 150 },
            { name: 'Kurunegala', latitude: 7.4863, longitude: 80.3647, estimatedTime: 180 },
            { name: 'Dambulla', latitude: 7.8731, longitude: 80.6511, estimatedTime: 225 }
        ]
    },
    {
        routeId: 'RT005',
        routeNumber: '1-1',
        name: 'Kandy - Galle',
        origin: 'Kandy (Central Bus Stand)',
        destination: 'Galle (Bus Station)',
        distance: 142,
        estimatedDuration: 210,
        operatingHours: { start: '05:00', end: '22:30' },
        frequency: 45,
        fareNormal: 485.00,
        fareAC: 650.00,
        coordinates: {
            origin: { latitude: 7.2906, longitude: 80.6337 },
            destination: { latitude: 6.0329, longitude: 80.2168 }
        },
        waypoints: [
            { name: 'Peradeniya', latitude: 7.2599, longitude: 80.5977, estimatedTime: 15 },
            { name: 'Gampola', latitude: 7.1644, longitude: 80.5736, estimatedTime: 35 },
            { name: 'Nawalapitiya', latitude: 7.0436, longitude: 80.5342, estimatedTime: 55 },
            { name: 'Hatton', latitude: 6.8917, longitude: 80.5956, estimatedTime: 90 },
            { name: 'Ratnapura', latitude: 6.6828, longitude: 80.3992, estimatedTime: 135 },
            { name: 'Embilipitiya', latitude: 6.3431, longitude: 80.8490, estimatedTime: 170 },
            { name: 'Matara', latitude: 5.9549, longitude: 80.5550, estimatedTime: 195 }
        ]
    }
];

// Bus operators in Sri Lanka
const operatorDefinitions = [
    {
        operatorId: 'OP001',
        name: 'Sri Lanka Transport Board (SLTB)',
        type: 'Government',
        contactNumber: '+94-11-2587632',
        email: 'info@sltb.lk',
        address: 'Transport Board Building, Narahenpita, Colombo 05',
        licenseNumber: 'SLTB-GOV-001',
        establishedYear: 1958,
        fleetSize: 450,
        routes: ['RT001', 'RT002', 'RT003', 'RT004', 'RT005'],
        apiKey: 'sltb_operator_key_2024_secure'
    },
    {
        operatorId: 'OP002',
        name: 'Central Province Transport Services',
        type: 'Private',
        contactNumber: '+94-81-2234567',
        email: 'operations@cpts.lk',
        address: 'Main Street, Kandy',
        licenseNumber: 'CPTS-PVT-002',
        establishedYear: 1995,
        fleetSize: 85,
        routes: ['RT001', 'RT005'],
        apiKey: 'cpts_operator_key_2024_secure'
    },
    {
        operatorId: 'OP003',
        name: 'Southern Express Transport',
        type: 'Private',
        contactNumber: '+94-91-2345678',
        email: 'info@southernexpress.lk',
        address: 'Bus Station Road, Galle',
        licenseNumber: 'SET-PVT-003',
        establishedYear: 2001,
        fleetSize: 62,
        routes: ['RT002', 'RT005'],
        apiKey: 'set_operator_key_2024_secure'
    },
    {
        operatorId: 'OP004',
        name: 'Northern Province Bus Service',
        type: 'Private',
        contactNumber: '+94-21-2234567',
        email: 'contact@npbs.lk',
        address: 'Hospital Road, Jaffna',
        licenseNumber: 'NPBS-PVT-004',
        establishedYear: 2010,
        fleetSize: 48,
        routes: ['RT003'],
        apiKey: 'npbs_operator_key_2024_secure'
    },
    {
        operatorId: 'OP005',
        name: 'North Central Express',
        type: 'Private',
        contactNumber: '+94-25-2345678',
        email: 'info@ncexpress.lk',
        address: 'New Town, Anuradhapura',
        licenseNumber: 'NCE-PVT-005',
        establishedYear: 1998,
        fleetSize: 71,
        routes: ['RT004'],
        apiKey: 'nce_operator_key_2024_secure'
    }
];

// Bus definitions with Sri Lankan registration patterns
const busDefinitions = [
    // SLTB Buses
    { busId: 'BUS001', registrationNumber: 'CP-CAB-1234', operatorId: 'OP001', routeId: 'RT001', capacity: 52, type: 'Normal', acAvailable: false, wheelchairAccessible: true, year: 2019, model: 'Ashok Leyland Viking' },
    { busId: 'BUS002', registrationNumber: 'CP-CAC-2345', operatorId: 'OP001', routeId: 'RT001', capacity: 45, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2021, model: 'TATA LPO 1618' },
    { busId: 'BUS003', registrationNumber: 'CP-CAD-3456', operatorId: 'OP001', routeId: 'RT002', capacity: 48, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2018, model: 'Ashok Leyland Stallion' },
    { busId: 'BUS004', registrationNumber: 'CP-CAE-4567', operatorId: 'OP001', routeId: 'RT002', capacity: 42, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2020, model: 'TATA LPO 1618 AC' },
    { busId: 'BUS005', registrationNumber: 'CP-CAF-5678', operatorId: 'OP001', routeId: 'RT003', capacity: 55, type: 'Semi-Luxury', acAvailable: true, wheelchairAccessible: true, year: 2022, model: 'Volvo B7RLE' },
    
    // Central Province Transport Services
    { busId: 'BUS006', registrationNumber: 'CP-CBB-1111', operatorId: 'OP002', routeId: 'RT001', capacity: 50, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2017, model: 'Ashok Leyland Viking' },
    { busId: 'BUS007', registrationNumber: 'CP-CBC-2222', operatorId: 'OP002', routeId: 'RT001', capacity: 46, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2020, model: 'TATA LPO 1618 AC' },
    { busId: 'BUS008', registrationNumber: 'CP-CBD-3333', operatorId: 'OP002', routeId: 'RT005', capacity: 48, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2019, model: 'Eicher Skyline Pro' },
    { busId: 'BUS009', registrationNumber: 'CP-CBE-4444', operatorId: 'OP002', routeId: 'RT005', capacity: 44, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2021, model: 'TATA LPO 1618 AC' },
    { busId: 'BUS010', registrationNumber: 'CP-CBF-5555', operatorId: 'OP002', routeId: 'RT001', capacity: 52, type: 'Semi-Luxury', acAvailable: true, wheelchairAccessible: true, year: 2022, model: 'Volvo B9R' },
    
    // Southern Express Transport
    { busId: 'BUS011', registrationNumber: 'SP-SEB-1234', operatorId: 'OP003', routeId: 'RT002', capacity: 49, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2018, model: 'Ashok Leyland Stallion' },
    { busId: 'BUS012', registrationNumber: 'SP-SEC-2345', operatorId: 'OP003', routeId: 'RT002', capacity: 45, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2020, model: 'TATA LPO 1618 AC' },
    { busId: 'BUS013', registrationNumber: 'SP-SED-3456', operatorId: 'OP003', routeId: 'RT005', capacity: 47, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2017, model: 'Eicher Skyline' },
    { busId: 'BUS014', registrationNumber: 'SP-SEE-4567', operatorId: 'OP003', routeId: 'RT005', capacity: 43, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2021, model: 'TATA LPO 1618 AC' },
    { busId: 'BUS015', registrationNumber: 'SP-SEF-5678', operatorId: 'OP003', routeId: 'RT002', capacity: 50, type: 'Semi-Luxury', acAvailable: true, wheelchairAccessible: true, year: 2022, model: 'Volvo B7RLE' },
    
    // Northern Province Bus Service
    { busId: 'BUS016', registrationNumber: 'NP-NPB-1111', operatorId: 'OP004', routeId: 'RT003', capacity: 53, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2019, model: 'Ashok Leyland Viking' },
    { busId: 'BUS017', registrationNumber: 'NP-NPC-2222', operatorId: 'OP004', routeId: 'RT003', capacity: 48, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2021, model: 'TATA LPO 1618 AC' },
    { busId: 'BUS018', registrationNumber: 'NP-NPD-3333', operatorId: 'OP004', routeId: 'RT003', capacity: 51, type: 'Semi-Luxury', acAvailable: true, wheelchairAccessible: true, year: 2022, model: 'Volvo B9R' },
    { busId: 'BUS019', registrationNumber: 'NP-NPE-4444', operatorId: 'OP004', routeId: 'RT003', capacity: 49, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2018, model: 'Eicher Skyline Pro' },
    { busId: 'BUS020', registrationNumber: 'NP-NPF-5555', operatorId: 'OP004', routeId: 'RT003', capacity: 46, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2020, model: 'TATA LPO 1618 AC' },
    
    // North Central Express
    { busId: 'BUS021', registrationNumber: 'NCP-NCE-1234', operatorId: 'OP005', routeId: 'RT004', capacity: 50, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2019, model: 'Ashok Leyland Stallion' },
    { busId: 'BUS022', registrationNumber: 'NCP-NCF-2345', operatorId: 'OP005', routeId: 'RT004', capacity: 47, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2021, model: 'TATA LPO 1618 AC' },
    { busId: 'BUS023', registrationNumber: 'NCP-NCG-3456', operatorId: 'OP005', routeId: 'RT004', capacity: 52, type: 'Semi-Luxury', acAvailable: true, wheelchairAccessible: true, year: 2022, model: 'Volvo B7RLE' },
    { busId: 'BUS024', registrationNumber: 'NCP-NCH-4567', operatorId: 'OP005', routeId: 'RT004', capacity: 49, type: 'Normal', acAvailable: false, wheelchairAccessible: false, year: 2018, model: 'Eicher Skyline' },
    { busId: 'BUS025', registrationNumber: 'NCP-NCI-5678', operatorId: 'OP005', routeId: 'RT004', capacity: 45, type: 'AC', acAvailable: true, wheelchairAccessible: true, year: 2020, model: 'TATA LPO 1618 AC' }
];

// Generate realistic trip schedules for the next week
function generateTrips() {
    const trips = [];
    const currentDate = new Date();
    
    // Generate trips for next 7 days
    for (let day = 0; day < 7; day++) {
        const tripDate = new Date(currentDate);
        tripDate.setDate(currentDate.getDate() + day);
        
        routeDefinitions.forEach(route => {
            const routeBuses = busDefinitions.filter(bus => bus.routeId === route.routeId);
            
            // Generate multiple trips per day based on frequency
            const tripsPerDay = Math.floor(16 * 60 / route.frequency); // 16 hours of operation
            
            for (let tripIndex = 0; tripIndex < tripsPerDay; tripIndex++) {
                const bus = routeBuses[tripIndex % routeBuses.length];
                if (!bus) continue;
                
                // Calculate departure time
                const startHour = parseInt(route.operatingHours.start.split(':')[0]);
                const intervalMinutes = tripIndex * route.frequency;
                const departureTime = new Date(tripDate);
                departureTime.setHours(startHour, intervalMinutes % 60, 0, 0);
                departureTime.setHours(departureTime.getHours() + Math.floor(intervalMinutes / 60));
                
                // Calculate arrival time
                const arrivalTime = new Date(departureTime);
                arrivalTime.setMinutes(arrivalTime.getMinutes() + route.estimatedDuration);
                
                const tripId = `TRIP${String(trips.length + 1).padStart(4, '0')}`;
                
                trips.push({
                    tripId,
                    busId: bus.busId,
                    routeId: route.routeId,
                    operatorId: bus.operatorId,
                    scheduledDeparture: departureTime.toISOString(),
                    scheduledArrival: arrivalTime.toISOString(),
                    actualDeparture: null,
                    actualArrival: null,
                    status: day === 0 && tripIndex < 5 ? 'active' : 'scheduled', // Mark some current trips as active
                    currentLocation: null,
                    delay: 0,
                    passengerLoad: Math.floor(Math.random() * bus.capacity * 0.8), // Random load up to 80%
                    fare: bus.type === 'AC' || bus.type === 'Semi-Luxury' ? route.fareAC : route.fareNormal,
                    driverName: generateDriverName(),
                    driverPhone: generatePhoneNumber(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
        });
    }
    
    return trips.slice(0, 200); // Limit to reasonable number for demo
}

// Helper functions
function generateDriverName() {
    const firstNames = ['Sunil', 'Kamal', 'Nimal', 'Anil', 'Pradeep', 'Chamara', 'Roshan', 'Dilshan', 'Mahinda', 'Ruwan'];
    const lastNames = ['Fernando', 'Silva', 'Perera', 'Jayawardena', 'Gunasekara', 'Wickramasinghe', 'Rathnayake', 'Mendis', 'Wijesinghe', 'Rajapaksa'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generatePhoneNumber() {
    const operators = ['070', '071', '072', '074', '075', '076', '077', '078'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const number = Math.floor(1000000 + Math.random() * 8999999);
    return `+94-${operator}-${number}`;
}

// Generate current locations for active trips
function generateCurrentLocations() {
    const locations = new Map();
    
    // Get active trips
    const activeTrips = Array.from(dataStore.trips.values()).filter(trip => trip.status === 'active');
    
    activeTrips.forEach(trip => {
        const route = dataStore.routes.get(trip.routeId);
        if (!route || !route.waypoints || route.waypoints.length === 0) return;
        
        // Random position along the route
        const waypointIndex = Math.floor(Math.random() * route.waypoints.length);
        const waypoint = route.waypoints[waypointIndex];
        
        // Add some random variation to coordinates
        const latVariation = (Math.random() - 0.5) * 0.01;
        const lngVariation = (Math.random() - 0.5) * 0.01;
        
        locations.set(trip.busId, {
            tripId: trip.tripId,
            busId: trip.busId,
            latitude: waypoint.latitude + latVariation,
            longitude: waypoint.longitude + lngVariation,
            speed: Math.floor(Math.random() * 40 + 30), // 30-70 km/h
            heading: Math.floor(Math.random() * 360),
            accuracy: Math.floor(Math.random() * 10 + 5), // 5-15 meters
            timestamp: new Date().toISOString(),
            nearestStop: waypoint.name,
            estimatedArrival: route.waypoints[waypointIndex + 1]?.estimatedTime || null
        });
    });
    
    return locations;
}

// API Keys for different user types
const apiKeys = new Map([
    ['ntc_admin_key_2024_secure', { role: 'admin', name: 'NTC Administrator', permissions: ['read_all', 'write_all', 'admin'] }],
    ['sltb_operator_key_2024_secure', { role: 'operator', name: 'SLTB Operator', operatorId: 'OP001', permissions: ['read_own', 'write_own'] }],
    ['cpts_operator_key_2024_secure', { role: 'operator', name: 'CPTS Operator', operatorId: 'OP002', permissions: ['read_own', 'write_own'] }],
    ['set_operator_key_2024_secure', { role: 'operator', name: 'SET Operator', operatorId: 'OP003', permissions: ['read_own', 'write_own'] }],
    ['npbs_operator_key_2024_secure', { role: 'operator', name: 'NPBS Operator', operatorId: 'OP004', permissions: ['read_own', 'write_own'] }],
    ['nce_operator_key_2024_secure', { role: 'operator', name: 'NCE Operator', operatorId: 'OP005', permissions: ['read_own', 'write_own'] }],
    ['public_demo_key_2024', { role: 'public', name: 'Public User', permissions: ['read_public'] }]
]);

// Initialize data store
function initializeData() {
    console.log('🔄 Initializing NTC Bus Tracking System data...');
    
    // Clear existing data
    dataStore.routes.clear();
    dataStore.buses.clear();
    dataStore.trips.clear();
    dataStore.operators.clear();
    dataStore.locations.clear();
    dataStore.apiKeys.clear();
    
    // Load routes
    routeDefinitions.forEach(route => {
        dataStore.routes.set(route.routeId, {
            ...route,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    });
    
    // Load operators
    operatorDefinitions.forEach(operator => {
        dataStore.operators.set(operator.operatorId, {
            ...operator,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    });
    
    // Load buses
    busDefinitions.forEach(bus => {
        const operator = dataStore.operators.get(bus.operatorId);
        dataStore.buses.set(bus.busId, {
            ...bus,
            operatorName: operator?.name || 'Unknown Operator',
            status: 'active',
            lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            nextMaintenance: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    });
    
    // Load trips
    const generatedTrips = generateTrips();
    generatedTrips.forEach(trip => {
        dataStore.trips.set(trip.tripId, trip);
    });
    
    // Load current locations for active buses
    const currentLocations = generateCurrentLocations();
    currentLocations.forEach((location, busId) => {
        dataStore.locations.set(busId, location);
    });
    
    // Load API keys
    apiKeys.forEach((keyData, key) => {
        dataStore.apiKeys.set(key, keyData);
    });
    
    console.log(`✅ Data initialization complete:`);
    console.log(`   📍 Routes: ${dataStore.routes.size}`);
    console.log(`   🚌 Buses: ${dataStore.buses.size}`);
    console.log(`   🎫 Trips: ${dataStore.trips.size}`);
    console.log(`   🏢 Operators: ${dataStore.operators.size}`);
    console.log(`   📍 Active Locations: ${dataStore.locations.size}`);
    console.log(`   🔑 API Keys: ${dataStore.apiKeys.size}`);
}

module.exports = {
    dataStore,
    initializeData,
    generateCurrentLocations
};