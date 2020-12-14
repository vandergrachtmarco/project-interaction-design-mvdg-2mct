var globData;

// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
    //Get hours from milliseconds
    const date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    const hours = '0' + date.getHours();
    // Minutes part from the timestamp
    const minutes = '0' + date.getMinutes();
    // Seconds part from the timestamp (gebruiken we nu niet)
    // const seconds = '0' + date.getSeconds();

    // Will display time in 10:30(:23) format
    return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

function _parseMillisecondsIntoReadableDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const month = '0' + date.getMonth();
    const day = '0' + date.getDate();
    return day.substr(-2) + '/' + month.substr(-2); //  + ':' + s
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            break;
    }
    getAPI(50.82803, 3.26487)
}


var tempChart
var precipitationChart

function loadcharts(times, temps, precipitation) {
    try {
        tempChart.destroy()
        precipitationChart.destroy()
    } catch {
        //ignore
    }

    //console.log(temps[0])

    if (temps[0] == null) {
        var text = "Precipitation volume in mm"
    } else {
        var text = "Chance of precipitation in %"

        var ctx = document.getElementById('tempChart').getContext('2d')
        tempChart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: times,
                datasets: [{
                    label: 'Temperature in °C',
                    borderColor: 'rgb(114, 79, 255)',
                    data: temps
                }]
            },

            // Configuration options go here
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Temperature in °C'
                }
            }
        })

    }

    var ctx = document.getElementById('precipitationChart').getContext('2d')
    precipitationChart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: times,
            datasets: [{
                label: text,
                borderColor: 'rgb(114, 79, 255)',
                data: precipitation
            }]
        },

        // Configuration options go here
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: text
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })
}

const showDaily = queryResponse => {

    var times = []
    var temps = []
    var precipitation = []

    for (var i = 0; i < queryResponse.daily.length; i++) {
        var obj = queryResponse.daily[i];

        times.push(_parseMillisecondsIntoReadableDate(obj.dt))
        temps.push(obj.temp.day)
        precipitation.push(obj.pop * 100)

        //console.log(obj.temp)
    }

    loadcharts(times, temps, precipitation)
};

const showHourly = queryResponse => {

    var times = []
    var temps = []
    var precipitation = []

    for (var i = 0; i < ((queryResponse.hourly.length / 2) + 1); i = i + 3) {
        var obj = queryResponse.hourly[i];

        times.push(_parseMillisecondsIntoReadableTime(obj.dt))
        temps.push(obj.temp)
        precipitation.push(obj.pop * 100)

        //console.log(obj.temp)
    }

    loadcharts(times, temps, precipitation)
};

const showMinutely = queryResponse => {

    var times = []
    var temps = []
    var precipitation = []

    for (var i = 0; i < queryResponse.minutely.length; i = i + 5) {
        var obj = queryResponse.minutely[i];

        times.push(_parseMillisecondsIntoReadableTime(obj.dt))
        precipitation.push(obj.precipitation)

        //console.log(obj.precipitation)
    }

    loadcharts(times, temps, precipitation)
};

const showCurrent = queryResponse => {

    document.querySelector('.js-location').innerHTML = `${queryResponse.name},${queryResponse.sys.country} | ${queryResponse.main.temp}°C`
};


// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async(lat, lon) => {
    // Eerst bouwen we onze url op
    // http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=HIERKOMTJOUWAPPID&units=metric&lang=nl&cnt=1
    const data = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current&appid=fafa68bb296d3af5b0c380861477de3f&units=metric`)
        .then((r) => r.json())
        .catch((err) => console.error('an error ocorred', err))
    console.log(data)
        // Met de fetch API proberen we de data op te halen.
        // Als dat gelukt is, gaan we naar onze showResult functie.
    showHourly(data)
    globData = data

    const currentdata = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=fafa68bb296d3af5b0c380861477de3f&units=metric`)
        .then((r) => r.json())
        .catch((err) => console.error('an error ocorred', err))
    console.log(currentdata)

    showCurrent(currentdata)
};

const getAPIbyPos = async(position) => {
    // Eerst bouwen we onze url op
    // http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=HIERKOMTJOUWAPPID&units=metric&lang=nl&cnt=1
    const data = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&exclude=current&appid=fafa68bb296d3af5b0c380861477de3f&units=metric`)
        .then((r) => r.json())
        .catch((err) => console.error('an error ocorred', err))
        //console.log(data)
        // Met de fetch API proberen we de data op te halen.
        // Als dat gelukt is, gaan we naar onze showResult functie.
    showHourly(data)
    globData = data

    const currentdata = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=fafa68bb296d3af5b0c380861477de3f&units=metric`)
        .then((r) => r.json())
        .catch((err) => console.error('an error ocorred', err))
        //console.log(currentdata)

    showCurrent(currentdata)
};


document.addEventListener('DOMContentLoaded', function() {
    // 1 We will query the API with longitude and latitude.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getAPIbyPos, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
        getAPI(50.8027841, 3.2097454)
    }

    //console.log(globData)

    document.getElementById("js-week").addEventListener("click", function() {
        document.querySelector(".js-temp").classList.remove('is-hour')
        showDaily(globData)
    });
    document.getElementById("js-day").addEventListener("click", function() {
        document.querySelector(".js-temp").classList.remove('is-hour')
        showHourly(globData)
    });
    document.getElementById("js-hour").addEventListener("click", function() {
        document.querySelector(".js-temp").classList.add('is-hour')
        showMinutely(globData)
    });
});