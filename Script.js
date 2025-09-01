// Replace with your own OpenWeatherMap key
const apiKey = "8371636aa78b74b11935a79e7abcb2b7";

// Cache DOM elements
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const tempDiv = document.getElementById("temp-div");
const weatherInfoDiv = document.getElementById("weather-info");
const weatherIcon = document.getElementById("weather-icon");
const hourlyForecastDiv = document.getElementById("hourly-forecast");
const hourlyHeading = document.getElementById("hourly-heading");

// Handle submit
form.addEventListener("submit", function (e) {
  e.preventDefault();
  getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    alert("Please enter a city");
    return;
  }

  clearDisplays();

  const encodedCity = encodeURIComponent(city);
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${apiKey}&units=metric`;

  try {
    // Current weather
    const currentRes = await fetch(currentWeatherUrl);
    const currentData = await currentRes.json();
    if (!currentRes.ok) {
      throw new Error(currentData.message || "Unable to fetch current weather");
    }
    displayWeather(currentData);

    // Forecast
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();
    if (!forecastRes.ok) {
      throw new Error(forecastData.message || "Unable to fetch forecast");
    }
    // First 8 entries cover about 24 hours in 3 hour steps
    displayHourlyForecast(forecastData.list.slice(0, 8));
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  }
}

function clearDisplays() {
  weatherInfoDiv.innerHTML = "";
  hourlyForecastDiv.innerHTML = "";
  tempDiv.innerHTML = "";
  hourlyHeading.style.display = "none";
  weatherIcon.style.display = "none";
  weatherIcon.removeAttribute("src");
  weatherIcon.removeAttribute("alt");
}

function displayWeather(data) {
  if (String(data.cod) === "404") {
    weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    return;
  }

  const cityName = data.name;
  const temperature = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  tempDiv.innerHTML = `<p>${temperature} °C</p>`;
  weatherInfoDiv.innerHTML = `
    <p>${cityName}</p>
    <p>${toTitleCase(description)}</p>
  `;

  weatherIcon.src = iconUrl;
  weatherIcon.alt = description;
  weatherIcon.style.display = "block";
}

function displayHourlyForecast(items) {
  if (!items || items.length === 0) {
    hourlyHeading.style.display = "none";
    return;
  }

  hourlyHeading.style.display = "block";
  hourlyForecastDiv.innerHTML = "";

  items.forEach((item) => {
    const dateTime = new Date(item.dt * 1000);
    const timeLabel = dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const temperature = Math.round(item.main.temp);
    const iconCode = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const html = `
      <div class="hourly-item">
        <span>${timeLabel}</span>
        <img src="${iconUrl}" alt="Hourly Weather Icon" />
        <span>${temperature} °C</span>
      </div>
    `;
    hourlyForecastDiv.insertAdjacentHTML("beforeend", html);
  });
}

function toTitleCase(text) {
  return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}
