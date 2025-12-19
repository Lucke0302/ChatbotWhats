require('dotenv').config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

/**
 * Busca o clima na OpenWeatherMap
 * @param {string} city
 * @returns {string}
 */
async function getWeather(city) {
    if (!city) {
        throw new Error("MISSING_ARGS")
    }
    
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("NON-EXISTENT_CITY")
            }
            if (response.status === 401) {
                throw new Error("KEY_UNAVAILABLE")
            }
            throw new Error(`Erro API: ${response.status}`);
        }

        const data = await response.json();
        
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const wind = data.wind.speed;
        const cityName = data.name;
        const country = data.sys.country;

        // Escolhe um emoji baseado no clima
        let emoji = "🌤️";
        if (description.includes("chuva")) emoji = "🌧️";
        else if (description.includes("nuvens")) emoji = "☁️";
        else if (description.includes("limpo") || description.includes("sol")) emoji = "☀️";
        else if (description.includes("trovoada")) emoji = "⛈️";

        return `${emoji} *Clima em ${cityName} e região, ${country}*\n\n` +
               `🌡️ *Agora:* ${temp}°C (Sensação: ${feelsLike}°C)\n` +
               `💧 *Umidade:* ${humidity}%\n` +
               `💨 *Vento:* ${wind} m/s\n` +
               `📝 *Condição:* ${description.charAt(0).toUpperCase() + description.slice(1)}`;

    } catch (error) {
        console.error("[WeatherHandler] Erro:", error);
        throw new Error("WEATHER_API_ERROR")
    }
}

module.exports = { getWeather };