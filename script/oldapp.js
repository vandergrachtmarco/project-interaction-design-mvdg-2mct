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

// 5 TODO: maak updateSun functie
const updateSun = (sunelement, left, bottom, now) => {
    sunelement.style.left = `${left}`
    sunelement.style.bottom = `${bottom}`

    const currentTimeStamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    sunelement.setAttribute('data-time', currentTimeStamp)
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
    // In de functie moeten we eerst wat zaken ophalen en berekenen.

    // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
    const sun = document.querySelector(".js-sun")
    const minutesleft = document.querySelector(".js-time-left")
        // Bepaal het aantal minuten dat de zon al op is.
    const now = new Date();
    const sunriseData = new Date(sunrise * 1000)
    let minutessunup = (now.getHours() * 60 + now.getMinutes()) - (sunriseData.getHours() * 60 + sunriseData.getMinutes())

    const percentage = (100 / totalMinutes) * minutessunup
    const sunleft = percentage
    const sunbottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2
        //korte if else
        // condition ? true : false
        // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
    updateSun(sun, sunleft, sunbottom, now)
        // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
        // We voegen ook de 'is-loaded' class toe aan de body-tag.
        // Vergeet niet om het resterende aantal minuten in te vullen.
    minutesleft.innerHTML = totalMinutes - minutessunup
        // Nu maken we een functie die de zon elke minuut zal updaten
    const t = setInterval(() => {
            if (minutessunup > totalMinutes) {
                clearInterval(t)
                    //enable lightmode
            } else if (minutessunup < 0) {

            } else {
                const now = new Date()
                const left = (100 / totalMinutes) * minutessunup
                const bottom = left < 50 ? left * 2 : (100 - left) * 2

                updateSun(sun, left, bottom, now)
                minutesleft.innerText = totalMinutes - minutessunup
                minutessunup++
            }
        })
        // Bekijk of de zon niet nog onder of reeds onder is
        // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
        // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.

};

//mijn manier
const CalculateAndDisplayData = (totalMinutes, sunrise) => {
    var timestampnow = (Date.now() / 1000) //- 20000 // change time here to test
    var passedtimeperc = ((timestampnow - sunrise) / totalMinutes) * 100
    var timeremaining = totalMinutes * (1 - (passedtimeperc / 100))
    timeremaining = parseInt(timeremaining / 60)
    var bottompercentage = (passedtimeperc <= 50 ? passedtimeperc : (100 - passedtimeperc))

    document.querySelector('.js-sun').setAttribute("data-time", _parseMillisecondsIntoReadableTime(timestampnow))
    document.querySelector('.js-sun').style = ("bottom: " + bottompercentage * 2 + "%; left: " + passedtimeperc + "%;")
    if (timeremaining > 0) {
        document.querySelector('.js-time-left').innerHTML = (timeremaining)
    } else {
        document.querySelector('.js-time-left').innerHTML = "0"
    }

    if (passedtimeperc < 0 || passedtimeperc > 100) {
        /*if (document.querySelector('.js-html').classList.contains('is-day')) {
            document.querySelector('.js-html').className.replace(/(^|\s+)is-day($|\s+)/g, 'is-night')
        }*/
        //werk niet, ga ik well wat mee experimenteren
        document.querySelector(".js-html").classList.add('is-night')
        document.querySelector(".js-html").classList.remove('is-day')
    } else {
        /*if (document.querySelector('.js-html') != null) {
            //document.querySelector('.js-html-night').className.replace(/(^|\s+)extraClass($|\s+)/g, '')
        } */
        document.querySelector(".js-html").classList.add('is-day')
        document.querySelector(".js-html").classList.remove('is-night')
    }
}

// 3 Met de data van de API kunnen we de app opvullen
const showResult = queryResponse => {
    // We gaan eerst een paar onderdelen opvullen
    // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
    document.querySelector('.js-location').innerHTML = `${queryResponse.city.name},${queryResponse.city.country}`
        // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
    document.querySelector('.js-sunrise').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise)
    document.querySelector('.js-sunset').innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset)
        // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
        // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
        //console.log(queryResponse.city.sunset - queryResponse.city.sunrise)
        //console.log(_parseMillisecondsIntoReadableTime(queryResponse.city.sunset - queryResponse.city.sunrise))
    const timediffrence = (queryResponse.city.sunset - queryResponse.city.sunrise)
        //console.log((timediffrence))
        //placeSunAndStartMoving(timediffrence, queryResponse.city.sunrise)
        //setInterval(function() { console.log("test") }, 60 * 100);
    setInterval(CalculateAndDisplayData(timediffrence, queryResponse.city.sunrise), 60 * 1000);

};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async(lat, lon) => {
    // Eerst bouwen we onze url op
    // http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=HIERKOMTJOUWAPPID&units=metric&lang=nl&cnt=1
    const data = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=d44ddd1989d444945aa27bbc13cf4daa&units=metric&lang=nl&cnt=1`)
        .then((r) => r.json())
        .catch((err) => console.error('an error ocorred', err))
    console.log(data)
        // Met de fetch API proberen we de data op te halen.
        // Als dat gelukt is, gaan we naar onze showResult functie.
    showResult(data);
};

document.addEventListener('DOMContentLoaded', function() {
    // 1 We will query the API with longitude and latitude.
    getAPI(50.8027841, 3.2097454);
});