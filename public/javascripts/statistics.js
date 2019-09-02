function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateGroupedBarChart(serverData) {
    var colors = [];
    var labels = [];
    var data = [];    
 
    serverData.diseases.forEach(function(disease) {
        colors.push(getRandomColor());
        labels.push(disease.country);
        data.push(disease.cases);
    })

    new Chart(document.getElementById('ChartPie'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Number of cases",
                    backgroundColor: colors,
                    data: data
                }
            ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: "Total number of cases for each country"
            },
            responsive: false,
            scales: {
                xAxes: [{
                    barPercentage: 0.4
                }]
            }
        }
    });
    main = document.getElementById("main-display");
}


function generateDoughnutChart(serverData) {
    var colors = [];
    var labels = [];
    var data = [];
    serverData.diseases.forEach(function(disease) {
        colors.push(getRandomColor());
        labels.push(disease.disease);
        data.push(disease.cases);
    })

    new Chart(document.getElementById('ChartPie').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Number of cases",
                    backgroundColor: colors,
                    data: data
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Number of cases for each disease in ' + serverData.diseases[0].country
            }
        }
    });
}

function generateBarChart(serverData) {    
    var colors = [];
    var labels = [];
    var data = [];
    serverData.diseases.forEach(function(disease) {
        colors.push(getRandomColor());
        labels.push(disease.country);
        data.push(disease.cases);
    })
    new Chart(document.getElementById('ChartPie').getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Number of cases",
                    backgroundColor: colors,
                    data: data
                }
            ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: serverData.diseases[0].disease
            },
            responsive: false,
            scales: {
                xAxes: [{
                    barPercentage: 0.4
                }]
            }
        }
    });
}
function generateLineChart(serverData) {    
    var colors = [];
    var labels = [];
    var data = [];
    var diseases = [];
    var countries = [];
    serverData.diseases.forEach(function(disease) {
        colors.push(getRandomColor());
        labels.push(disease.timestamp);
        data.push(disease.cases);
        diseases.push(disease.disease);
        countries.push(disease.country);
    })
    new Chart(document.getElementById('ChartPie').getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{ 
              data: data,
              label: diseases[0],
              borderColor: colors[0],
              fill: false
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Number of cases in '+countries[0]
          }
        }
      });
}

$('.statistics-form').on('submit', function(e) {
    e.preventDefault();
    
    let data = {};
    $(this).serializeArray().map(function(item){
        data[item.name] = item.value;
    });
    data.country = $('#country-select').val();
    let countryOptions = [];
    let diseaseOptions = [];
    let manyCountries = false;
    let manyDiseases = false;

    $('#country-select option').each(function() {
        if($(this).val() !== 'All' && $(this).val() !== 'Select Country') countryOptions.push($(this).val());
    })
    $('#diseases-select option').each(function() {
        if($(this).val() !== 'All' && $(this).val() !== 'Select Disease') diseaseOptions.push($(this).val());
    })
    
    if(data.country === 'All') {
        data.country = countryOptions;
        manyCountries = true;
    }
    if(data.disease === 'All') {
        data.disease = diseaseOptions;
        manyDiseases = true;
    }

    let chartType = 'grouped-bar-chart';
    if(manyCountries && !manyDiseases) {
        chartType = 'bar-chart';
    } else if(!manyCountries && manyDiseases) {
        chartType = 'doughnut-chart'
    } else if (manyCountries && manyDiseases) {
        chartType = 'grouped-bar-chart';
    } else {
        chartType = 'onetoone-chart';
    }

    $.ajax({
        type: 'get',
        url: '/statistics/' + chartType,
        data: data,
        success: function(result) {
            if(chartType === 'doughnut-chart') generateDoughnutChart(result);
            else if(chartType === 'bar-chart') generateBarChart(result);
            else if(chartType === 'grouped-bar-chart') generateGroupedBarChart(result);
            else if(chartType === 'onetoone-chart') generateLineChart(result);
        },
        error: function(err) {

        },
    })
})

$('#country-select').on('change', function(e) {
    var selectedCountry = e.target.value;

    if(selectedCountry) {
        selectedCountries = [];
        if(selectedCountry === 'All') {
            $('#country-select option').each(function() {
                if($(this).val() !== 'All' && $(this).val() !== 'Select Country') selectedCountries.push($(this).val());
            })
        } else {
            selectedCountries.push(selectedCountry);
        }
        $.ajax({
            type: 'get',
            url: '/statistics/diseases',
            data: { country: selectedCountries },
            success: function(result) {
                let diseasesOptions = '';
                result.diseases.forEach(function(disease){
                    diseasesOptions = diseasesOptions + '<option name="' + disease + '" value="' + disease + '">' + disease + '</option>';
                })
                $('#diseases-select').append(diseasesOptions);
                $('#disease').toggle();
                $('#timestamp').toggle();
                $('#reset-canvas').toggle();
                $('.form-button').toggle();
                $('#country-select').prop('disabled', true);
            },
            error: function(err) {
                console.log(err);
            }
        })
    }
})

document.getElementById("create-stat").onclick = function() {deleteCanvas()};

function deleteCanvas() {
    document.querySelectorAll('iframe').forEach(
        function(elem){
          elem.parentNode.removeChild(elem);
      });
}