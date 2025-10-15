// API Configuration
const API_BASE_URL = 'http://localhost:4000/api';

// Chart instances
let vendorChart, passengerChart, durationChart, hourlyChart;

// Current state
let currentPage = 1;
const pageSize = 10;
let currentFilters = {};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set last updated timestamp
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
    
    // Load initial data
    loadDashboardData();
    
    // Set up event listeners
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // Set default date range to last 7 days
    setDefaultDateRange();
});

function setDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
}

async function loadDashboardData(filters = {}) {
    try {
        showLoadingState();
        
        // Load all data in parallel
        const [statsData, tripsData] = await Promise.all([
            fetchStats(filters),
            fetchTrips({ ...filters, page: currentPage, limit: pageSize })
        ]);
        
        // Update UI with fetched data
        updateSummaryStats(statsData);
        populateTripsTable(tripsData.trips || []);
        generatePagination(tripsData.pagination?.totalPages || 1);
        updateChartsWithData(statsData);
        
        // Hide loading indicator
        hideLoadingState();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load data. Please check if the backend server is running.');
        hideLoadingState();
    }
}

async function fetchStats(filters = {}) {
    try {
        const response = await axios.get(`${API_BASE_URL}/stats`, { 
            params: filters,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        // Return default stats if API fails
        return {
            totalTrips: 0,
            avgPassengers: 0,
            avgDuration: 0,
            longestTrip: 0,
            vendorDistribution: { 1: 0, 2: 0 },
            passengerDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, "5+": 0 },
            durationDistribution: { short: 0, medium: 0, long: 0 },
            hourlyDistribution: Array(24).fill(0)
        };
    }
}

async function fetchTrips(filters = {}) {
    try {
        const response = await axios.get(`${API_BASE_URL}/trips`, { 
            params: filters,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching trips:', error);
        // Return empty data if API fails
        return { trips: [], pagination: { totalPages: 1 } };
    }
}

function updateSummaryStats(stats) {
    document.getElementById('totalTrips').textContent = stats.totalTrips?.toLocaleString() || '0';
    document.getElementById('avgPassengers').textContent = stats.avgPassengers || '0.0';
    document.getElementById('avgDuration').textContent = `${stats.avgDuration || 0} min`;
    document.getElementById('longestTrip').textContent = `${stats.longestTrip || 0} min`;
}

function updateChartsWithData(stats) {
    // Initialize charts if they don't exist
    if (!vendorChart) {
        initializeCharts();
    }
    
    // Update Vendor Chart
    vendorChart.data.datasets[0].data = [
        stats.vendorDistribution?.[1] || 0,
        stats.vendorDistribution?.[2] || 0
    ];
    vendorChart.update();
    
    // Update Passenger Chart
    passengerChart.data.datasets[0].data = [
        stats.passengerDistribution?.[1] || 0,
        stats.passengerDistribution?.[2] || 0,
        stats.passengerDistribution?.[3] || 0,
        stats.passengerDistribution?.[4] || 0,
        stats.passengerDistribution?.["5+"] || 0
    ];
    passengerChart.update();
    
    // Update Duration Chart
    const durationData = stats.durationDistribution || {};
    durationChart.data.datasets[0].data = [
        durationData.short || 0,
        durationData.medium || 0,
        durationData.long || 0
    ];
    durationChart.update();
    
    // Update Hourly Chart
    hourlyChart.data.datasets[0].data = stats.hourlyDistribution || Array(24).fill(0);
    hourlyChart.update();
}

function initializeCharts() {
    // Vendor Chart
    const vendorCtx = document.getElementById('vendorChart').getContext('2d');
    vendorChart = new Chart(vendorCtx, {
        type: 'doughnut',
        data: {
            labels: ['Vendor 1', 'Vendor 2'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)'
                ],
                borderColor: [
                    'rgb(52, 152, 219)',
                    'rgb(46, 204, 113)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Passenger Chart
    const passengerCtx = document.getElementById('passengerChart').getContext('2d');
    passengerChart = new Chart(passengerCtx, {
        type: 'bar',
        data: {
            labels: ['1', '2', '3', '4', '5+'],
            datasets: [{
                label: 'Number of Trips',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgb(52, 152, 219)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Trips'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Passenger Count'
                    }
                }
            }
        }
    });

    // Duration Chart
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    durationChart = new Chart(durationCtx, {
        type: 'pie',
        data: {
            labels: ['Short (< 10 min)', 'Medium (10-30 min)', 'Long (> 30 min)'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(241, 196, 15, 0.7)'
                ],
                borderColor: [
                    'rgb(52, 152, 219)',
                    'rgb(46, 204, 113)',
                    'rgb(241, 196, 15)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Hourly Chart
    const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
    hourlyChart = new Chart(hourlyCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Number of Trips',
                data: Array(24).fill(0),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Trips'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hour of Day'
                    }
                }
            }
        }
    });
}

function populateTripsTable(trips) {
    const tableBody = document.getElementById('tripsTableBody');
    tableBody.innerHTML = '';
    
    if (trips.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="no-data">No trips found with current filters</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    trips.forEach(trip => {
        const row = document.createElement('tr');
        
        // Format pickup time for display
        const pickupDate = new Date(trip.pickup_datetime);
        const formattedTime = pickupDate.toLocaleString();
        
        // Calculate duration in minutes
        const durationMinutes = Math.floor(trip.trip_duration / 60);
        
        // Format coordinates for display
        const pickupCoords = `${trip.pickup_latitude?.toFixed(4) || 'N/A'}, ${trip.pickup_longitude?.toFixed(4) || 'N/A'}`;
        const dropoffCoords = `${trip.dropoff_latitude?.toFixed(4) || 'N/A'}, ${trip.dropoff_longitude?.toFixed(4) || 'N/A'}`;
        
        row.innerHTML = `
            <td>${trip.id || 'N/A'}</td>
            <td>Vendor ${trip.vendor_id || 'N/A'}</td>
            <td>${formattedTime}</td>
            <td>${durationMinutes} min</td>
            <td>${trip.passenger_count || '0'}</td>
            <td>${pickupCoords}</td>
            <td>${dropoffCoords}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function generatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&laquo; Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadDashboardData(currentFilters);
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page buttons (show max 5 pages)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = i === currentPage ? 'page-btn active' : 'page-btn';
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            loadDashboardData(currentFilters);
        });
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = 'Next &raquo;';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadDashboardData(currentFilters);
        }
    });
    pagination.appendChild(nextBtn);
}

function applyFilters() {
    showLoadingState();
    
    // Get filter values
    const vendorFilter = document.getElementById('vendorFilter').value;
    const passengerFilter = document.getElementById('passengerFilter').value;
    const durationFilter = document.getElementById('durationFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Build filters object
    currentFilters = {};
    
    if (vendorFilter !== 'all') {
        currentFilters.vendor_id = vendorFilter;
    }
    
    if (passengerFilter !== 'all') {
        currentFilters.passenger_count = passengerFilter;
    }
    
    if (durationFilter !== 'all') {
        currentFilters.duration_range = durationFilter;
    }
    
    if (startDate) {
        currentFilters.start_date = startDate;
    }
    
    if (endDate) {
        currentFilters.end_date = endDate;
    }
    
    if (sortBy) {
        currentFilters.sort_by = sortBy;
    }
    
    // Reset to first page when applying new filters
    currentPage = 1;
    
    // Load data with filters
    loadDashboardData(currentFilters);
    
    // Update last updated timestamp
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
}

function resetFilters() {
    // Reset all filter dropdowns to their default values
    document.getElementById('vendorFilter').value = 'all';
    document.getElementById('passengerFilter').value = 'all';
    document.getElementById('durationFilter').value = 'all';
    document.getElementById('sortBy').value = 'pickup_datetime';
    
    // Reset date range to default
    setDefaultDateRange();
    
    // Reset current filters and page
    currentFilters = {};
    currentPage = 1;
    
    // Reload data
    loadDashboardData();
    
    // Show success message
    showSuccess('Filters reset successfully!');
}

function showLoadingState() {
    document.getElementById('tableLoading').style.display = 'flex';
    document.getElementById('tripsTable').style.display = 'none';
    
    // Add loading class to stats cards
    document.querySelectorAll('.stat-value').forEach(stat => {
        stat.textContent = '...';
    });
    
    // Add loading class to charts
    document.querySelectorAll('.chart-container').forEach(container => {
        container.classList.add('loading');
    });
}

function hideLoadingState() {
    document.getElementById('tableLoading').style.display = 'none';
    document.getElementById('tripsTable').style.display = 'table';
    
    // Remove loading class from charts
    document.querySelectorAll('.chart-container').forEach(container => {
        container.classList.remove('loading');
    });
}

function showError(message) {
    // Simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

function showSuccess(message) {
    // Simple success notification
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setDefaultDateRange,
        updateSummaryStats,
        populateTripsTable,
        generatePagination
    };
}