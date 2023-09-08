////////////////////////////////////////
// Define what should be loaded first//
//////////////////////////////////////

window.onload = function () {
    dropDownPopulater();
    worldMapData();
    compTable();
    lineChart();
    vizChanger();
    drawChart();
	//simulationPanelDefault();
    simulation();
    colorThumbs();
    drawChart();
}

////////////////////////////
// Desktop/Mobile Toggle //
//////////////////////////

function toggleMobileMenu(menu) {
    menu.classList.toggle('open');
}

/////////////////////////////////////////
//Toggle Dark/Light Light Mode Section//
///////////////////////////////////////

$(function () {
    // Check if the user has set a preference before
    if (localStorage.getItem('dark-mode') === 'true') {
        $(document.body).addClass('dark-mode');
        $("#toggle i").toggleClass('fa fa-sun-o fa fa-moon-o');
        $('#toggle button').toggleClass('moon sun');
    }

    // Toggle the class and update the localStorage when the toggle button is clicked
    $('#toggle').click(function () {
        $(document.body).toggleClass("dark-mode");
        $("i", this).toggleClass('fa fa-sun-o fa fa-moon-o');
        $('button', this).toggleClass("moon sun");
        localStorage.setItem('dark-mode', $(document.body).hasClass('dark-mode'));
    });
});


/////////////////////
// Dropdown menus //
///////////////////

function dropDownPopulater() {
    //Step 1: First country dropdown menu (compare section)
    $.each(countries, function (index, value) {
        let option = $(`<option>${value}</option>`);
        $('#firstCountrySelected').append(option);
    });

    // Step 2: Second country dropdown menu (compare section)
    $.each(countries, function (index, value) {
        let option = $(`<option>${value}</option>`);
        $('#secondCountrySelected').append(option);
    });

    // Step 3: Comparison region dropdown menu (compare section)
    $.each(regions, function (index, value) {
        let option = $(`<option>${value}</option>`);
        $('#compRegionSelected').append(option);
    });

    // Step 4: Analysis country dropdown menu (analysis section)
    $.each(countries, function (index, value) {
        let option = $(`<option>${value}</option>`);
        $('#analysisCountry').append(option);
    });
}

//////////////////////////////////
// World map (explore eection) //
////////////////////////////////

google.charts.load('current', {
    'packages': ['geochart'],
});

function worldMapData() {
    // Step 1: Identify the user selection for indicator and year
    let selectedIndicatorForMap = $('#indicatorSelected').find(":selected").val();
    let selectedPeriodForMap = $('#yearSelected').find(":selected").val();
    // console.log(selectedIndicatorForMap);
    // console.log(selectedPeriodForMap);

    // Step 2: Get the array of all the countries for the period selected
    let selectedIndicatorArray = data.filter(element => element["Time"] === +selectedPeriodForMap);
    // console.log(selectedIndicatorArray);

    // Step 3: Extract from selectedIndicatorArray relevant indicatorDataforMap
    let indicatorDataForMap = [];
    for (i = 0; i < countries.length; i++) {
        for (j = 0; j < selectedIndicatorArray.length; j++) {
            if (countries[i] === selectedIndicatorArray[j]['Country Name']) {
                indicatorDataForMap[i] = selectedIndicatorArray[j][selectedIndicatorForMap]
            }
        }
    };
    // console.log(indicatorDataForMap);

    // Step 4: Replace #N/A by null in indicatorDataForMap   
    for (i = 0; i < indicatorDataForMap.length; i++) {
        if (isNaN(indicatorDataForMap[i])) {
            indicatorDataForMap[i] = null;
        } else {
            indicatorDataForMap[i] = indicatorDataForMap[i];
        }
    };
    // console.log(indicatorDataForMap);

    // Step 5: Define tooltip - convert numbers to qualitative labels
    let toolTipCol = [];
    for (i = 0; i < indicatorDataForMap.length; i++) {
        let numberRange = [0, 3.125, 6.25, 9.375, 12.5];
        let numberLabel = ["Very Low", "Low", "Medium", "High", "Very High"];
        for (j = 0; j < numberRange.length; j++) {
            if (indicatorDataForMap[i] === numberRange[j]) {
                toolTipCol[i] = numberLabel[j];
            }
        }
    };
    // console.log(toolTipCol);

    // Step 6: Manipulate the google chart template
    // Define header row of arrayToTable
    let geoMapData = [
        ['Countries', $('#indicatorSelected').find(":selected").text(), {
            type: 'string',
            role: 'tooltip'
        }]
    ];
    // Push countries, indicatorDataforMap, and toolTipCol into geoMapData
    for (i = 0; i < countries.length; i++) {
        geoMapData.push([countries[i], indicatorDataForMap[i], toolTipCol[i]]);
    }
    // console.log(geoMapData);

    // Step 7: Draw Map    
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
        var mapData = google.visualization.arrayToDataTable(geoMapData);
        var options = {
            title: 'Region Map',
            legend: 'none',
            backgroundColor: {
                fill: 'transparent'
            },
            colorAxis: {
                colors: ['#ff0000', '#ffa700', '#fff400', '#a3ff00', '#2cba00']
            },
            datalessRegionColor: '#f5fafc',
            defaultColor: '#f5f5f5',
            height: 400
        };
        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
        chart.draw(mapData, options);
    };
}


