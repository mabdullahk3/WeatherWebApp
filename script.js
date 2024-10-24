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

    tableBody.innerHTML = '';  
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
        tableBody.innerHTML += forecastRow;  
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

    tableBody.innerHTML = ''; 

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
        tableBody.innerHTML += forecastRow; 
    });
}

// Function to initialize the charts
function initializeCharts() {
    const barCtx = document.getElementById('BarChartCanvas').getContext('2d');
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
                y: { beginAtZero: true }
            }
        }
    });

    // Doughnut Chart configuration
    const doughnutCtx = document.getElementById('DoughnutChartCanvas').getContext('2d');
    doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                label: 'Weather Condition',
                data: [0,0],
                backgroundColor: ['#FF6384', '#36A2EB'],
                hoverOffset: 4
            }]
        }
    });

    // Line Chart configuration
    const lineCtx = document.getElementById('TempLineChartCanvas').getContext('2d');
    tempLineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }]
        }
    });
}

// Update charts with forecast data
function updateCharts(forecastData) {
    const labels = forecastData.map(forecast => new Date(forecast.dt_txt).toLocaleString());
    const temperatures = forecastData.map(forecast => forecast.main.temp);
    
    // Update bar chart
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = temperatures;
    barChart.update();

    // Update doughnut chart
    const weatherConditions = forecastData.map(forecast => forecast.weather[0].main);
    const clearCount = weatherConditions.filter(condition => condition.toLowerCase() === 'clear').length;
    const rainCount = weatherConditions.filter(condition => condition.toLowerCase() === 'rain').length;

    doughnutChart.data.labels = ['Clear', 'Rain'];
    doughnutChart.data.datasets[0].data = [clearCount, rainCount];
    doughnutChart.update();

    // Update line chart
    tempLineChart.data.labels = labels;
    tempLineChart.data.datasets[0].data = temperatures;
    tempLineChart.update();
}

// Function to show a chart in the modal
function showChart(chartType) {
    const modal = document.getElementById('chartModal');
    const barCanvas = document.getElementById('BarChartCanvas');
    const doughnutCanvas = document.getElementById('DoughnutChartCanvas');
    const lineCanvas = document.getElementById('TempLineChartCanvas');

    // Show the modal
    modal.style.display = 'block'; 

    // Clear all canvases
    barCanvas.style.display = 'none';
    doughnutCanvas.style.display = 'none';
    lineCanvas.style.display = 'none';

    // Display the selected chart
    if (chartType === 'BarChart') {
        barCanvas.style.display = 'block'; 
        barChart.data.labels = forecastData.map(forecast => new Date(forecast.dt_txt).toLocaleDateString());
        barChart.data.datasets[0].data = forecastData.map(forecast => forecast.main.temp);
        barChart.update();
    } else if (chartType === 'DoughnutChart') {
        doughnutCanvas.style.display = 'block'; 
        doughnutChart.data.labels = ['Clear', 'Rain'];
        const weatherConditions = forecastData.map(forecast => forecast.weather[0].main);
        const clearCount = weatherConditions.filter(condition => condition.toLowerCase() === 'clear').length;
        const rainCount = weatherConditions.filter(condition => condition.toLowerCase() === 'rain').length;
        doughnutChart.data.datasets[0].data = [clearCount, rainCount];
        doughnutChart.update();
    } else if (chartType === 'tempLineChart') {
        lineCanvas.style.display = 'block'; 
        tempLineChart.data.labels = forecastData.map(forecast => new Date(forecast.dt_txt).toLocaleDateString());
        tempLineChart.data.datasets[0].data = forecastData.map(forecast => forecast.main.temp);
        tempLineChart.update();
    }
}

// Close chart modal
function closeChart() {
    const modal = document.getElementById('chartModal');
    modal.style.display = 'none';
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', function () {
    fetchWeather(defaultCity);
    fetchWeatherForecast(defaultCity);
    initializeCharts(); 
});

document.getElementById('search-btn').addEventListener('click', function () {
    const cityInput = document.getElementById('city').value;
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

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('send-btn').addEventListener('click', function() {
        const userInput = document.getElementById('user-input').value.trim();
        const chatBody = document.getElementById('chatbot-response');

        if (userInput) {
            // Add the user's message to the chat window
            chatBody.innerHTML += `<div class="message user" style="color:white">${userInput}</div>`;

            // Clear the input field
            document.getElementById('user-input').value = '';

            // Generate a response from the bot
            const botResponse = generateBotResponse(userInput);

            // Add the bot's response to the chat window
            chatBody.innerHTML += `<div class="message bot">${botResponse}</div>`;

            // Scroll to the latest message
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

    function generateBotResponse(userInput) {
        if (userInput.toLowerCase().includes('hello')) {
            return 'Hello! How can I assist you today?';
        } else if (userInput.toLowerCase().includes('temperature')) {
            return 'Please specify the day for the temperature details.';
        } else {
            return 'Sorry, I did not understand that. Can you rephrase?';
        }
    }
});
