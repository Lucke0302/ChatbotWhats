require('dotenv').config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

/**
 * Busca o clima na OpenWeatherMap
 * @param {string} city
 * @returns {string}
 */
async function getWeather(city) {
    
    if (!city) throw new Error("MISSING_ARGS")
    
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

async function getNextDayForecast(city) {
    if (!city) throw new Error("MISSING_ARGS");

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=pt_br`;
        
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) throw new Error("NON-EXISTENT_CITY");
            if (response.status === 401) throw new Error("KEY_UNAVAILABLE");
            throw new Error(`Erro API: ${response.status}`);
        }

        const data = await response.json();

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const forecastList = data.list.filter(item => item.dt_txt.startsWith(tomorrowStr));

        if (forecastList.length === 0) {
            return "⚠️ Não encontrei dados de previsão para amanhã.";
        }

        // Função auxiliar para pegar o horário mais próximo do desejado (Baseado em UTC)
        // Considerando Brasil (UTC-3 aproximadamente):
        // Manhã (~9h BRT) -> busca 12h UTC
        // Tarde (~15h BRT) -> busca 18h UTC
        // Noite (~21h BRT) -> busca 21h UTC ou 00h (do dia seguinte). 
        const findClosest = (targetHourUTC) => {
            return forecastList.reduce((prev, curr) => {
                const currHour = parseInt(curr.dt_txt.split(' ')[1].split(':')[0]);
                const prevHour = parseInt(prev.dt_txt.split(' ')[1].split(':')[0]);
                return (Math.abs(currHour - targetHourUTC) < Math.abs(prevHour - targetHourUTC) ? curr : prev);
            });
        };

        const morning = findClosest(12);
        const afternoon = findClosest(18);
        const night = findClosest(23);

        const formatLine = (label, item) => {
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].description;
            
            let emoji = "🌤️";
            if (desc.includes("chuva")) emoji = "🌧️";
            else if (desc.includes("nuvens")) emoji = "☁️";
            else if (desc.includes("limpo") || desc.includes("sol")) emoji = "☀️";
            else if (desc.includes("trovoada")) emoji = "⛈️";


            const descFormatted = desc.charAt(0).toUpperCase() + desc.slice(1);
            
            return `*${label}:* ${emoji} ${temp}°C (${descFormatted})`;
        };

        return `📅 *Previsão para Amanhã em ${data.city.name}*\n\n` +
               `${formatLine("Manhã", morning)}\n` +
               `${formatLine("Tarde", afternoon)}\n` +
               `${formatLine("Noite", night)}`;

    } catch (error) {
        console.error("[ForecastHandler] Erro:", error);
        throw new Error("WEATHER_API_ERROR");
    }
}

module.exports = { getWeather, getNextDayForecast };