////////////////////////////////
// Fill the comparison Table //
//////////////////////////////

function compTable() {
    // Step 1: Define needed variables first
    selectedFirstCountry = $("#firstCountrySelected").val();
    selectedSecondCountry = $("#secondCountrySelected").val();
    selectedCompRegion = $("#compRegionSelected").val();
    selectedIndicator = $("#indicatorSelected").val();

    //Step 2: Write selected units of observations into Table
    $("#firstCountry").empty();
    $('#firstCountry').append(selectedFirstCountry);
    $("#secondCountry").empty();
    $('#secondCountry').append(selectedSecondCountry);
    $("#compRegion").empty();
    $('#compRegion').append(selectedCompRegion);

    // Step 3: Create objects from user selection of first country, second country, comparison region, and indicator
    let selectedFirstCountryArray = data.filter(element => element["Country Name"] === selectedFirstCountry);
    let selectedSecondCountryArray = data.filter(element => element["Country Name"] === selectedSecondCountry);
    let selectedCompRegionArray = data.filter(element => element["Country Name"] === selectedCompRegion);

    // Step 4: Target in comparison table user-selected units of observations and indicator for all periods
    let years = [2000, 2005, 2010, 2015, 2020];

    // Fill the table for the first selected country
    for (i = 0; i < selectedFirstCountryArray.length; i++) {
        let targetCells = ['a', 'b', 'c', 'd', 'e'];
        for (j = 0; j < years.length; j++) {
            if (selectedFirstCountryArray[i]['Time'] === years[j]) {
                let cellValue = selectedFirstCountryArray[i][selectedIndicator];
                $('#' + targetCells[i]).empty();
                $('#' + targetCells[i]).append(cellValue);
            }
        }
    }

    // Fill the table for the comparison country
    for (i = 0; i < selectedSecondCountryArray.length; i++) {
        let targetCells = ['f', 'g', 'h', 'i2', 'j'];
        for (j = 0; j < years.length; j++) {
            if (selectedSecondCountryArray[i]['Time'] === years[j]) {
                let cellValue = selectedSecondCountryArray[i][selectedIndicator];
                $('#' + targetCells[i]).empty();
                $('#' + targetCells[i]).append(cellValue);
            }
        }
    }

    // Fill the table for the comparison region
    for (i = 0; i < selectedCompRegionArray.length; i++) {
        let targetCells = ['k', 'l', 'm', 'n', 'o'];
        for (j = 0; j < years.length; j++) {
            if (selectedCompRegionArray[i]['Time'] === years[j]) {
                let cellValue = selectedCompRegionArray[i][selectedIndicator];
                $('#' + targetCells[i]).empty();
                $('#' + targetCells[i]).append(cellValue);
            }
        }
    }

    // Step 5: Color the table
    var allCells = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i2', 'j', 'k', 'l', 'm', 'n', 'o'];
    for (var i = 0; i < allCells.length; i++) {
        cellValue = $('#' + allCells[i]).text();
        if (cellValue === '0') {
            $('#' + allCells[i]).empty();
            $('#' + allCells[i]).append("Very Low");
            $('#' + allCells[i]).css("background-color", "#fe0000");
        } else if (cellValue === '3.125') {
            $('#' + allCells[i]).empty();
            $('#' + allCells[i]).append("Low");
            $('#' + allCells[i]).css("background-color", "#ffc002");
        } else if (cellValue === '6.25') {
            $('#' + allCells[i]).empty();
            $('#' + allCells[i]).append("Medium");
            $('#' + allCells[i]).css("background-color", "#ffff00");
        } else if (cellValue === '9.375') {
            $('#' + allCells[i]).empty();
            $('#' + allCells[i]).append("High");
            $('#' + allCells[i]).css("background-color", "#d6ff00");
        } else if (cellValue === '12.5') {
            $('#' + allCells[i]).empty();
            $('#' + allCells[i]).append("Very High");
            $('#' + allCells[i]).css("background-color", "#63fe00");
        } else {
            $('#' + allCells[i]).empty();
            $('#' + allCells[i]).append("No Data");
            $('#' + allCells[i]).css("background-color", "white");
        }
    }
}

