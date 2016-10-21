(function ($) {


    var MY_AVATAR_ID = '104556134_25-s4';
    var openWeatherApiKey = '6824e1d69b650d6ec6d801d696f488ae';
    var _citiesAdded = 0;

    var $document = $(document);


    var getWeatherForCity = function getWeatherForCity (city, successCb) {
        var weatherApiEndpoint = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=' + openWeatherApiKey;

        $.get(weatherApiEndpoint)
            .done(successCb)
            .fail(errorCb);
    };


    var getForecastForCity = function getForecastForCity (city, successCb) {
        var weatherApiEndpoint = 'http://api.openweathermap.org/data/2.5/forecast?q=' + city + '&APPID=' + openWeatherApiKey;

        $.get(weatherApiEndpoint)
            .done(successCb)
            .fail(errorCb);
    };


    var getWeatherForCities = function getWeatherForCities (citiesArr, successCb) {
        var cities = citiesArr.join(',');
        var weatherApiEndpoint = 'http://api.openweathermap.org/data/2.5/group?id=' + cities +'&units=metric' + '&APPID=' + openWeatherApiKey;

        $.get(weatherApiEndpoint)
            .done(successCb)
            .fail(errorCb);
    };


    /**
     * Returns a bitmoji URL for the provided weather and avatar id
     * @param  {String} weather
     * @param  {String} avatarId
     * @return {String}         bitmoji image url
     */
    var getBitmojiForWeatherAndAvatar = function getBitmojiForWeatherAndAvatar (weather, avatarId) {

        var bitmojiRenderUrl = 'https://render.bitstrips.com/v2/cpanel/COMIC_ID-AVATAR_ID-v1.png';
        var comicId = null;

        switch(weather) {
            case 'Clear':
                comicId = 9991252;
                break;
            case 'Clouds':
                comicId = 10212384;
                break;
            case 'Rain':
                comicId = 10212130;
                break;
            default:
                comicId = 10117641;
        }

        var bitmojiUrl = bitmojiRenderUrl
                            .replace('COMIC_ID', comicId)
                            .replace('AVATAR_ID', avatarId);

        return bitmojiUrl;
    };


    var addCityWeatherSection = function addCityWeatherSection (city, weather, windSpeed) {

        var bitmoji = getBitmojiForWeatherAndAvatar(weather, MY_AVATAR_ID);

        var $bitmojiImage = $('#city-weather .js-bitmoji');
        var $city = $('#city-weather .js-city-name');
        var $weather = $('#city-weather .js-weather');
        var $wind = $('#city-weather .js-wind');

        $bitmojiImage.attr('src', bitmoji);
        $city.text(city);
        $weather.text(weather);
        $wind.text(windSpeed + ' km/h');
    };


    var addToWeatherTable = function addToWeatherTable (city, weather, addToTop) {

        var bitmoji = getBitmojiForWeatherAndAvatar(weather, MY_AVATAR_ID);

        var $weatherTableData = $('#weather-table tbody');
        var $row = $('<tr />');
        var $cityCell = $('<td />');
        var $weatherCell = $('<td />');
        var $bitmojiCell = $('<td />');

        $cityCell.text(city);
        $weatherCell.text(weather);
        $bitmojiCell.html(
            `<img class="weather-table-bitmoji-image" src="${bitmoji}" />`
        );

        $row.append($cityCell)
            .append($weatherCell)
            .append($bitmojiCell);

        if (addToTop) {
            $weatherTableData.prepend($row);
        } else {
            $weatherTableData.append($row);
        }
    };


    var initWeatherAppWithOneCity = function initWeatherAppWithOneCity (cityName) {

        var oneCityApiSuccessCb = function oneCityApiSuccessCb (data) {

            var city = data.name;
            var weather = data.weather[0].main;
            var windSpeed = data.wind.speed;

            addCityWeatherSection(city, weather, windSpeed);
        };

        getWeatherForCity(cityName, oneCityApiSuccessCb);
    };


    var initWeatherAppWithCities = function initWeatherAppWithCities (cities) {

        getWeatherForCities(cities, function (data) {

            // Clear Loading... from table
            $('#weather-table tbody').html('');

            var cities = data.list;
            cities.forEach(function (cityData) {
                var weather = cityData.weather[0].main;
                var cityName = cityData.name;

                addToWeatherTable(cityName, weather);
            });
        });
    };


    /**
     * Initialize the weather app!
     */
    $(window).on('load', function () {

        // One city
        initWeatherAppWithOneCity('Toronto, ON');


        // Lots of cities
        var cities = [
            6167863, // Toronto, ON
            6173331, // Vancouver, BC
            6077243, // Montreal, QC
            6141256, // Saskatoon, SK
            5969423, // Halifax, NS
            6185377, // Yellowknife, NT
            6180550, // Whitehorse, YT
            6183235, // Winnipeg, MB

            3413829, // Reykjavik, Iceland
            2643743, // London, England
            3128760, // Barcelona, Spain
            6545158, // Rome, Italy

            2147714, // Sydney, Australia

            5359488, // Venice Beach, CA
            4164138, // Miami, FL
            5114810 // NYC?
        ];

        initWeatherAppWithCities(cities);
    });


    var addCityToWeatherTable = function (city) {

        getWeatherForCity(city, function (data) {

            var weather = data.weather[0].main;
            var cityName = data.name;

            addToWeatherTable(cityName, weather, true);
        });
    };


    var incrementProgressBar = function () {

        var citiesAddedGoal = 6;
        var progressClasses = [
            'progress-bar-danger',
            'progress-bar-warning',
            'progress-bar-info',
            'progress-bar-success'
        ];
        var $progressBar = $('#progress-metre');

        _citiesAdded++;

        // Reset classes
        progressClasses.forEach(function (progressClass) {
            $progressBar.removeClass(progressClass);
        });

        var percentageOfCitiesAdded = _citiesAdded / citiesAddedGoal * 100;
        var progressClass = null;
        if (percentageOfCitiesAdded >= 75) {
            progressClass = progressClasses[3];
        } else if (percentageOfCitiesAdded >= 50) {
            progressClass = progressClasses[2];
        } else if (percentageOfCitiesAdded >= 25) {
            progressClass = progressClasses[1];
        } else {
            progressClass = progressClasses[0];
        }

        $progressBar.addClass(progressClass);
        $progressBar.css('width', percentageOfCitiesAdded + '%');
    };


    var initAddCityForm = function () {

        var $addCityForm = $('#form-add-city');

        $addCityForm.on('submit', function (event) {

            event.preventDefault();

            var $cityField = $(this).find('#city-name');
            var cityName = $cityField.val();

            addCityToWeatherTable(cityName);
            $cityField.val(''); // Clear city field
            incrementProgressBar();
        });
    };


    $document.ready(initAddCityForm);


    /**
     * Common error callback
     * @param  {object} error
     */
    function errorCb(error) {
        console.error(error);
    }

})(window.jQuery);
