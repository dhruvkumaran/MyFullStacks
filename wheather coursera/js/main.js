const citySelect = document.getElementById('city-select');
const forecastContainer = document.getElementById('forecast');

citySelect.addEventListener("change", function(){
    const selectedValue = citySelect.value;
    if (selectedValue){
        const[lat, lon] = selectedValue.split(",");
        fetchWeatherData(lat, lon);
        console.log("Selected city:", selectedValue);

    }
    else{
        console.log("No city selected");
    }
});


const weatherDescriptions = {
     clearday: "Clear",
     pcloudyday: "Partly Cloudy",
     mcloudyday: "Mostly Cloudy",
     cloudyday: "Cloudy",
     humidday: "Humid",
     lightrainday: "Light Rain",
     oshowerday: "Occasional Shower",
     ishowerday: "Isolated Shower",
     lightsnowday: "Light Snow",
     rainday: "Rainy",
     snowday: "Snow",
     thunderstormday: "Thunderstorm",
     fogday: "Foggy",
     windyday: "Windy",
     cloudynight: "Cloudy",
     lightrainnight: "Light Rain",
     oshowernight: "Occasional Shower",
     ishowernight: "Isolated Shower",
     lightsnownight: "Light Snow",
     rainnight: "Rainy",
     snownight: "Snow",
     thunderstormnight: "Thunderstorm",
     fognight: "Foggy",
     windynight: "Windy",
     clear: "Clear",
    };

    const weatherIcons = {
     clearday: "☀️",
     pcloudyday: "🌤️",
     mcloudyday: "⛅",
     cloudyday: "☁️",
     humidday: "💧",
     lightrainday: "🌦️",
     oshowerday: "🌧️",
     ishowerday: "🌧️",
     lightsnowday: "🌨️",
     rainday: "🌧️",
     snowday: "❄️",
     thunderstormday: "⛈️",
     fogday: "🌫️",
      windyday: "💨"
};


async function fetchWeatherData(lat, lon){
    document.getElementById("loading").style.display = "block";
    const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;
    
    console.log("Fetching Weather data from:", apiUrl);
    try{
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        const init = data.init;

         const initDate = new Date(
         parseInt(init.slice(0, 4)),
         parseInt(init.slice(4, 6)) - 1,
         parseInt(init.slice(6, 8)),
         parseInt(init.slice(8, 10))
        );

       const forecastByDay = groupForecastByDay(data.dataseries, initDate);

       console.log("Grouped Forecast by Day:", forecastByDay);


        console.log("Weather data received:", data);
        displayForecast(data.dataseries);
        const dailyContainer = document.getElementById("daily-forecast");
        dailyContainer.innerHTML = ""; // Clear old cards

        const limitedDays = Object.entries(forecastByDay).slice(0, 7);

        limitedDays.forEach(([day, points]) => {
        const card = createForecastCard(day, points);
        dailyContainer.appendChild(card);
        document.getElementById("loading").style.display = "none";

});

        }
        
    catch (error) {
        console.log("error fetching weather data:", error.message);
    }
}






function getDateFromTimepoint(timepoint, initDate) {
  const msOffset = timepoint * 60 * 60 * 1000; // Convert hours to milliseconds
  return new Date(initDate.getTime() + msOffset);
}




function groupForecastByDay(dataSeries, initDate) {
  const forecastByDay = {};

  dataSeries.forEach((point) => {
    const date = getDateFromTimepoint(point.timepoint, initDate);
    const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!forecastByDay[dayKey]) {
      forecastByDay[dayKey] = [];
    }

    forecastByDay[dayKey].push({
      ...point,
      actualDate: date,
    });
  });

  return forecastByDay;
}






function displayForecast(dataSeries){
    


    forecastContainer.innerHTML = "";
     
    const firstSeven = dataSeries.slice(0, 7);

    firstSeven.forEach((dataPoint, index) => {
        const card = document.createElement("div");
        card.classList.add("col");
        const forecastTime = new Date(Date.now() + dataPoint.timepoint * 60 * 60 * 1000);
        const dateString = forecastTime.toLocaleString();
        
        const weatherText = weatherDescriptions[dataPoint.weather] || dataPoint.weather;
        const weatherIcon = weatherIcons[dataPoint.weather] || "";
    
        card.innerHTML = `
        <div class="card shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">${dateString}</h5>
                <h5 class="card-title">+${dataPoint.timepoint} hrs</h5>
                <p class="card-text">
                <strong>🌡️Temperature:</strong> ${dataPoint.temp2m}°C<br>
                <strong>${weatherIcon} Weather:</strong> ${weatherText}<br>
                <strong>☁️ Cloud Cover:</strong> ${dataPoint.cloudcover}%<br>
                <strong>💧Humidity:</strong> ${dataPoint.rh2m}<br>
                <strong>💨Wind Speed:</strong> ${dataPoint.wind10m.speed} m/s<br>
                <strong>🧭Wind Direction:</strong> ${dataPoint.wind10m.direction}°<br>
                <strong>🌧️Precipitation:</strong> ${dataPoint.prec_type}<br>
            </p>
        </div>
    </div>
        `;
        forecastContainer.appendChild(card);
    });
}
const darkModeToggle = document.getElementById("darkModeToggle");

darkModeToggle.addEventListener("change", function () {
    if (this.checked) {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
    } else {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
    }
});





// new function for day wise card display
function createForecastCard(day, points) {
  // Average temperature
  const avgTemp = Math.round(
    points.reduce((sum, p) => sum + p.temp2m, 0) / points.length
  );

  const weather = points[0].weather;
  const cloudCover = points[0].cloudcover;
  const humidity = points[0].rh2m;

  const weatherText = weatherDescriptions[weather] ||weather;
  const weatherIcon = weatherIcons[weather] || "";

  const card = document.createElement("div");
  card.className = "col";

  card.innerHTML = `
    <div class="card h-100 shadow-sm rounded-4 border-0">
      <div class="card-body">
        <h5 class="card-title">${day}</h5>
        <p class="card-text">
          <strong>🌡️Avg Temp:</strong> ${avgTemp}°C<br>
          <strong>${weatherIcon}Weather:</strong> ${weatherText}<br>
          <strong>☁️ Cloud Cover:</strong> ${cloudCover}%<br>
          <strong>💧Humidity:</strong> ${humidity}
        </p>
      </div>
    </div>
  `;

  return card;
}