////////////////////////////
// Create the Line Chart //
//////////////////////////

// Step 1: Load google chart first
google.charts.load('current', {
    'packages': ['corechart']
});

// Step 2: Create Line Chart Function
function lineChart() {
    // Step 2.1 Define needed variables first (some of them might be better defined as global variables)
    let selectedFirstCountry = $("#firstCountrySelected").val();
    let selectedFirstCountryArray = data.filter(element => element["Country Name"] === selectedFirstCountry);

    let selectedSecondCountry = $("#secondCountrySelected").val();
    let selectedSecondCountryArray = data.filter(element => element["Country Name"] === selectedSecondCountry);

    let selectedCompRegion = $("#compRegionSelected").val();
    let selectedCompRegionArray = data.filter(element => element["Country Name"] === selectedCompRegion);

    // console.log(selectedFirstCountry);
    // console.log(selectedFirstCountryArray);


    let selectedIndicator = $("#indicatorSelected").val();

    // Step 2.2 Create data for plot,except for 'years' create empty vectors for the series to be plotted
    let years = [2000, 2005, 2010, 2015, 2020];
    let firstCountryData = [];
    let secondCountryData = [];
    let compRegionData = [];

    // Step 2.3 Define the variable 'comparisonLineChart' as a new google visualization, which will be called by comparisonLineChart.draw(datapoints, options)
    let comparisonLineChart = new google.visualization.LineChart(document.getElementById('comparison_line_chart'));

    // Step 2.4 Define the header of the dynamic data table
    var dataPoints = [
        ['Year', selectedFirstCountry, selectedSecondCountry, selectedCompRegion]
    ];

    // Step 2.5 Reads the values of the user-selected units of observations and indcator for the time periods 2000, 2005, 2010, 2015, 2020
    for (i = 0; i < 5; i++) {
        for (j = 0; j < 5; j++) {
            if (selectedFirstCountryArray[i]['Time'] === years[j]) {
                firstCountryData[j] = selectedFirstCountryArray[i][selectedIndicator];
            }
            if (selectedSecondCountryArray[i]['Time'] === years[j]) {
                secondCountryData[j] = selectedSecondCountryArray[i][selectedIndicator];
            }
            if (selectedCompRegionArray[i]['Time'] === years[j]) {
                compRegionData[j] = selectedCompRegionArray[i][selectedIndicator];
            }
        }
        // Replace #N/A's by NaN
        if (isNaN(years[i])) {
            years[i] = NaN
        }
        if (isNaN(firstCountryData[i])) {
            firstCountryData[i] = NaN
        }
        if (isNaN(secondCountryData[i])) {
            secondCountryData[i] = NaN
        }
        if (isNaN(compRegionData[i])) {
            compRegionData[i] = NaN
        }
        // Push the data into the dataPoints table
        dataPoints.push([years[i], firstCountryData[i], secondCountryData[i], compRegionData[i]]);
    }

    // Step 2.6 Define line chart options
    var options = {
        backgroundColor: {
            fill: 'transparent'
        },
        legend: {
            position: 'bottom',
            maxLines: 5,
            textStyle: {
                color: 'darkgray',
                fontSize: 12,
            },
        },
        hAxis: {
            title: 'Year',
            format: '0000',
            gridlines: {
                color: 'transparent'
            },
            textStyle: {
                color: 'darkgray',
                fontSize: 16,
            },
            ticks: [2000, 2005, 2010, 2015, 2020]
        },
        vAxis: {
            minValue: 0,
            maxValue: 12.5,
            gridlines: {
                color: 'transparent'
            },
            textStyle: {
                color: 'darkgray',
                fontSize: 16,
            },
            ticks: [{
                v: 0,
                f: 'Very Low'
            }, {
                v: 3.125,
                f: 'Low'
            }, {
                v: 6.25,
                f: 'Medium'
            }, {
                v: 9.375,
                f: 'High'
            }, {
                v: 12.5,
                f: 'Very High'
            }, ],
        },
        width: 625,
        height: 400,
        chartArea: {
            'width': '60%',
            'height': '70%'
        },
        lineWidth: 6,
    };

    // Step 2.7 Defines datapoints as a google.visualization.arrayToDataTable as function of datapoints 
    dataPoints = google.visualization.arrayToDataTable(dataPoints);

    // Step 2.8 Makes sure that lines do not overlap (taken from stack overflow)
    for (var i = 1; i < dataPoints.getNumberOfColumns(); i++) {
        // Algorithm to add +/- 0.1 for each series
        var dither = Math.round((i - 1) / 2) / 3;
        if ((i - 1) % 2 == 0) {
            dither = dither * -1;
        }
        for (var j = 0; j < dataPoints.getNumberOfRows(); j++) {
            // Add dither to series to display differently, but keep same data for tooltip
            dataPoints.setCell(j, i, dataPoints.getValue(j, i) + dither, dataPoints.getValue(j, i) + '', undefined)
        }
    }

    // Step 2.9 Finalize comparisonLineChart
    comparisonLineChart.draw(dataPoints, options);
}

