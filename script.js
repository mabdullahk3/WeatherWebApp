const apiKey = 'ed1d944ff7ad3ff52830c829d5f89d23'; 
let forecastData = []; 
let currentPage = 1; 
const itemsPerPage = 5; 
const defaultCity = 'Rawalpindi'; 
let barChart, doughnutChart, tempLineChart;
let originalForecastData = [];

// Fetch current weather data
function fetchWeather(city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found.');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherDashboard(data);
        })
        .catch(error => {
            alert(error.message);
        });
}

// --- Display Weather on the Dashboard ---
function displayWeatherDashboard(data) {
    const weatherData = document.getElementById('weather-data');
    if (!weatherData) {
        console.error("Element with ID 'weather-data' not found.");
        return;
    }

    const weatherIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherData.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <div class="weather-info">
            <img src="${weatherIcon}" alt="Weather Icon" class="weather-icon">
            <span class="temperature">${data.main.temp} °C</span>
        </div>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p class="weather-condition">Weather Condition: ${data.weather[0].description}</p>
    `;
}

// --- Fetch Weather Forecast ---
function fetchWeatherForecast(city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            forecastData = data.list;
            originalForecastData = [...forecastData];
            currentPage = 1; 
            displayForecast();
            updatePagination(); 
            updateCharts(forecastData);
        })
        .catch(error => {
            console.error(error);
        });
}

// --- Display Forecast in Table ---
function displayForecast() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) {
        console.error("Element with ID 'table-body' not found.");
        return;
    }

    tableBody.innerHTML = '';  // Clear previous table data

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    forecastData.slice(start, end).forEach(forecast => {
        const date = new Date(forecast.dt_txt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const forecastRow = `
            <tr>
                <td>${formattedDate} ${formattedTime}</td>
                <td>${forecast.main.temp} °C</td>
                <td>${forecast.main.humidity} %</td>
                <td>${forecast.weather[0].description}</td>
            </tr>
        `;
        tableBody.innerHTML += forecastRow;  // Append rows
    });
}

// --- Pagination Logic ---
function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const totalPages = Math.ceil(forecastData.length / itemsPerPage);

    // Update page info
    if (pageInfo) {
        pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    }

    // Disable/enable pagination buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

// Pagination button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayForecast();
                updatePagination();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(forecastData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayForecast();
                updatePagination();
            }
        });
    }

    // Event listeners for sorting and filtering buttons
    const sortAscBtn = document.getElementById('sort-asc');
    const sortDescBtn = document.getElementById('sort-desc');
    const filterRainyBtn = document.getElementById('filter-rainy');
    const filterHighestBtn = document.getElementById('filter-highest');
    const resetBtn = document.getElementById('reset');

    if (sortAscBtn) {
        sortAscBtn.addEventListener('click', function () {
            forecastData.sort((a, b) => a.main.temp - b.main.temp); // Sort ascending
            displayForecast();
        });
    }

    if (sortDescBtn) {
        sortDescBtn.addEventListener('click', function () {
            forecastData.sort((a, b) => b.main.temp - a.main.temp); // Sort descending
            displayForecast();
        });
    }

    if (filterRainyBtn) {
        filterRainyBtn.addEventListener('click', function () {
            const rainyForecasts = forecastData.filter(forecast => forecast.weather[0].main.toLowerCase() === 'rain');
            displayFilteredForecast(rainyForecasts);
        });
    }

    if (filterHighestBtn) {
        filterHighestBtn.addEventListener('click', function () {
            const highestTemp = Math.max(...forecastData.map(forecast => forecast.main.temp));
            const highestForecasts = forecastData.filter(forecast => forecast.main.temp === highestTemp);
            displayFilteredForecast(highestForecasts);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            forecastData = [...originalForecastData]; 
            currentPage = 1; 
            displayForecast(); 
            updatePagination(); 
        });
    }
});

// Function to display filtered forecasts
function displayFilteredForecast(filteredData) {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) {
        console.error("Element with ID 'table-body' not found.");
        return;
    }

    tableBody.innerHTML = ''; // Clear previous table data

    filteredData.forEach(forecast => {
        const date = new Date(forecast.dt_txt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const forecastRow = `
            <tr>
                <td>${formattedDate} ${formattedTime}</td>
                <td>${forecast.main.temp} °C</td>
                <td>${forecast.main.humidity} %</td>
                <td>${forecast.weather[0].description}</td>
            </tr>
        `;
        tableBody.innerHTML += forecastRow; // Append rows
    });
}

function updateCharts(forecastData) {
    const labels = [];  // To store date/times
    const temperatureData = [];  // To store temperature values

    // Loop through forecastData to prepare chart data
    forecastData.forEach(forecast => {
        const date = new Date(forecast.dt_txt);
        const formattedDate = date.toLocaleDateString();

        // Add date labels
        labels.push(formattedDate);

        // Add temperature data for Bar Chart and Line Chart
        temperatureData.push(forecast.main.temp);
    });

    // Update Bar Chart with temperature data
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = temperatureData; // Set temperature data
    barChart.update();

    // Update Line Chart with temperature data
    tempLineChart.data.labels = labels;
    tempLineChart.data.datasets[0].data = temperatureData; // Set temperature data
    tempLineChart.update();

    // Prepare data for Doughnut Chart
    const conditionCounts = {};  // To store weather condition counts for Doughnut chart
    forecastData.forEach(forecast => {
        const condition = forecast.weather[0].main;
        if (conditionCounts[condition]) {
            conditionCounts[condition]++;
        } else {
            conditionCounts[condition] = 1;
        }
    });

    // Update Doughnut Chart with weather condition data
    const conditionLabels = Object.keys(conditionCounts);
    const conditionData = Object.values(conditionCounts);
    doughnutChart.data.labels = conditionLabels;
    doughnutChart.data.datasets[0].data = conditionData;
    doughnutChart.update();
}

function initializeCharts() {
    const barCtx = document.getElementById('BarChart').getContext('2d');
    const doughnutCtx = document.getElementById('DoughnutChart').getContext('2d');
    const lineCtx = document.getElementById('tempLineChart').getContext('2d');

    // Initialize Bar Chart
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Initialize Doughnut Chart
    doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                label: 'Weather Conditions',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }]
        }
    });

    // Initialize Line Chart
    tempLineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                fill: false,
                borderColor: 'rgba(255, 159, 64, 1)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', function () {
    fetchWeather(defaultCity);
    fetchWeatherForecast(defaultCity);
    initializeCharts(); 
});

// Event listener for the form submission
// Event listener for the search button click
document.getElementById('search-btn').addEventListener('click', function () {
    const cityInput = document.getElementById('city').value; // Use the correct input ID
    if (cityInput) {
        fetchWeather(cityInput);
        fetchWeatherForecast(cityInput);
    } else {
        alert("Please enter a city name.");
    }
});

document.getElementById('chatbot-toggle').addEventListener('click', function() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    chatbotContainer.style.display = chatbotContainer.style.display === 'none' || chatbotContainer.style.display === '' ? 'block' : 'none';
});