/////////////////////////////////////////////////
// Vizualization Changer (comparison section) //
///////////////////////////////////////////////

function vizChanger() {
    let selectedViz = $('#vizSelected').find(":selected").val();
    if (selectedViz === 'Table') {
        google.charts.setOnLoadCallback(compTable);
        $('#compTable').css("display", "block");
        $('#comparison_line_chart').css("display", "none");
    } else {
        google.charts.setOnLoadCallback(compTable);
        $('#comparison_line_chart').css("display", "block");
        $('#compTable').css("display", "none");
    }
}

//////////////////////
// Analyze section //
////////////////////

// Global variables
let indicators = ['MacroStab', 'MicroComp', 'HumCapProd', 'PubHealth', 'EquitSocDev', 'SocSec', 'EnvSust', 'PeaceConf', 'RRPSscaled'];
let indicatorsBg = ['MacroStabBg', 'MicroCompBg', 'HumCapProdBg', 'PubHealthBg', 'EquitSocDevBg', 'SocSecBg', 'EnvSustBg', 'PeaceConfBg', 'RRPSscaledBg'];
let scoreValues = ['0', '3.125', '6.25', '9.375', '12.5']
let scoreRatings = [0, 20, 40, 60, 80, 100]
let colorLabels = ['vl', 'l', 'm', 'h', 'vh']
let selectedAnalysisCountry;
let selectedAnalysisCountryObject = [];
let selectedAnalysisCountryArray = []
let selectedAnalysisCountryData = [];
let selectedCountryDataClasses = [];

// Set simulation sliders to default values

google.charts.setOnLoadCallback(simulationPanelDefault);

function simulationPanelDefault() {

    //Step 1: Identify selected country
    selectedAnalysisCountry = $('#analysisCountry').find(':selected').val();
    console.log(selectedAnalysisCountry);

    //Step 2: Identify relevant analysis country object
    selectedAnalysisCountryObject = data.filter(element => element["Country Name"] === selectedAnalysisCountry);

    //Step 3: Identify relevant analysis country object for last observation
    for (i = 0; i < selectedAnalysisCountryObject.length; i++) {
        if (selectedAnalysisCountryObject[i]['Time'] === 2020) {
            selectedAnalysisCountryArray = selectedAnalysisCountryObject[i];
        }
    }
    console.log(selectedAnalysisCountryArray);

    //Step 4: Extract from relevant country relevant data from last observation
    let selectedAnalysisCountryData = [];
    for (i = 0; i < indicators.length; i++) {
        selectedAnalysisCountryData[i] = selectedAnalysisCountryArray[indicators[i]];
    }
    console.log(selectedAnalysisCountryData);

    // Step 5: Assign sliders selected Analysis Country values
    for (i = 0; i < selectedAnalysisCountryData.length; i++) {
        // For simulatable slider
        $('#' + indicators[i]).val(selectedAnalysisCountryData[i]);
        // For background slider
        $('#' + indicatorsBg[i]).val(selectedAnalysisCountryData[i]);
    }
}

// Execute the simulation

let simulatedValues = [];
let time = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];


google.charts.load('current', {
    'packages': ['corechart']
});

google.charts.setOnLoadCallback(simulation);

function simulation() {

    ////////////////////////////////////////////////////////
    // Pull up again default values for selected country //
    //////////////////////////////////////////////////////

    //Step 1: Identify (again) selected country
    selectedAnalysisCountry = $('#analysisCountry').find(':selected').val();
    console.log(selectedAnalysisCountry);

    //Step 2: Identify (again) relevant analysis country object
    selectedAnalysisCountryObject = data.filter(element => element["Country Name"] === selectedAnalysisCountry);

    //Step 3: Identify (again) relevant analysis country object for last observation
    for (i = 0; i < selectedAnalysisCountryObject.length; i++) {
        if (selectedAnalysisCountryObject[i]['Time'] === 2020) {
            selectedAnalysisCountryArray = selectedAnalysisCountryObject[i];
        }
    }
    console.log(selectedAnalysisCountryArray);

    //Step 4: Extract (again) from relevant country relevant data from last observation
    let selectedAnalysisCountryData = [];
    for (i = 0; i < indicators.length; i++) {
        selectedAnalysisCountryData[i] = selectedAnalysisCountryArray[indicators[i]];
    }
    console.log(selectedAnalysisCountryData);

    ///////////////////////////
    // Get simulated values //
    /////////////////////////

    //Step 1: Store simulated Values
    for (i = 0; i < indicators.length - 1; i++) {
        simulatedValues[i] = $('#' + indicators[i]).val();
    }
    console.log(simulatedValues);

    //Step 2: Calculate simulated score
    simulatedScore = 0;
    for (i = 0; i < simulatedValues.length; i++) {
        simulatedScore += +simulatedValues[i];
    };
    console.log(simulatedScore);

    //Step 3: Calculate simulated score rating
    for (i = 0; i < scoreRatings.length; i++)
        if (simulatedScore >= scoreRatings[i] && simulatedScore < scoreRatings[i + 1]) {
            simulatedScoreRating = colorLabels[i];
            simulatedScoreClass = scoreValues[i];
        };

    //Step 4: Change Overall RRPS slider
    $('#RRPSscaled').val(simulatedScoreClass)


    ////////////////////
    // Prepare Graph //
    //////////////////

    // Step 1: Scale startRRPS and simRRPS sum to 0 - 12.5 (that is how I ran the regression)
    startRRPS = 0;
    for (i = 0; i < selectedAnalysisCountryData.length - 1; i++) {
        startRRPS += +selectedAnalysisCountryData[i] / 8;
    }
    console.log(startRRPS)

    simRRPS = 0;
    for (i = 0; i < simulatedValues.length; i++) {
        simRRPS += +simulatedValues[i] / 8;
    };
    console.log(simRRPS)

    // Step 2: Calculate simRRPSMinusStartRRPS
    simRRPSMinusStartRRPS = simRRPS - startRRPS;
    console.log(simRRPSMinusStartRRPS);

    //Step 3: Get initial GDP
    initialGDP = selectedAnalysisCountryArray['GDPcap'];
    console.log(initialGDP);

    //Step 4 : Define baseline
    let baseLine = [];
    for (i = 0; i < time.length; i++) {
        baseLine[i] = initialGDP;
    };
    console.log(baseLine);

    //Step 5: Calculate GDPcap after 17 years
    GDPcapGrowthFactorMean = 1 + (simRRPSMinusStartRRPS * 0.159);
    GDPcapGrowthFactorUL = 1 + (simRRPSMinusStartRRPS * 0.181);
    GDPcapGrowthFactorLL = 1 + (simRRPSMinusStartRRPS * 0.137);
    simGDPcapFinalMean = initialGDP * GDPcapGrowthFactorMean;
    simGDPcapFinalUL = initialGDP * GDPcapGrowthFactorUL;
    simGDPcapFinalLL = initialGDP * GDPcapGrowthFactorLL;
    console.log(simGDPcapFinalLL);
    console.log(simGDPcapFinalMean);
    console.log(simGDPcapFinalUL);

    // Step 6: Calculate simulatedScenario
    let simulatedScenarioLL = [];
    let simulatedScenarioMean = [];
    let simulatedScenarioUL = [];
    for (i = 0; i < time.length; i++) {
        simulatedScenarioLL[i] = initialGDP + (simGDPcapFinalLL - initialGDP) / Math.log(18) * Math.log(time[i] + 1);
        simulatedScenarioMean[i] = initialGDP + (simGDPcapFinalMean - initialGDP) / Math.log(18) * Math.log(time[i] + 1);
        simulatedScenarioUL[i] = initialGDP + (simGDPcapFinalUL - initialGDP) / Math.log(18) * Math.log(time[i] + 1);
    };
    console.log(simulatedScenarioLL);
    console.log(simulatedScenarioMean);
    console.log(simulatedScenarioUL);


    ////////////////////
    // Execute Graph //
    //////////////////

    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {

        // Step 1: Create arrayToDataTable
        lineChartData = [
            ['Time', 'Baseline Scenario', 'Simulated Scenario Mean', 'Simulated Scenario Upper Limit', 'Simulated Scenario Lower Limit']
        ];

        for (i = 0; i < time.length; i++) {
            lineChartData.push([time[i], baseLine[i], simulatedScenarioMean[i], simulatedScenarioUL[i], simulatedScenarioLL[i]])
        };

        console.log(lineChartData)

        // Step 2: Read lineChartData into data ()
        var data = google.visualization.arrayToDataTable(lineChartData);


        // Step 3: Define options
        var options = {

            curveType: 'function',
            backgroundColor: 'transparent',
            legend: {
                position: 'bottom',

                textStyle: {
                    color: 'darkgray',
                    fontSize: 16,
                }
            },

            vAxis: {
                format: "#,###,###",
                gridlines: {
                    count: 0,
                },
                textStyle: {
                    color: 'darkgray',
                    fontSize: 16,
                }
            },

            hAxis: {
                textStyle: {
                    color: 'darkgray',
                },
                gridlines: {
                    color: 'transparent',
                    textStyle: {
                        color: 'red'
                    },
                },
            },

            series: {
                0: {
                    type: 'line',
                    visibleInLegend: true,
                }, //Baseline
                1: {
                    type: 'line',
                    visibleInLegend: true,
                }, //Mean

                2: {
                    type: 'line',
                    lineDashStyle: [4, 4],
                    visibleInLegend: false,
                }, //UL
                3: {
                    type: 'line',
                    lineDashStyle: [4, 4],
                    visibleInLegend: false,
                }, //LL
            },
            colors: ['red', 'darkgray', 'darkgray', 'darkgray', 'darkgray'],

        }
        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(data, options);
    }
}

// Adjust slider thumb colors 

google.charts.setOnLoadCallback(colorThumbs);

function colorThumbs() {
    for (i = 0; i < indicators.length; i++) {
        for (j = 0; j < colorLabels.length; j++) {
            if ($('#' + indicators[i]).hasClass(colorLabels[j])) {
                $('#' + indicators[i]).removeClass(colorLabels[j])
            }
            if ($('#' + indicators[i]).val() === scoreValues[j]) {
                $('#' + indicators[i]).addClass(colorLabels[j])
                $('#' + indicators[i]).addClass(colorLabels[j])
            }
        }
    }
}