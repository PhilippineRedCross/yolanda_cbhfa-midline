var surveyData = [];
var filteredData = [];
var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];

// var pieColors = ["#7fc97f","#fdc086","#ffff99"];
// var pieColors = ["#66c2a5", "#fdae61", "#ffffbf"];
// var pieColors = ["#4393c3","#f4a582","#fddbc7"];
// var pieColors = ["#24ED8F","#24E6ED","#EE2A24"];
var pieColors = ["#5CB85C","#337AB7","#F0AD4E"];
/* 
blue
#337AB7

green
#5CB85C



orange
#F0AD4E


red
#D9534F



 */

/* FDC086
86C3FC
FCFA86 
FC8688 



Hex: #EE2A24

Complementary #:

24E6ED

Analogous #:

ED8F24 ED2482




4393C3
C27142

42C2B1

4253C2
 */


var activeProvince = "ALL";
var activeMunicipality = "ALL";
var activeBarangay = "ALL";

var formatPerc = d3.format(".0%");
var formatCommas = d3.format(",");

function getSurveyData() {
  d3.csv("data/cbhfa_midline_data_cleaned.csv", function(data){
    $.each(data, function(index, survey){
      if(survey.start_permission == "yes"){
        surveyData.push(survey);
      }
    });
    buildProvinceDropdown();
  }).on("progress", function(event){
    //update progress bar
    if (d3.event.lengthComputable) {
      var percentComplete = Math.round(d3.event.loaded * 100 / d3.event.total);
      $('.progress-bar').css("width", percentComplete+'%').attr('aria-valuenow', percentComplete);
      if(percentComplete == 100){
        $("#loading-wrapper").fadeOut(500);
      }
    }
  });
}

function buildProvinceDropdown() {
  var provinceList = [];
  $.each(surveyData, function(index, survey){
    var thisProvince = survey["province"];
    if($.inArray(thisProvince, provinceList) === -1){
      provinceList.push(thisProvince);
    }
  });
  // sort so that the regions appear in alphabetical order in dropdown
  provinceList = provinceList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < provinceList.length; i++) {
      var item = provinceList[i];
      var listItemHtml = '<li><a href="#" onClick="provinceSelect(' +"'"+ item +"'"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-province').append(listItemHtml);       
  }
  analyzeData();
  $("#loading").fadeOut(300);
}

function resetAdmin() {
  activeProvince = "ALL";
  activeMunicipality = "ALL";
  activeBarangay = "ALL";          
  $('#dropdown-menu-municipality').html('<li class="disabled"><a role="menuitem" href="#">First select a province</a></li>');
  $('#dropdown-menu-barangay').html('<li class="disabled"><a role="menuitem" href="#">First select a municipality</a></li>');
  $("#selected-admin-label").html("All surveyed areas");
  analyzeData();
}

function provinceSelect(province){
  activeProvince = province;
  activeMunicipality = "ALL";
  activeBarangay = "ALL";
  $("#selected-admin-label").html(province);
  buildMunicipalityDropdown();
  analyzeData();
}

function municipalitySelect(municipality){
  activeMunicipality = municipality;
  activeBarangay = "ALL";
  $("#selected-admin-label").html(activeProvince + ", " + activeMunicipality);
  $("#selected-barangay-text").empty();
  buildBarangayDropdown();
  analyzeData();
}

function barangaySelect(barangay){
  activeBarangay = barangay;
  $("#selected-admin-label").html(activeProvince + ", " + activeMunicipality + ", "+ activeBarangay);
  analyzeData();
}

function buildMunicipalityDropdown(){
  $('#dropdown-menu-municipality').empty();
  $('#dropdown-menu-barangay').html('<li class="disabled"><a role="menuitem" href="#">First select a municipality</a></li>');
  var municipalityList = [];
  $.each(surveyData, function(index, survey){
    var thisMunicipality = survey["municipality"];
    if($.inArray(thisMunicipality, municipalityList) === -1 && survey["province"] === activeProvince){
      municipalityList.push(thisMunicipality);
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  municipalityList = municipalityList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < municipalityList.length; i++) {
      var item = municipalityList[i];
      var listItemHtml = '<li><a href="#" onClick="municipalitySelect(' +"'"+ item +"'"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-municipality').append(listItemHtml);       
  }
}

function buildBarangayDropdown() {
  $('#dropdown-menu-barangay').empty();
  var barangayList = [];
  $.each(surveyData, function(index, survey){
    var thisBarangay = survey["barangay"];
    if($.inArray(thisBarangay, barangayList) === -1 && survey["province"] === activeProvince && survey["municipality"] === activeMunicipality){
      barangayList.push(thisBarangay);
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  barangayList = barangayList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < barangayList.length; i++) {
      var item = barangayList[i];
      var listItemHtml = '<li><a href="#" onClick="barangaySelect(' +"'"+ item +"'"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-barangay').append(listItemHtml);       
  }
}

function analyzeData() {
  $("#infoWrapper").empty();
  filteredData = [];
  $.each(surveyData, function(index, survey){
    if(survey["province"] === activeProvince || activeProvince === "ALL"){
      if(survey["municipality"] === activeMunicipality || activeMunicipality === "ALL"){
        if(survey["barangay"] === activeBarangay || activeBarangay === "ALL"){
          filteredData.push(survey);
        }
      }
    }
  });

  $("#selected-survey-count").html(filteredData.length.toString());

  BC1();
}


function BC1() {
  $(infoWrapper).append("<h3><span class='jumpto' id='section_profile'></span>Respondents' Profile</h3><hr>");
  var questionID = "BC1";
  var questionEnglish = "Number of people in household";
  var questionTagalog = "Bilang ng tao sa isang sambahayan";

  $("#infoWrapper").append('<div class="row"><div id="'+
      questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";

  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
      '<table class="table table-custom"><thead>' +
        '<tr>' +
          '<th></th>' +
          '<th>Female <span class="text-tagalog">[Babae]</span></th>' +
          '<th>Male <span class="text-tagalog">[Lalaki]</span></th>' +               
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr class="active">' +
          '<td style="font-weight:bold;"><span id="grandTotal"></span> total</td>' +
          '<td><span id="femaleTotal"></span></td>' +
          '<td><span id="maleTotal"></span></td>' +
        '</tr>' +              
        '<tr>' +
          '<td><img class="tableIcon pull-right" src="img/infant.svg"> Infant, 0-11 months' +
            '<span class="text-tagalog"> [Sanggol 0-11 buwaan]</span></td>' +
          '<td><span id="femaleInfant"></span></td>' +
          '<td><span id="maleInfant"></span></td>' +
        '</tr>' +
        '<tr>' +
          '<td><img class="tableIcon pull-right" src="img/children.svg"> Young child, 1-4 years' +
            '<span class="text-tagalog"> [Anak 1-4 taon]</span></td>' +
          '<td><span id="femaleYoung"></span></td>' +
          '<td><span id="maleYoung"></span></td>' +
        '</tr>' +
        '<tr>' +
          '<td><img class="tableIcon pull-right" src="img/children.svg"> Child, 5-14 years' +
            '<span class="text-tagalog"> [Anak 5-14 taon]</span></td>' +
          '<td><span id="femaleChild"></span></td>' +
          '<td><span id="maleChild"></span></td>' +
        '</tr>' +
        '<tr>' +
          '<td><img class="tableIcon pull-right" src="img/adult.svg"> Adult, 15-49 years' +
            '<span class="text-tagalog"> [Edad 15-49 taon]</span></td>' +
          '<td><span id="femaleAdult"></span></td>' +
          '<td><span id="maleAdult"></span></td>' +
        '</tr>' +
        '<tr>' +
          '<td><img class="tableIcon pull-right" src="img/elderly.svg"> Adult, 50+' +
            '<span class="text-tagalog"> [Edad 50 taon pataas]</span></td>' +
          '<td><span id="femaleSenior"></span></td>' +
          '<td><span id="maleSenior"></span></td>' +
        '</tr>' +
      '</tbody></table>';
  $(infoSelector).append(thisInfoHtml);


  var maleInfant = 0;
  var maleYoung = 0;
  var maleChild = 0;
  var maleAdult = 0;
  var maleSenior = 0;
  var femaleInfant = 0;
  var femaleYoung = 0;
  var femaleChild = 0;
  var femaleAdult = 0;
  var femaleSenior = 0;
  $.each(filteredData, function(surveyIndex, survey){
    maleInfant += parseInt(survey.male_infant, 10);
    maleYoung += parseInt(survey.male_young, 10);
    maleChild += parseInt(survey.male_child, 10);
    maleAdult += parseInt(survey.male_adult, 10);
    maleSenior += parseInt(survey.male_senior, 10);
    femaleInfant += parseInt(survey.female_infant, 10);
    femaleYoung += parseInt(survey.female_young, 10);
    femaleChild += parseInt(survey.female_child, 10);
    femaleAdult += parseInt(survey.female_adult, 10);
    femaleSenior += parseInt(survey.female_senior, 10); 
  });
  var femaleTotal = femaleInfant + femaleYoung + femaleChild + femaleAdult + femaleSenior;
  var maleTotal = maleInfant + maleYoung + maleChild + maleAdult + maleSenior;
  var grandTotal = femaleTotal + maleTotal;
  $("#maleInfant").html(formatCommas(maleInfant));
  $("#maleYoung").html(formatCommas(maleYoung));
  $("#maleChild").html(formatCommas(maleChild));
  $("#maleAdult").html(formatCommas(maleAdult));
  $("#maleSenior").html(formatCommas(maleSenior));
  $("#femaleInfant").html(formatCommas(femaleInfant));
  $("#femaleYoung").html(formatCommas(femaleYoung));
  $("#femaleChild").html(formatCommas(femaleChild));
  $("#femaleAdult").html(formatCommas(femaleAdult));
  $("#femaleSenior").html(formatCommas(femaleSenior));
  $("#maleTotal").html(formatCommas(maleTotal));
  $("#femaleTotal").html(formatCommas(femaleTotal));
  $("#grandTotal").html(formatCommas(grandTotal));

  BC2();
}



function BC2(){

  var questionID = "BC2";
  var questionEnglish = "Sex of the respondent";
  var questionTagalog = "Kasarian ng tagasagot ";

  var maleCount = 0;
  var femaleCount = 0;
  var skipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
      totalCount ++;
      if (survey[questionID] === "female"){
        femaleCount ++;
      }
      if (survey[questionID] === "male"){
        maleCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
  });
  var thisPieData = [
    {
      key: "male",
      y: maleCount,
    },
    {
      key: "female",
      y: femaleCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var malePerc = formatPerc(maleCount / totalCount); 
  var femalePerc = formatPerc(femaleCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + malePerc + "</span> male <span class='text-tagalog'>[lalaki]</span> (" +
    maleCount.toString() + ")<br>" +
    "<span class='percText-2'>" + femalePerc + "</span> female <span class='text-tagalog'>[babae]</span> (" + 
    femaleCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  thisInfoHtml += "</p>";
  $(infoSelector).append(thisInfoHtml);  
  BC3(); 
}

function BC3(){
  var questionID = "BC3";
  var questionEnglish = "How old are you?";
  var questionTagalog = "Ilang taon ka na? Ano ang edad mo?";
  var yearResponses = [];
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if(isFinite(parseInt(thisAnswer, 10)) == true){
      yearResponses.push(parseInt(thisAnswer, 10));
    }
  });
  var maxYears = Math.max.apply(Math,yearResponses);
  var minYears = Math.min.apply(Math,yearResponses);
  var sum = 0;
  for( var i = 0; i < yearResponses.length; i++ ){
      sum += yearResponses[i];
  }
  var avgYears = d3.round(sum/yearResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + yearResponses.length.toString() + " respondents providing # of years</strong><br>" +
    "Average years: " + avgYears.toString() + "<br>" +
    "Min: " + minYears.toString() + " / Max: " + maxYears.toString() + "<br>";
  $(infoSelector).append(thisInfoHtml);
  FA1();
}














function FA1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_firstaid'></span>Topic: First Aid</h3><hr>");
  var questionID = "cbhfa-FA1";
  var questionEnglish = "Have you ever attended any training program to learn basic first aid?";
  var questionTagalog = "Nakadalo ka na ba ng pagsasanay patungkol sa paunang lunas?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  FA2();     
}

function FA2() {
  var questionID = "cbhfa-FA2-FA2_units";
  var questionEnglish = "When did you attend this training program?";
  var questionTagalog = "Kailan ka nagsanay?";
  var less2years = 0;
  var more2years = 0;
  var noTraining = 0;
  var dontKnow = 0;
  var noResponse = 0;
  var totalAttended = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      noTraining ++;
    } else {
      totalAttended ++;
      if (survey[questionID] === "years"){
        more2years ++;
      }
      if (survey[questionID] === "months"){
        less2years ++;
      }
      if (survey[questionID] === "dk"){
        dontKnow ++;
      }
      if (survey[questionID] === "skip"){
        noResponse ++;
      }
    }
  });
  var thisPieData = [
    {
      key: ">2 yrs",
      y: more2years,
    },
    {
      key: "<2 yrs",
      y: less2years,
    },
    {
      key: "dk/skip",
      y: dontKnow + noResponse,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var more2Perc = formatPerc(more2years / totalAttended); 
  var less2Perc = formatPerc(less2years / totalAttended);
  var dkPerc = formatPerc(dontKnow / totalAttended);
  var noResponsePerc = formatPerc(noResponse / totalAttended);
  var dkskipPerc = formatPerc( (dontKnow + noResponse) /totalAttended);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>Of the " + totalAttended.toString() + " respondents attending a training program to learn basic first aid:</strong><br>"+
    "<span class='percText-1'>" + less2Perc + "</span> did so in the last 2 years (" +
    less2years.toString() + ")<br>" +
    "<span class='percText-2'>" + more2Perc + "</span> did so more than 2 years ago (" + 
    more2years.toString() + ")<br>" + 
    "<span class='percText-3'>" + dkskipPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dontKnow.toString() + ") or no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    noResponsePerc + ", " + noResponse.toString() + ")<br>" + 
    "(" + noTraining.toString() + ((noTraining == 1) ? " respondent has" : " respondents have") + " not attended a training" +
      ")</p><br>";
  $(infoSelector).append(thisInfoHtml)
  FA3();
}

function FA3(){
  var questionID = "FA3";
  var questionEnglish = "Who organized this training program?";
  var questionTagalog = "Sino ang nagbigay/nagsagawa ng pagsasanay?";
  var answersEnglish = {
    "A":"Red Cross Red Crescent",
    "other":"other",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":false,
    "other":"ibang sagot",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  FA5();
}

function FA5(){
  // does respondent know the key intervention?
  var questionID = "cbhfa-FA5";
  var questionEnglish = "What will be your first action if you see someone is bleeding?";
  var questionTagalog = "Ano ang iyong magiging unang pagkilos o gagawing pangunang lunas kapag ikaw ay makakakita ng taong nagdurugo?";
  var keyInterventionEnglish = "put pressure to stop bleeding";
  var keyInterventionTagalog = "lagyan ng pressure o diin ang apektadong bahagi para huminto ang pagdurugo";
  var know = 0;
  var other = 0;
  var dk = 0;
  var skip = 0;
  var notAsked = 0;
  var totalAttended = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAsked ++;
    } else { 
      totalAttended ++;
      if (survey[questionID] === "A"){
        know ++;
      }
      if (survey[questionID] === "other"){
        other ++;
      }
      if (survey[questionID] === "dk"){
        dk ++;
      }
      if (survey[questionID] === "skip"){
        skip ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "know",
      y: know,
    },
    {
      key: "other",
      y: other,
    },
    {
      key: "dk/skip",
      y: dk + skip,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var knowPerc = formatPerc(know / totalAttended); 
  var otherPerc = formatPerc(other / totalAttended);
  var dkPerc = formatPerc(dk / totalAttended);
  var skipPerc = formatPerc(skip / totalAttended);
  var dkskipPerc = formatPerc( (dk + skip) / totalAttended);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>Of the " + totalAttended.toString() + " respondents attending a training program to learn basic first aid:</strong><br>"+
    "<span class='percText-1'>" + knowPerc + "</span> " + keyInterventionEnglish +
    " <span class='text-tagalog'>[" + keyInterventionTagalog + "]</span> (" +
    know.toString() + ")<br>" +
    "<span class='percText-2'>" + otherPerc + "</span> gave some other answer (" + 
    other.toString() + ")<br>" +
    "<span class='percText-3'>" + dkskipPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dk.toString() + ") or no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipPerc + ", " + skip.toString() + ")<br>" + 
    "(" + notAsked.toString() + ((notAsked == 1) ? " respondent" : " respondents") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  FA6();
}

function FA6(){
  // does respondent know the key intervention?
  var questionID = "cbhfa-FA6";
  var questionEnglish = "What will be your first action if you see someone has been burnt?";
  var questionTagalog = "Ano ang iyong magiging unang tugon/aksyon kapag nakakita ka ng taong napaso?";
  var keyInterventionEnglish = "put cold clean water on the burned area";
  var keyInterventionTagalog = "lagyan ng malamig at malinis na tubig sa napasong bahagi";
  var know = 0;
  var other = 0;
  var dk = 0;
  var skip = 0;
  var notAsked = 0;
  var totalAttended = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAsked ++;
    } else {
      totalAttended ++;
      if (survey[questionID] === "A"){
        know ++;
      }
      if (survey[questionID] === "other"){
        other ++;
      }
      if (survey[questionID] === "dk"){
        dk ++;
      }
      if (survey[questionID] === "skip"){
        skip ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "know",
      y: know,
    },
    {
      key: "other",
      y: other,
    },
    {
      key: "dk/skip",
      y: dk + skip,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var knowPerc = formatPerc(know / totalAttended); 
  var otherPerc = formatPerc(other / totalAttended);
  var dkPerc = formatPerc(dk / totalAttended);
  var skipPerc = formatPerc(skip / totalAttended);
  var dkskipPerc = formatPerc( (dk + skip) / totalAttended);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>Of the " + totalAttended.toString() + " respondents attending a training program to learn basic first aid:</strong><br>"+
    "<span class='percText-1'>" + knowPerc + "</span> " + keyInterventionEnglish +
    " <span class='text-tagalog'>[" + keyInterventionTagalog + "]</span> (" +
    know.toString() + ")<br>" +
    "<span class='percText-2'>" + otherPerc + "</span> gave some other answer (" + 
    other.toString() + ")<br>" +
    "<span class='percText-3'>" + dkskipPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dk.toString() + ") or no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipPerc + ", " + skip.toString() + ")<br>" +  
    "(" + notAsked.toString() + ((notAsked == 1) ? " respondent" : " respondents") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  FA7();
}


function FA7(){
  var questionID = "cbhfa-FA7";
  var questionEnglish = "Did you at any occasion in the last year injure yourself and was given first aid by a volunteer?";
  var questionTagalog = "Mayroon bang naging pagkakataon kung saan nasaktan mo ang iyong sarili at nilapatan ka ng pangunang lunas ng isang volunteer?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  CM1();
}

function CM1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_majoremergencies'></span>Topic: Community Mobilization in Major Emergencies</h3></div><hr>");
  var questionID = "CM1";
  var questionEnglish = "What would you do to respond safely to a disaster?";
  var questionTagalog = "Ano ang iyong gagawin upang makatugon ng ligtas sa isang kalamidad?";
  var answersEnglish = {
    "CM1-A":"listen to the media and other reliable sources and follow advice",
    "CM1-B":"follow advice issued by the government / local authorities",
    "CM1-C":"move immediately to the nearest safe evacuation place with family members",
    "CM1-D":"follow safe route to reach shelter sited",
    "CM1-E":"take water, food, and essential items to the shelter site",
    "CM1-F":"go back home only when authorities declare that the situation is safe",
    "CM1-G":"help evacuate and/or rescue the others, while not putting self in danger",
    "CM1-H":"provide first aid if qualified",
    "CM1-I":"be calm and quiet",
    "CM1-other":"other",
    "CM1-dk":"don't know",
    "CM1-skip":"no response"
  };
  var answersTagalog = {
    "CM1-A":"makinig sa media at iba pang mapapakukunan ng mapagkakatiwalaang impormasyon",
    "CM1-B":"sundin ang payo ng pamahalaan o lokal na mga awtoridad",
    "CM1-C":"pumunta agad sa pinakamalapit na ligtas na evacuation area kasama ang pamilya",
    "CM1-D":"sundin ang ligtas na daan/ruta patungo sa evacuation area",
    "CM1-E":"magdala ng malinis na inumin, pagkain at iba pang mahahalagang bagay sa evacuation site",
    "CM1-F":"bumalik lamang sa mga tahanan kung may pahintulot na ng mga lokal na awtoridad at idineklara na itong ligtas",
    "CM1-G":"tumulong sa pagpapalikas at/o pagsagip sa iba na hindi nilalagay ang sarili sa panganib",
    "CM1-H":"magbigay ng pangunang lunas kung kinakailangan",
    "CM1-I":"maging mahinahon at tahimik",
    "CM1-other":"ibang sagot",
    "CM1-dk":"hindi alam",
    "CM1-skip":"walang sagot"
  };
  var optionCount = 9;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  CM2(); 
}
function CM2(){
  var questionID = "cbhfa-CM2";
  var questionEnglish = "Did you receive psychosocial support from a volunteer following the disaster?";
  var questionTagalog = "Nakatanggap ka ba ng psychosocial support mula sa isang volunteer matapos ang isang kalamidad?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  safemotherhood();
}










function safemotherhood(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-SM_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#safemotherhood").show();
      SM1();
      break;
    case false:
      $("#safemotherhood").hide();
      newborn();
      break;
  };
}

function SM1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_safemotherhood'></span>Topic: Safe Motherhood</h3><hr>");
  var questionID = "SM1";
  var questionEnglish = "During your last pregnancy, did you see anyone for antenatal care?";
  var questionTagalog = "Sa panahon ng iyong huling pagbubuntis, kumunsulta ka ba ng isang healthcare worker para mapangalagaan ang iyong pagbubuntis?";
  analysisYesNo(questionID, questionEnglish, questionTagalog); 
  SM2();
}
function SM2(){
  var questionID = "SM2";
  var optionCount = 4;
  var questionEnglish = "Whom did you see?";
  var questionTagalog = "Sino ang iyong kinunsulta?";
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersEnglish = {
    "SM2-A":"doctor/ medical assistant",
    "SM2-B":"nurse",
    "SM2-C":"midwife",
    "SM2-D":"traditional birth attendant",
    "SM2-other":"other",
    "SM2-dk":"don't know",
    "SM2-skip":"no response"
  };
  var answersTagalog = {
    "SM2-A":"duktor",
    "SM2-B":"nars",
    "SM2-C":"kumadrona",
    "SM2-D":"hilot",
    "SM2-other":"ibang sagot",
    "SM2-dk":"hindi alam",
    "SM2-skip":"walang sagot"
  };
  var answersArray = [];
  var notAskedCount = 0;
  var askedCount = 0;
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // topic skipped?
    if(survey[skip] === "n/a"){
      notAskedCount ++;
    } else {
      askedCount ++;
      // counts for each of the responses
      for (response in allResponses){
        if (survey[response] === "TRUE"){
          allResponses[response] ++;          
        }
      };
    }  
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + askedCount.toString() + " respondents (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / askedCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount + " not asked this question)");  
  SM3();
}

function SM3(){
  var questionID = "SM3";
  var optionCount = 9;
  var questionEnglish = "During your last pregnancy, where did you receive antenatal care?";
  var questionTagalog = "Sa panahon ng iyong pagbubuntis , saan ka nagpakonsulta para mapangalagaan ang iyong pagbubuntis?";
  var other = questionID + "-other";
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var totalCount = 0;
  var homeCare = 0;
  var publicCare = 0;
  var privateCare = 0;
  var topicSkipped = 0;
  var answersEnglish = {
    "SM3-A":"your home",
    "SM3-B":"midwife",
    "SM3-C":"traditional birth attendant",
    "SM3-D":"public hospital",
    "SM3-E":"rural health unit (RHU)",
    "SM3-F":"barangay health station (BHS)",
    "SM3-G":"barangay health center (BHC)",
    "SM3-H":"private hospital",
    "SM3-I":"private clinic",
    "SM3-other":"other",
    "SM3-dk":"don't know",
    "SM3-skip":"no response"
  };
  var answersTagalog = {
    "SM3-A":"sa bahay",
    "SM3-B":"kumadrona",
    "SM3-C":"hilot",
    "SM3-D":"ospital",
    "SM3-E":false,
    "SM3-F":false,
    "SM3-G":false,
    "SM3-H":"pribadong ospital",
    "SM3-I":"pribadon klinika",
    "SM3-other":"ibang sagot",
    "SM3-dk":"hindi alam",
    "SM3-skip":"walang sagot"
  };
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[dk] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      // counts for each of the responses
      for (response in allResponses){
        
        if (survey[response] === "TRUE"){
          allResponses[response] ++;
        }
      };
      if (survey["SM3-A"] === "TRUE" || survey["SM3-B"] === "TRUE" || survey["SM3-C"] === "TRUE"){
        homeCare ++;
      } 
      if (survey["SM3-D"] === "TRUE" || survey["SM3-E"] === "TRUE" || survey["SM3-F"] === "TRUE" || survey["SM3-G"] === "TRUE"){
        publicCare ++;
      } 
      if (survey["SM3-H"] === "TRUE" || survey["SM3-I"] === "TRUE"){
        privateCare ++;
      }
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var homePerc = formatPerc(homeCare / totalCount); 
  var publicPerc = formatPerc(publicCare / totalCount);
  var privatePerc = formatPerc(privateCare / totalCount);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents (may have received care in more than one sector)</strong><br>" +
    "<span class='percText-other1'>" + homePerc + "</span> received care in home" + 
    " (" + homeCare.toString() + ")<br>" +
    "<span class='percText-other1'>" + publicPerc + "</span> received care at a public facility" + 
    " (" + publicCare.toString() + ")<br>" +
    "<span class='percText-other1'>" + privatePerc + "</span> received care at a private facility" + 
    " (" + privateCare.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped.toString() + " not asked this question)"); 
  SM4();
}

function SM4(){
  var questionID = "cbhfa-SM_group-SM4";
  var questionEnglish = "During your last pregnancy, how many months pregnant were you when you first received antenatal care?";
  var questionTagalog = "Sa panahon ng iyong pagbubuntis, ilang buwan kang buntis noong una kang magpakonsulta sa isang healthcare worker?";
  var monthResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        monthResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxMonths = Math.max.apply(Math,monthResponses);
  var minMonths = Math.min.apply(Math,monthResponses);
  var sum = 0;
  for( var i = 0; i < monthResponses.length; i++ ){
      sum += monthResponses[i];
  }
  var avgMonths = d3.round(sum/monthResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + monthResponses.length.toString() + " respondents providing # of months</strong><br>" +
    "Average months: " + avgMonths.toString() + "<br>" +
    "Min: " + minMonths.toString() + " / Max: " + maxMonths.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know <span class='text-tagalog'>[hindi alam]</span>, " + noResponseCount.toString() + " no response <span class='text-tagalog'>[walang sagot]</span>, " + 
    notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  SM5();
}

function SM5(){
  var questionID = "cbhfa-SM_group-SM5";
  var questionEnglish = "During your last pregnancy, how many times did you receive antenatal care?";
  var questionTagalog = "Sa panahon ng iyong huling pagbubuntis, ilang beses ka kumonsulta sa isang healthcare worker?";
  var numberResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        numberResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxTimes = Math.max.apply(Math,numberResponses);
  var minTimes = Math.min.apply(Math,numberResponses);
  var sum = 0;
  for( var i = 0; i < numberResponses.length; i++ ){
      sum += numberResponses[i];
  }
  var avgTimes = d3.round(sum/numberResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + numberResponses.length.toString() + " respondents providing # of times</strong><br>" +
    "Average Times: " + avgTimes.toString() + "<br>" +
    "Min: " + minTimes.toString() + " / Max: " + maxTimes.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know <span class='text-tagalog'>[hindi alam]</span>, " + noResponseCount.toString() + " no response <span class='text-tagalog'>[walang sagot]</span>, " + 
    notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  SM6();
}


function SM6(){
  var heightID = "SM6_A";
  var bpID = "SM6_B"
  var urineID = "SM6_C"
  var bloodID = "SM6_D"
  var questionEnglish = "As part of your antenatal care during this pregnancy, were any of the following done at least once?";
  var questionTagalog = "Bilang bahagi ng pangangalaga sa iyong pagbubuntis, alin man sa mga sumusunod ay nagawa isa o higit pa?";
  var heightYes = 0;
  var heightNo = 0;
  var heightSkip = 0;  
  var bpYes = 0;
  var bpNo = 0;
  var bpSkip = 0;
  var urineYes = 0;
  var urineNo = 0;
  var urineSkip = 0;
  var bloodYes = 0;
  var bloodNo = 0;
  var bloodSkip = 0;
  var notAskedCount = 0;
  var totalCount =0;
  $.each(filteredData, function(surveyIndex, survey){
    if(survey[heightID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      switch(survey[heightID]){
        case "yes": heightYes ++;
        break;
        case "no": heightNo ++;
        break;
        case "skip": heightSkip ++;
        break;
      }
      switch(survey[bpID]){
        case "yes": bpYes ++;
        break;
        case "no": bpNo ++;
        break;
        case "skip": bpSkip ++;
        break;
      }
      switch(survey[urineID]){
        case "yes": urineYes ++;
        break;
        case "no": urineNo ++;
        break;
        case "skip": urineSkip ++;
        break;
      }
      switch(survey[bloodID]){
        case "yes": bloodYes ++;
        break;
        case "no": bloodNo ++;
        break;
        case "skip": bloodSkip ++;
        break;
      }
    }
  });
  function pieData(yesCount, noCount, skipCount){
    return [
      {
        key: "yes",
        y: yesCount,
      },
      {
        key: "no",
        y: noCount,
      },
      {
        key: "skip",
        y: skipCount,
      }
    ];
  }
  $("#infoWrapper").append('<div class="row"><h4>'+ questionEnglish +'<br><small>' +  
    questionTagalog +'</small></h4><p><strong>' + totalCount.toString() + ' respondents reporting having received antenatal care</strong></p>'+
    '</div><div class="row"><div class="col-sm-6">'+
    '<h4>Was your height taken? <br><small>Sinukat ba ang iyong laki/tangkad?</small></h4>'+'<div id="' + 
    heightID + '" class="box-chart-no-float"><svg id="' +
    heightID + '_chart"></svg></div><div id="'+
    heightID + '_info" class="box-info"></div></div>'+
    '<div class="col-sm-6">' +
    '<h4>Was your blood pressure measured? <br><small>Sinukat ba ang iyong blood pressure?</small></h4>'+'<div id="' +
    bpID + '" class="box-chart-no-float"><svg id="' +
    bpID + '_chart"></svg></div><div id="'+
    bpID + '_info" class="box-info"></div></div></div>'+
    '<div class="row"><div class="col-sm-6">' + 
    '<h4>Did you give a urine sample? <br><small>Nagbigay kaba ng sample ng iyong ihi?</small></h4>'+'<div id="' +
    urineID + '" class="box-chart-no-float"><svg id="' +
    urineID + '_chart"></svg></div><div id="'+
    urineID + '_info" class="box-info"></div></div>'+
    '<div class="col-sm-6">' +
    '<h4>Did you give a blood sample? <br><small>Nagbigay k aba ng sample ng iyong dugo?</small></h4>'+'<div id="' + 
    bloodID + '" class="box-chart-no-float"><svg id="' +
    bloodID + '_chart"></svg></div><div id="'+
    bloodID + '_info" class="box-info"></div></div></div>'+
    '<hr>');
  $.each(["SM6_A","SM6_B","SM6_C","SM6_D"], function(index, questionID){
    var width = 180;
    var chart = nv.models.pie().width(width - 60).height(width - 60)
      .x(function(d) { return d.key }) 
      .y(function(d) { return d.y })
      .color(pieColors)
      .showLabels(true);
    var chartSelector = "#" + questionID + "_chart";
    var thisPieData = [];
    var yesCount = 0;
    var noCount = 0;
    var skipCount = 0;
    switch(questionID){
      case "SM6_A": 
        thisPieData = pieData(heightYes, heightNo, heightSkip);
        yesCount = heightYes;
        noCount = heightNo;
        skipCount = heightSkip;
        break;
      case "SM6_B": 
        thisPieData = pieData(bpYes, bpNo, bpSkip);
        yesCount = bpYes;
        noCount = bpNo;
        skipCount = bpSkip;
        break;
      case "SM6_C": 
        thisPieData = pieData(urineYes, urineNo, urineSkip);
        yesCount = urineYes;
        noCount = urineNo;
        skipCount = urineSkip;
        break;
      case "SM6_D": 
        thisPieData = pieData(bloodYes, bloodNo, bloodSkip);
        yesCount = bloodYes;
        noCount = bloodNo;
        skipCount = bloodSkip;
        break;
    }
    d3.select(chartSelector)
      .datum(thisPieData)
      .transition().duration(1200)
      .attr('width', width)
      .attr('height', width)
      .call(chart);
    var el = $(".nv-pieLabels");
    $.each(el, function(aIndex, a){
      a.parentNode.appendChild(a);
    });
    var infoSelector = "#" + questionID + "_info";
    var thisInfoHtml = "";
    var yesPerc = formatPerc(yesCount / (yesCount + noCount + skipCount)); 
    var noPerc = formatPerc(noCount / (yesCount + noCount + skipCount));
    var skipPerc = formatPerc(skipCount / (yesCount + noCount + skipCount));
    thisInfoHtml = "<p><span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
      yesCount.toString() + ")<br>" +
      "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
      noCount.toString() + ")<br>" + 
      "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
      skipCount.toString() + ")</p><br>";
    $(infoSelector).append(thisInfoHtml);
  });
  SM7();
}

function SM7(){
  var questionID = "SM7";
  var questionEnglish = "During your Last pregnancy did you receive an injection in the arm to prevent the baby from getting tetanus that is convulsions after birth?";
  var questionTagalog = "Sa panahon ng iyong pagbubuntis, nabigyan ka ba ng bakuna laban sa tetanus upang maiwasan ng iyong sanggol ang pagkakaroon nito?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);  
  SM8();
}
function SM8(){
  var questionID = "SM8";
  var questionEnglish = "While pregnant, how many times did you receive such an injection?";
  var questionTagalog = "Habang ikaw ay buntis, ilang beses ka nabigyan ng nasabing bakuna?";
  var answersEnglish = {
    "A":"one", 
    "B":"two",
    "C":"three or more",
    "dk":"don't know", 
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"isa",
    "B":"dalawa",
    "C":"tatlo o higit pa",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  SM9();
}
function SM9(){
  var questionID = "SM9";
  var questionEnglish = "Who assisted with the delivery of your last child?";
  var questionTagalog = false;
  var answersEnglish = {
    "SM9-A":"doctor",
    "SM9-B":"nurse",
    "SM9-C":"midwife",
    "SM9-D":"trained traditional birth attendant",
    "SM9-E":"trained community/ barangay health worker",
    "SM9-F":"relative/friend",
    "SM9-other":"other",
    "SM9-none":"no one",
    "SM9-skip":"no response"
  };
  var answersTagalog = {
    "SM9-A":"duktor",
    "SM9-B":"nars",
    "SM9-C":"kumadrona",
    "SM9-D":"hilot",
    "SM9-E":false,
    "SM9-F":"kamag-anak o kaibigan",
    "SM9-other":"ibang sagot",
    "SM9-none":"wala",
    "SM9-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  SM10();
}


function SM10(){
  var questionID = "SM10";
  var questionEnglish = "During pregnancy, women may encounter severe problems or illnesses and should go or be taken immediately to a health facility. What types of symptoms would cause you to seek immediate care at a health facility (right away)?";
  var questionTagalog = "Sa panahon ng pagbubuntis , ang mga babae ay maaaring magkaroon ng problema o matinding karamdaman at kinakailangang pumunta o agarang dalhin sa sa isang pagamutan. Anong uri ng mga sintomas ang dahilan ng agarang pagkonsulta sa isang pagamutan?";
  var answersEnglish = {
    "SM10-A":"vaginal bleeding",
    "SM10-B":"fast/difficult breathing",
    "SM10-C":"high fever",
    "SM10-D":"severe abdominal pain",
    "SM10-E":"headache/blurred vision",
    "SM10-F":"convulsions",
    "SM10-G":"foul smelling discharge/fluid from vagina",
    "SM10-H":"baby stops moving",
    "SM10-I":"leaking brownish/greenish fluid from the vagina",
    "SM10-other":"other",
    "SM10-dk":"don't know",
    "SM10-skip":"no response"
  };
  var answersTagalog = {
    "SM10-A":"pagdurugo ng pwerta",
    "SM10-B":"mabilis o hirap na paghinga",
    "SM10-C":"mataas na lagnat",
    "SM10-D":"matinding pananakit ng tiyan",
    "SM10-E":"pananakit ng ulo o panlalabo ng mata",
    "SM10-F":"kumbulsyon",
    "SM10-G":"mabahong likido mula sa pwerta",
    "SM10-H":"huminto ang paggalaw ng sanggol",
    "SM10-I":"umaagos na kulay lupa at berdeng likido mula sa pwerta",
    "SM10-other":"ibang sagot",
    "SM10-dk":"hindi alam",
    "SM10-skip":"walang sagot"
  };
  var optionCount = 9;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  SM11();
}

function SM11(){
  var questionID = "SM11";
  var questionEnglish = "After your last child was born were you and your baby seen by anyone for postnatal care within the next two days?";
  var questionTagalog = "Matapos ipanganak ang inyong bunsong anak, ikaw ba at ang iyong sanggol ay nakita, natignan ng isang health worker sa loob ng 2 araw?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  SM12();
}

function SM12(){
  var questionID = "SM12";
  var questionEnglish = "Whom did you see?";
  var questionTagalog = "Sino ang iyong kinonsulta?";
  var answersEnglish = {
    "SM9-A":"doctor or medical assistant",
    "SM9-B":"nurse",
    "SM9-C":"midwife",
    "SM9-D":"trained traditional birth attendant",
    "SM9-other":"other",
    "SM9-dk":"don't know",
    "SM9-skip":"no response"
  };
  var answersTagalog = {
    "SM9-A":"duktor",
    "SM9-B":"nars",
    "SM9-C":"kumadrona",
    "SM9-D":"hilot",
    "SM9-other":"ibang sagot",
    "SM9-dk":"hindi alam",
    "SM9-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  newborn();
}

  






function newborn(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-NB_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#newborn").show();
      NB1();
      break;
    case false:
      $("#newborn").hide();
      babynutrition();
      break;
  };
}

function NB1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_newborn'></span>Topic: Care of a Newborn</h3><hr>");
  var questionID = "NB1";
  var questionEnglish = "What are the important things for home based care of a newborn baby (immediately when born)?";
  var questionTagalog = "Ano ang mga mahahalagang bagay na dapat isaalang-alang sa pangangalaga ng bagong silang na sanggol sa bahay?";
  var answersEnglish = {
    "NB1-A":"wash hands with soap and water before delivery",
    "NB1-B":"wash hands with soap and water before handling the newborn",
    "NB1-C":"keep the cord clean and dry",
    "NB1-D":"keep the newborn baby warm",
    "NB1-E":"wrap the baby immediately or dry and put against the mother’s skin with a cloth covering",
    "NB1-F":"delay bathing for 3 days",
    "NB1-G":"babies should be put to the breast immediately after birth (within the first hour)",
    "NB1-H":"give the baby the first breast milk (thick and yellow) that comes immediately after birth",
    "NB1-I":"planned for institutional delivery",
    "NB1-other":"other",
    "NB1-dk":"don’t know",
    "NB1-skip":"no response"
  };
  var answersTagalog = {
    "NB1-A":"hugasan muna ang kamay ng sabon at tubig bago mag-paanak at bago hawakan ang sanggol",
    "NB1-B":false,
    "NB1-C":false,
    "NB1-D":"panatilihing mainit ang sanggol",
    "NB1-E":"balutin agad o patuyuin ang sanggol at itabi ito malapit sa kanyang ina",
    "NB1-F":"ipagliban ang paligo sa sanggol ng 3 araw",
    "NB1-G":"pasusuhin agad ang sanggol pagkapanganak sa loob ng 1 oras",
    "NB1-H":"bigyan ang sanggol ng unang patak ng gatas ng kanyang ina (malapot at kulay dilaw) pagkapanganak",
    "NB1-I":false,
    "NB1-other":"ibang sagot",
    "NB1-dk":"hindi alam",
    "NB1-skip":"walang sagot"
  };
  var optionCount = 9;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  NB6();
}


function NB6(){
  var questionID = "NB6";
  var questionEnglish = "Sometimes newborns have severe illnesses within the first month of life and should be taken immediately to a health facility. What types of symptoms would cause you to take your newborn to a health facility right away?";
  var questionTagalog = "Minsan ang mga bagong panganak na saggol ay maaaring magkaroon ng matinding karamdaman sa loob lamang ng 1 buwan pagkapanganak kailangang madala agad sa isang pagamutan upang masuri. Anong uri ng mga sintomas ang dahilan ng agarang pagkonsulta sa isang pagamutan?";
  var answersEnglish = {
    "NB6-A":"convulsions",
    "NB6-B":"high fever",
    "NB6-C":"poor suckling or feeding",
    "NB6-D":"fast/difficult breathing",
    "NB6-E":"baby feels cold",
    "NB6-F":"baby too small/too early",
    "NB6-G":"yellow palms/soles/eyes",
    "NB6-H":"swollen abdomen",
    "NB6-I":"unconscious",
    "NB6-J":"pus or redness of the umbilical stump, eyes or skin",
    "NB6-other":"other",
    "NB6-dk":"don't know",
    "NB6-skip":"no response"
  };
  var answersTagalog = {
    "NB6-A":"kumbulsyon",
    "NB6-B":"mataas na lagnat",
    "NB6-C":"hindi makasuso o makakain ng maayos",
    "NB6-D":"mabilis/ hirap na paghinga",
    "NB6-E":"nanlalamig",
    "NB6-F":"sanggol ay maliit/maagang ipinanganak",
    "NB6-G":"madilaw ang palad/talampakan/mata",
    "NB6-H":"namamaga ang tiyan",
    "NB6-I":"walang malay",
    "NB6-J":"may nana o pamumula sa kanyang pusod, mata, o balat",
    "NB6-other":"ibang kasagutan",
    "NB6-dk":"hindi alam",
    "NB6-skip":"walang sagot"
  };
  var optionCount = 10;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  NB2();
}

function NB2(){
  var questionID = "NB2";
  var questionEnglish = "Did you breastfeed your last baby?";
  var questionTagalog = false;
  analysisYesNo(questionID, questionEnglish, questionTagalog);   
  NB3();
}

function NB3(){
  var questionID = "NB3";
  var questionEnglish = "How long after birth did you first put baby to the breast?";
  var questionTagalog = "Pagkapanganak, gaano katagalbago mo pinasuso ng iyong gatas ang iyong sanggol?";
  var answersEnglish = {
    "immediate":"immediate",
    "hours":"hours",
    "days":"days",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "immediate":false,
    "hours":"oras pagkapanganak ng sanggol",
    "days":"araw pagkapanganak ng sanggol",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> If less than 24 hours record 'hours', otherwise record 'days'</small><br>";
  $(infoSelector).append(thisNote);

  NB4();
}

function NB4(){
  var questionID = "NB4";
  var questionEnglish = "Did you give the baby the first liquid (Colostrum) that came from your breasts?";
  var questionTagalog = "Binigyan mo ba ang sanggol ng unang patak ng iyong gatas (Colostrum)?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  NB5();   
}

function NB5(){
  var questionID = "NB5";
  var questionEnglish = "In the first three days after delivery, was the baby given anything to drink other than breast milk?";
  var questionTagalog = "Sa unang tatlong araw matapos mong manganak, binigyan mo ba ng anumang/ibang inumin ang iyong sanggol maliban sa iyong gatas?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Survey design error meant all section respondents were asked this question and not just those who answered <i>yes</i> to <i>Did you breastfeed your last baby?</i></small><br>";
  $(infoSelector).append(thisNote);
  NU2();
}

function NU2(){
  var questionID = "NU2";
  var questionEnglish = "For how many months did you breastfeed your last baby?";
  var questionTagalog = "Ilang buwan mo pinasuso ng iyong gatas ang iyong bunsong anak?";
  var monthResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        monthResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxMonths = Math.max.apply(Math,monthResponses);
  var minMonths = Math.min.apply(Math,monthResponses);
  var sum = 0;
  for( var i = 0; i < monthResponses.length; i++ ){
      sum += monthResponses[i];
  }
  var avgMonths = d3.round(sum/monthResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + monthResponses.length.toString() + " respondents providing # of months</strong><br>" +
    "Average months: " + avgMonths.toString() + "<br>" +
    "Min: " + minMonths.toString() + " / Max: " + maxMonths.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know, " + noResponseCount.toString() + " no response, " + 
    notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  babynutrition();
}













function babynutrition(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-NU_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#babynutrition").show();
      NU3breastmilk();
      break;
    case false:
      $("#babynutrition").hide();
      immunization();
      break;
  };
}

function NU3breastmilk(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_babynutrition'></span>Topic: Baby Nutrition</h3><hr>");
  var questionID = "NU3_breastmilk";
  var questionEnglish = "Now I would like to ask you about liquids or foods children had yesterday during the day or at night. Did your child/children drink/eat: <u>Breast milk</u>?";
  var questionTagalog = "Ano-anong uri ng pagkain at inumin ang binigay mo sa iyong mga anak kahapon mula umaga hanggang gabi? Kumain o uminom ang iyong mga anak ng: <u>Gatas ng ina</u>?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  NU3plainwater();
}

function NU3plainwater(){
  var questionID = "NU3_plainwater";
  var questionEnglish = "Now I would like to ask you about liquids or foods children had yesterday during the day or at night. Did your child/children drink/eat: <u>Plain water</u>?";
  var questionTagalog = "Ano-anong uri ng pagkain at inumin ang binigay mo sa iyong mga anak kahapon mula umaga hanggang gabi? Kumain o uminom ang iyong mga anak ng: <u>Tubig</u>?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  NU3formula();
}

function NU3formula(){
  var questionID = "NU3_formula";
  var questionEnglish = "Now I would like to ask you about liquids or foods children had yesterday during the day or at night. Did your child/children drink/eat: <u>Commercially produced infant formula</u>?";
  var questionTagalog = "Ano-anong uri ng pagkain at inumin ang binigay mo sa iyong mga anak kahapon mula umaga hanggang gabi? Kumain o uminom ang iyong mga anak ng: <u>Commercially produced infant formula</u>?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  NU3commercialfood();
}

function NU3commercialfood(){
  var questionID = "NU3_commercialfood";
  var questionEnglish = "Now I would like to ask you about liquids or foods children had yesterday during the day or at night. Did your child/children drink/eat: <u>Any fortified, commercially available infant and young child food (e.g. Cerelac)</u>?";
  var questionTagalog = "Ano-anong uri ng pagkain at inumin ang binigay mo sa iyong mga anak kahapon mula umaga hanggang gabi? Kumain o uminom ang iyong mga anak ng: <u>Any fortified, commercially available infant and young child food (e.g. Cerelac)</u>?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  NU3porridge();
}

function NU3porridge(){
  var questionID = "NU3_porridge";
  var questionEnglish = "Now I would like to ask you about liquids or foods children had yesterday during the day or at night. Did your child/children drink/eat: <u>Any (other) porridge or gruel</u>?";
  var questionTagalog = "Ano-anong uri ng pagkain at inumin ang binigay mo sa iyong mga anak kahapon mula umaga hanggang gabi? Kumain o uminom ang iyong mga anak ng: <u>Lugaw o am</u>?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  NU4();
}

function NU4(){
  var questionID = "NU4";
  var questionEnglish = "How many times did Baby eat solid, semi-solid, or soft foods other than liquids yesterday during the day or at night?";
  var questionTagalog = "Ilang beses kumain ang iyong sanggol ng solid, semi-solid, soft foods maliban sa inumin kahapon mula umaga hanggang gabi?";
  analysisHowManyTimes(questionID, questionEnglish, questionTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Find out how many times the child ate enough to be full.  Small snacks and small feeds such as one or two bites of mother’s or sister’s food should not be counted. Liquids do not count for this question.  Do not include thin soups or broth, watery gruels, or any other liquid.  If caregiver answers seven or more times, record '7'.<br>";
  $(infoSelector).append(thisNote);
  NU5();  
}
  
function NU5(){
  var questionID = "NU5";
  var questionEnglish = "In the last 24 hours did you give <u>cereal</u> to baby?";
  var questionTagalog = "Sa nakalipas na 24 oras pinakain mo ba ang iyong sanggol ng <u>cereal</u>?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NU6();
}
function NU6(){
  var questionID = "NU6";
  var questionEnglish = "In the last 24 hours did you give <u>alm/rice</u> porridge to baby?";
  var questionTagalog = "Sa nakalipas na 24 oras pinakain mo ba ang iyong sanggol ng <u>am o lugaw</u>?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NU7();
}
function NU7(){
  var questionID = "NU7";
  var questionEnglish = "In the last 24 hours did you give <u>vegetables</u> to baby?";
  var questionTagalog = "Sa nakalipas na 24 oras pinakain mo ba ang iyong sanggol ng <u>gulay</u>?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NU8();
}
function NU8(){
  var questionID = "NU8";
  var questionEnglish = "In the last 24 hours did you give <u>milk</u> to baby?";
  var questionTagalog = "Sa anakalipas na 24 oras pina-inom mo ba ang iyong sanggol ng <u>gatas</u>?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NU9();
}
function NU9(){
  var questionID = "NU9";
  var questionEnglish = "In the last 24 hours did you give <u>fruits</u> to baby?";
  var questionTagalog = "Sa nakalipas na 24 oras pinakain mo ba ang iyong sanggol ng <u>prutas</u>?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NU10();
}
function NU10(){
  var questionID = "NU10";
  var questionEnglish = "In the last 24 hours did you give <u>egg</u> to baby?";
  var questionTagalog = "Sa nakalipas na 24 oras pinakain mo ba ang iyong sanggol ng <u>itlog</u>?";
  analysisYesNoDontEat(questionID, questionEnglish, questionTagalog);
  NU11();
}
function NU11(){
  var questionID = "NU11";
  var questionEnglish = "In the last 24 hours did you give <u>fish</u> to baby?";
  var questionTagalog = "Sa nakalipas na 24 oras pinakain mo ba ang iyong sanggol ng <u>isda</u>?";
  analysisYesNoDontEat(questionID, questionEnglish, questionTagalog);
  NU12();
}
function NU12(){
  var questionID = "NU12";
  var questionEnglish = "In the last 24 hours did you give <u>meat</u> to baby?";
  var questionTagalog = "Sa nakalipas na 24 oras pinakain mo ba ang iyong sanggol ng <u>karne</u>?";
  analysisYesNoDontEat(questionID, questionEnglish, questionTagalog);
  NU13();
}

function NU13(){
  var questionID = "NU13";
  var questionEnglish = "What are the signs that a child that would suggest s/he was malnourished and should be referred to health facility?";
  var questionTagalog = "Ano ang mga sintomas na iyong makikita sa batang may malnutrisyon at kailangang madala at masuri agad sa isang pagamutan?";
  var answersEnglish = {
    "NU13-A":"underweight",
    "NU13-B":"no fat on the body, and ribs visible",
    "NU13-C":"loose skin around the buttocks",
    "NU13-D":"easily irritated",
    "NU13-E":"usually appetite and normal hair",
    "NU13-F":"frequent illnesses",
    "NU13-G":"severe swelling (oedema) on both limbs or both arms",
    "NU13-H":"swollen “moon” face",
    "NU13-I":"damaged skin or different skin colour",
    "NU13-J":"hair colour changes (yellow/reddish or discoloured)",
    "NU13-K":"hair becomes dry, can be easily pulled out an leaves bald patches",
    "NU13-other":"other",
    "NU13-dk":"don't know",
    "NU13-skip":"no response"
  };
  var answersTagalog = {
    "NU13-A":"kulang sa timbang",
    "NU13-B":"walang makikitang taba sa katawan/payat",
    "NU13-C":"laylay ang balat sa kanyang pwetan",
    "NU13-D":"madaling mainis/mairita",
    "NU13-E":"may gana sa pagkain at nurmal ang buhok",
    "NU13-F":"madalas magkasakit",
    "NU13-G":"matinding pamamaga ng mga kamay at iba pang bahagi ng katawan",
    "NU13-H":"pamamaga ng mukha",
    "NU13-I":"sira o hindi pantay na kulay ng balat",
    "NU13-J":"kakaibang kulay ng buhok (naninilaw/namumula o nag-iibang kulay)",
    "NU13-K":"ang buhok ay madaling maputol at matigas",
    "NU13-other":"iba pang kasagutan",
    "NU13-dk":"hindi alam",
    "NU13-skip":"walang sagot"
  };
  var optionCount = 11;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  immunization();
}















function immunization(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-IM_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#immunization").show();
      IM1();
      break;
    case false:
      $("#immunization").hide();
      sanitation();
      break;
  };
}


function IM1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_immunization'></span>Topic: Immunization and Vaccination Campaigns</h3><hr>");


  var questionID = "IM1";
  var questionEnglish = "Do you have a card or child health booklet where vaccinations are written down?";
  var questionTagalog = "Mayroon ka bang card o child health booklet kung saan naka-rekord/nakatala ang nga bakuna na natanggap ng iyong mga anak?";
  var AyesCount = 0;
  var ByesCount = 0;
  var CnoCount = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "A"){
        AyesCount ++;
      }
      if (survey[questionID] === "B"){
        ByesCount ++;
      }
      if (survey[questionID] === "C"){
        CnoCount ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "no card",
      y: CnoCount,
    },
    {
      key: "yes, seen",
      y: AyesCount,
    },
    {
      key: "yes, not seen",
      y: ByesCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var AyesPerc = formatPerc(AyesCount / totalCount); 
  var ByesPerc = formatPerc(ByesCount / totalCount); 
  var CnoPerc = formatPerc(CnoCount / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + CnoPerc + "</span> no <span class='text-tagalog'>[wala]</span> (" + 
    CnoCount.toString() + ")<br>" +
    "<span class='percText-2'>" + AyesPerc + "</span> yes, seen by interviewer <span class='text-tagalog'>[oo, nakita ng tagatanong]</span> (" +
    AyesCount.toString() + ")<br>" +
    "<span class='percText-3'>" + ByesPerc + "</span> yes, not seen <span class='text-tagalog'>[oo, ngunit hindi nakita]</span> (" +
    ByesCount.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question)";
  }
  thisInfoHtml += "</p>";
  $(infoSelector).append(thisInfoHtml); 
  IM2A();  
}

function IM2A(){
  var questionID = "IM2A";
  var questionEnglish = "Did you ever have a vaccination card for baby?";
  var questionTagalog = "Nagkaroon ka ba ng vaccination card para sa iyong sanggol?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Only asked if response to previous question was 'no card' <span class='text-tagalog'>[wala]</span><br>";  
  IM2B();
}

function IM2B(){
  var questionID = "IM2B";
  var questionEnglish = "Where did you go to provide vaccines to your child/ children?";
  var questionTagalog = "Saan ka pumunta upang pabakunahan ang iyong anak/ mga anak?";
  var answersEnglish = {
    "IM2B-A":"your home",
    "IM2B-B":"midwife",
    "IM2B-C":"traditional birth attendant (TBA)",
    "IM2B-D":"public hospital",
    "IM2B-E":"rural health unit (RHU)",
    "IM2B-F":"barangay health station (BHS)",
    "IM2B-G":"barangay health center (BHC)",
    "IM2B-H":"private hospital",
    "IM2B-I":"private clinic",
    "IM2B-none":"children not vaccinated",
    "IM2B-other":"other",
    "IM2B-dk":"don't know",
    "IM2B-skip":"no response"
  };
  var answersTagalog = {
    "IM2B-A":"sa bahay",
    "IM2B-B":"kumadrona",
    "IM2B-C":"hilot",
    "IM2B-D":"ospital",
    "IM2B-E":false,
    "IM2B-F":false,
    "IM2B-G":false,
    "IM2B-H":"pribadong ospital",
    "IM2B-I":"pribadong klinika",
    "IM2B-none":false,
    "IM2B-other":"ibang sagot",
    "IM2B-dk":"hindi alam",
    "IM2B-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  IM2C();
}

function IM2C(){
  var questionID = "IM2C";
  var questionEnglish = "Who assisted with the vaccinations?";
  var questionTagalog = "Sino ang nagsasagawa ng pagpapabakuna?";
  var answersEnglish = {
    "IM2C-A":"doctor",
    "IM2C-B":"nurse",
    "IM2C-C":"midwife",
    "IM2C-D":"traditional birth attendant",
    "IM2C-E":"trained community/ barangay health worker",
    "IM2C-F":"relative/ friend",
    "IM2C-other":"other",
    "IM2C-none":"no one",
    "IM2C-skip":"no response"
  };
  var answersTagalog = {
    "IM2C-A":"duktor",
    "IM2C-B":"nars",
    "IM2C-C":"kumadrona",
    "IM2C-D":"hilot",
    "IM2C-E":false,
    "IM2C-F":"kamang-anak o kaibigan",
    "IM2C-other":"ibang sagot",
    "IM2C-none":"wala",
    "IM2C-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Probe for the type(s) of person(s) and record all mentioned.<br>";
  $(infoSelector).append(thisNote);
  IM3();
}

function IM3(){
  var questionID = "IM3_permission";
  var questionEnglish = "May I copy the information from the card? / May I ask you about vaccinations received by your child?";
  var questionTagalog = false;
  observationStartOptions(questionID, questionEnglish, questionTagalog);
  BCG();
}

function BCG(){
  var questionID = "BCG_record";
  var questionEnglish = "BCG (TB injection in arm often scar)";
  var questionTagalog = "BCG (TB injection sa braso at kadalasan may peklat)";
  vaccineCard(questionID, questionEnglish, questionTagalog);
  OPV0();
}
function OPV0(){
  var questionID = "OPV0_record";
  var questionEnglish = "POLIO 0 (drops given at birth or before 6 weeks)";
  var questionTagalog = "POLIO 0 (patak na ibinibigay pagkapanganak o bago mag 6 na linggo)";
  vaccineCard(questionID, questionEnglish, questionTagalog);
  OPV1();
}
function OPV1(){
  var questionID = "OPV1_record";
  var questionEnglish = "POLIO 1 (drops in mouth)";
  var questionTagalog = "POLIO 1 (pinapatak sa bibig)";
  vaccineCard(questionID, questionEnglish, questionTagalog);
  OPV2();
}
function OPV2(){
  var questionID = "OPV2_record";
  var questionEnglish = "POLIO 2";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  OPV3();
}
function OPV3(){
  var questionID = "OPV3_record";
  var questionEnglish = "POLIO 3";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  DTP1();
}

function DTP1(){
  var questionID = "DTP1_record";
  var questionEnglish = "DTP 1 (leg injection often with polio)";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  DTP2();
}
function DTP2(){
  var questionID = "DTP2_record";
  var questionEnglish = "DTP 2";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  DTP3();
}
function DTP3(){
  var questionID = "DTP3_record";
  var questionEnglish = "DTP 3";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  HepB1();
}

function HepB1(){
  var questionID = "HepB1_record";
  var questionEnglish = "Hepatitis B 1";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  HepB2();
}
function HepB2(){
  var questionID = "HepB2_record";
  var questionEnglish = "Hepatitis B 2";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  HepB3();
}
function HepB3(){
  var questionID = "HepB3_record";
  var questionEnglish = "Hepatitis B 3";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  MeaslesVac();
}
function MeaslesVac(){
  var questionID = "Measles_record";
  var questionEnglish = "Measles";
  var questionTagalog = false;
  vaccineCard(questionID, questionEnglish, questionTagalog);
  IM4();
}




function IM4(){
  var questionID = "IM4";
  var questionEnglish = "Can you tell me what diseases can be prevented using immunizations?";
  var questionTagalog = "Maaari mo bang sabihin kung ano ang mga sakit na maaaring maiwasan sa pamamagitan ng pagbabakuna?";
  var answersEnglish = {
    "IM4-A":"Tuberculosis (TB)",
    "IM4-B":"Polio",
    "IM4-C":"Diphtheria",
    "IM4-D":"Whooping Cough (Pertusis)",
    "IM4-E":"Tetanus",
    "IM4-F":"Measles",
    "IM4-G":"Hepatitis B",
    "IM4-H":"Hepatitis A",
    "IM4-I":"Yellow Fever",
    "IM4-J":"Meningitis",
    "IM4-K":"Rotavirus",
    "IM4-L":"Pneumococcal Disease",
    "IM4-M":"Japanese Encephalitis",
    "IM4-N":"Human Papiloma Virus",
    "IM4-O":"Rabies",
    "IM4-other":"other",
    "IM4-dk":"don't know",
    "IM4-skip":"no response"
  };
  var answersTagalog = {
    "IM4-A":false,
    "IM4-B":false,
    "IM4-C":false,
    "IM4-D":false,
    "IM4-E":false,
    "IM4-F":false,
    "IM4-G":false,
    "IM4-H":false,
    "IM4-I":false,
    "IM4-J":false,
    "IM4-K":false,
    "IM4-L":false,
    "IM4-M":false,
    "IM4-N":false,
    "IM4-O":false,
    "IM4-other":"iba pang kasagutan",
    "IM4-dk":"hindi alam",
    "IM4-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Do not read responses. Record all that are mentioned. " + 
    "<span class='text-tagalog'>[Wag basahin ang mga pagpipilian. Itala lahat ng nabanggit.]</span><br>";
  $(infoSelector).append(thisNote);
  sanitation();
}















function sanitation(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-IM_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#sanitation").show();
      WS1();
      break;
    case false:
      $("#sanitation").hide();
      diarrhoea();
      break;
  };
}

function WS1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_sanitation'></span>Topic: Safe Water, Hygiene, and Sanitation</h3><hr>");
  var questionID = "cbhfa-WS_group-WS1";
  var questionEnglish = "What is the main source of drinking water for members of this household?";
  var questionTagalog = "Ano ang pangunahing pinagkukunan niyo ng inuming tubig sa inyong tahanan?";
  var answersEnglish = {
    "A":"piped water into dwelling",
    "B":"piped water into yard/plot/building",
    "C":"public tap/standpipe",
    "D":"tubewell/borehole",
    "E":"protected dug well",
    "F":"unprotected dug well",
    "G":"protected spring",
    "H":"unprotected spring",
    "I":"rain water collection",
    "J":"cart with small tank/drum",
    "K":"tanker truck",
    "L":"bottled water",
    "M":"surface water (river/pond/lake/dam/stream/canal/irrigation channels) ",
    "other":"other <span class='text-tagalog'>[iba pang kasagutan]</span>",
    "skip":"no response <span class='text-tagalog'>[walang sagot]</span>",
  };
  var answersTagalog = {
    "A":false,
    "B":false,
    "C":false,
    "D":false,
    "E":false,
    "F":false,
    "G":false,
    "H":false,
    "I":false,
    "J":false,
    "K":false,
    "L":false,
    "M":false,
    "other":"iba pang kasagutan",
    "skip":"walang sagot",
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  WS2();
}

function WS2(){
  var questionID = "WS2";
  var questionEnglish = "Do you treat your water in any way to make it safer for drinking?";
  var questionTagalog = "May ginagawa ka bang paraan upang maging malinis at ligtas na inumin ang inyong tubig?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  WS3();     
}

function WS3(){
  var questionID = "WS3";
  var questionEnglish = "What do you usually do to the water to make it safer to drink?";
  var questionTagalog = "Ano ang karaniwan mong ginagawa upang maging ligtas ang inyong iniinom na tubig?";
  var answersEnglish = {
    "WS3-A":"let it stand and settle/sedimentation ",
    "WS3-B":"strain it through cloth",
    "WS3-C":"boil",
    "WS3-D":"add bleach/chlorine",
    "WS3-E":"water filter (ceramic, sand, composite)",
    "WS3-F":"solar disinfection",
    "WS3-other":"other",
    "WS3-dk":"don't know",
    "WS3-skip":"no response"
  };
  var answersTagalog = {
    "WS3-A":"tanggalin ang mga latak",
    "WS3-B":"salain gamit ang malinis na tela",
    "WS3-C":"pakuluan",
    "WS3-D":"maglagay ng bleach o chlorine",
    "WS3-E":"paggamit ng mga pansala (ceramic, sand, composite)",
    "WS3-F":"pagbibilad sa araw",
    "WS3-other":"ibang sagot",
    "WS3-dk":"hindi alam",
    "WS3-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Only check more than one response, if several methods are usually used together, for example, cloth filtration and chlorine. "+
    "<span class='text-tagalog'>[Markahan lamang kung higit sa isa ang sagot, kung iba-ibang pamamaraan ang kadalasang ginagamit ng sabay-sabay, kagaya ng, pagsala sa tela at chlorine.]</span><br>";
  $(infoSelector).append(thisNote);
  WS4();
}
   
function WS4(){
  var questionID = "WS4";
  var questionEnglish = "What kind of toilet facility does this household use?";
  var questionTagalog = "Anong uri ng palikuran ang inyong ginagamit sa bahay?";
  var answersEnglish = {
    "A":"piped sewer system and flush/pour-flush toilet",
    "B":"septic tank and flush/pour-flush toilet",
    "C":"pit and flush/pour-flush toilet",
    "D":"elsewhere and flush/pour-flush toilet",
    "E":"to don’t know where and flush/pour-flush toilet",
    "F":"ventilated improved pit latrine (vip)",
    "G":"simple pit latrine with slab",
    "H":"pit latrine without slab/open pit",
    "I":"composting/dry toilet",
    "J":"service or bucket latrine (where excreta are manually removed)",
    "K":"hanging latrine",
    "L":"no facility, field, bush, plastic bag",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":false,
    "B":false,
    "C":false,
    "D":false,
    "E":false,
    "F":false,
    "G":false,
    "H":false,
    "I":false,
    "J":false,
    "K":false,
    "L":false,
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  WS5();
}

function WS5(){
  var questionID = "WS5";
  var questionEnglish = "Where is this toilet facility located?";
  var questionTagalog = "Saan matatagpuan ang inyong palikuran/banyo?";
  var answersEnglish = {
    "A":"inside or attached to dwelling",
    "B":"elsewhere inside yard",
    "C":"outside yard",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"sa loon ng bahay/tahanan",
    "B":"kahit saan sa loon ng bakuran",
    "C":"sa labas ng bakuran",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  WS6();
}

function WS6(){
  var questionID = "WS6";
  var questionEnglish = "Is this toilet facility shared?";
  var questionTagalog = false;
  var answersEnglish = {
    "yes":"yes",
    "no":"not shared (just myself)",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "yes":"oo",
    "no":"walang iba (ako lang)",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  WS6number();
}

function WS6number(){
  var questionID = "WS6_number";
  var questionEnglish = "How many people share this toilet facility?";
  var questionTagalog = "Ilang tao ang gumagamit sa inyong palikuran?";
  var numberResponses = [];
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        numberResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxNumber = Math.max.apply(Math,numberResponses);
  var minNumber = Math.min.apply(Math,numberResponses);
  var sum = 0;
  for( var i = 0; i < numberResponses.length; i++ ){
      sum += numberResponses[i];
  }
  var avgNumber = d3.round(sum/numberResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + numberResponses.length.toString() + " respondents providing # of people</strong><br>" +
    "Average number: " + avgNumber.toString() + "<br>" +
    "Min: " + minNumber.toString() + " / Max: " + maxNumber.toString() + "<br>"+
    "(" + notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  WS7();
}

function WS7(){
  var questionID = "WS7";
  var questionEnglish = "May I see the toilet facility? Or can I use the toilet?";
  var questionTagalog = "Maaari bang makigamit ng inyong palikuran?";
  observationStartOptions(questionID, questionEnglish, questionTagalog);
  WS8A();
}

function WS8A(){
  var questionID = "WS8A";
  var questionEnglish = "[elsewhere inside yard / outside yard] Toilet facility observation. Access to the facility… are there obstacles in the path, are there signs of regular use?";
  var questionTagalog = "[kahit saan sa loon ng bakuran / sa labas ng bakuran] Obserbahan ang daanan papunta sa pasilidad; mayroon bang mga harang sa daan, mayroon bang sinyales ng kadalasang pagkagamit?";
  var answersEnglish = {
    "WS8A-A":"dense vegetation in its path",
    "WS8A-B":"waste or debris in its path",
    "WS8A-C":"major crevices or potholes in its path",
    "WS8A-D":"mud in its path",
    "WS8A-E":"path is clear",
    "WS8A-F":"path well worn as sign of regular use ",
    "WS8A-G":"entrance is clear/door not locked",
    "WS8A-H":"entrance is obstructed ",
    "WS8A-I":"facility is locked ",
    "WS8A-other":"other observation",
    "WS8A-no":"cannot assess"
  };
  var answersTagalog = {
    "WS8A-A":"makapal na halamanan sa daan",
    "WS8A-B":"mga dumi o kalat sa daan",
    "WS8A-C":"malaking siwang o butas sa daan",
    "WS8A-D":"putik sa daan",
    "WS8A-E":"walang sagabal sa daan",
    "WS8A-F":"gamit na husto ang daan bilang sinyalis ng regular na paggamit",
    "WS8A-G":"walang sagabal sa pasukan/hindi nakakandado ang pinto",
    "WS8A-H":"may harang ang pasukan",
    "WS8A-I":"nakakandado ang pasilidad",
    "WS8A-other":"iba pang obserbasyon",
    "WS8A-no":"hindi masuri"
  };
  observeMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  WS8B();
}

function WS8B(){
  var questionID = "WS8B";
  var questionEnglish = "[inside or attached to dwelling] Toilet facility observation. Access to the facility… are there obstacles in the path, are there signs of regular use?";
  var questionTagalog = "[sa loon ng bahay/tahanan] Obserbahan ang daanan papunta sa pasilidad; mayroon bang mga harang sa daan, mayroon bang sinyales ng kadalasang pagkagamit?";
  var answersEnglish = {
    "WS8B-G":"entrance is clear/door not locked",
    "WS8B-H":"entrance is obstructed ",
    "WS8B-I":"facility is locked ",
    "WS8B-other":"other observation",
    "WS8B-no":"cannot assess"
  };
  var answersTagalog = {
    "WS8B-G":"walang sagabal sa pasukan/hindi nakakandado ang pinto",
    "WS8B-H":"may harang ang pasukan",
    "WS8B-I":"nakakandado ang pasilidad",
    "WS8B-other":"iba pang obserbasyon",
    "WS8B-no":"hindi masuri"
  };
  observeMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  WS9();
}

function WS9(){
  var questionID = "WS9";
  var questionEnglish = "Toilet facility observation: Is there faecal matter present inside the facility - on seat, floor, door, or walls (human or animal)?";
  var questionTagalog = "Pagmamasid sa palikuran/banyo: Mayroon bang dumi na nakakalat sa sahig, pinto, pader (tao o hayop)?";
  analysisAssessYesNo(questionID, questionEnglish, questionTagalog);
  WS10();
}
function WS10(){
  var questionID = "WS10";
  var questionEnglish = "Toilet facility observation: Is there any overflow of the sewer or septic systems?";
  var questionTagalog = "Pagmamasid sa palikuran/banyo: Mayroon bang pag-apaw sa padalaluyan o septik?";
  analysisAssessYesNo(questionID, questionEnglish, questionTagalog);  
  WS11();
}
function WS11(){
  var questionID = "WS11";
  var questionEnglish = "Toilet facility observation: Is there a cover on the hole?";
  var questionTagalog = "Pagmamasid sa palikuran/banyo: Mayroon bang takip ang butas?";
  analysisAssessYesNo(questionID, questionEnglish, questionTagalog);   
  WS12();
}

function WS12(){
  var questionID = "WS12";
  var questionEnglish = "Can you show me where you usually wash your hands and what you use to wash hands? Or can I wash my hands?";
  var questionTagalog = "Maaari mo bang ipakita sakin kung saan kayo kadalasang naghuhugas ng kamay at kung ano ang inyong ginagamit sa paghuhugas? Or Maaari ba akong makihugas ng kamay?";
  var answersEnglish = {
    "A":"inside/near toilet facility",
    "B":"inside/near kitchen/cooking place",
    "C":"elsewhere in yard",
    "D":"outside yard",
    "E":"no specific place",
    "F":"no permission to see"
  };
  var answersTagalog = {
    "A":"sa loob o malapit sa palikuran/banyo",
    "B":"sa kusina/lutuan",
    "C":"sa bakuran",
    "D":"labas ng bakuran",
    "E":"walang saktong lugar",
    "F":"hindi pinakita"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Ask to see and observe. "+
    "<span class='text-tagalog'>[Tanungin upang makita at mamasid.]</span><br>";
  $(infoSelector).append(thisNote);
  WS13();
}

function WS13(){
  var questionID = "WS13";
  var questionEnglish = "Observation only: Is there soap or detergent or locally used cleansing agent?";
  var questionTagalog = "Pagmamasid lamang: Mayroon bang sabon o tradisyonal na ginagamit na panlinis?";
  var answersEnglish = {
    "A":"soap",
    "B":"detergent",
    "C":"mud or sand",
    "D":"none",
    "E":"no specific place",
    "other":"other",
    "G":"no permission to see"
  };
  var answersTagalog = {
    "A":"sabong panligo",
    "B":"sabong panlaba",
    "C":"putik o buhangin",
    "D":"wala",
    "E":"walang saktong lugar",
    "other":"ibang sagot",
    "G":"hindi pinakita"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> This item should be either in place or brought by the interviewee within one minute. If the item is not present within one minute check none, even if brought out later. "+
    "<span class='text-tagalog'>[Ang mga bagay na ito ay dapat nakalagay o dala ng ini-interbyu sa loob ng isang minuto. Kapag ang bagay na ito ay wala sa loob ng isang minuto, markahan ang none o wala, kahit na makapagdala nito maya-maya.]</span><br>";
  $(infoSelector).append(thisNote);
  WS14();
}

function WS14(){
  var questionID = "WS14";
  var questionEnglish = "Observation only: Is there water?";
  var questionTagalog = "Pagmamasid lamang: Mayroon bang tubig?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> Turn on tap and/or a check container and note if water is present. "+
    "<span class='text-tagalog'>[Buksan ang gripo at/o tingnan ang lalagyan kung mayroon ba itong laman na tubig.]</span><br>";
  $(infoSelector).append(thisNote);
  WS15();     
}
function WS15(){
  var questionID = "WS15";
  var questionEnglish = "Observation only: Is there a handwashing device such as a tap, basin, bucket, sink, or tippy tap?";
  var questionTagalog = "Pagmamasid lamang: Mayroon bang kagamitan para sa paghuhugas ng kamay katulad ng gripo, palanggana, balde o lababo?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> This item should be either in place or brought by the interviewee within one minute. If the item is not present within one minute check none, even if brought out later. "+
    "<span class='text-tagalog'>[Ang mga bagay na ito ay dapat nakalagay o dala ng ini-interbyu sa loob ng isang minuto. Kapag ang bagay na ito ay wala sa loob ng isang minuto, markahan ang none o wala, kahit na makapagdala nito maya-maya.]</span><br>";
  $(infoSelector).append(thisNote);
  WS16();     
}

function WS16(){
  var questionID = "WS16";
  var questionEnglish = "Do you know when to wash hands with soap?";
  var questionTagalog = "Tuwing kalian dapat naghuhugas ng kamay?";
  var answersEnglish = {
    "WS16-never":"never",
    "WS16-A":"after defecating",
    "WS16-B":"after urinating",
    "WS16-C":"before food preparation",
    "WS16-D":"before eating",
    "WS16-E":"before feeding children/baby",
    "WS16-F":"after cleaning baby/changing diapers",
    "WS16-G":"after handling animals",
    "WS16-H":"after caring for an ill person",
    "WS16-I":"no special time, when they are dirty",
    "WS16-dk":"don't know",
    "WS16-other":"other",
    "WS16-skip":"no response"
  };
  var answersTagalog = {
    "WS16-never":"hindi kailanman",
    "WS16-A":"pagkatapos dumumi",
    "WS16-B":"pagkatapos umihi",
    "WS16-C":"bago magluto",
    "WS16-D":"bago kumain",
    "WS16-E":"bago pakainin ang sanggol/anak",
    "WS16-F":"pagkatapos linisan o palitan ng diaper ang sanggol",
    "WS16-G":"pagkatapos humawak ng hayop",
    "WS16-H":"pagkatapos humawak sa may sakit ",
    "WS16-I":"kung madumi lamang ang kamay",
    "WS16-dk":"hindi alam",
    "WS16-other":"ibang sagot",
    "WS16-skip":"walang sagot"
  };
  var optionCount = 9;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  diarrhoea();
}









function diarrhoea(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-DI_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#diarrhoea").show();
      DI1();
      break;
    case false:
      $("#diarrhoea").hide();
      ari();
      break;
  };
}

function DI1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_diarrhoea'></span>Topic: Diarrhoea and Dehydation</h3><hr>");
  var questionID = "DI1";
  var questionEnglish = "Has any family member had Diarrhea in the last 2 weeks? (define it if needed)";
  var questionTagalog = "Mayroon bang miyembro ng pamilya na nakaranas ng pagtatae sa nakaraang dalawang linggo? (ipalarawan kung kailangan)";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  DI2();
}

function DI2(){
  var questionID = "DI2";
  var questionEnglish = "If any family member was to suffer diarrhea (or when any family member did have diarrhea last) what did/ would you do? Anything else?";
  var questionTagalog = "Kung mayroong miyembro ng pamilya ang nakakaranas ng pagtatae, ano ang karaniwan mong ginagawa? May iba pa ba?";
  var answersEnglish = {
    "DI2-nothing":"nothing",
    "DI2-A":"fluid from ors packet",
    "DI2-B":"home-made fluid",
    "DI2-C":"pill or syrup, zinc",
    "DI2-D":"injection",
    "DI2-E":"(iv) intravenous",
    "DI2-F":"home remedies or herbal medicines",
    "DI2-other":"other",
    "DI2-skip":"no response"
  };
  var answersTagalog = {
    "DI2-nothing":"wala",
    "DI2-A":"oral rehydrating solution",
    "DI2-B":false,
    "DI2-C":"tableta, syrup",
    "DI2-D":"injeksyon",
    "DI2-E":"swero",
    "DI2-F":"halamang gamot",
    "DI2-other":"iba pa",
    "DI2-skip":"walang sagot"
  };
  var optionCount = 6;
  var atLeastThree = 0;
  var lessThanThree = 0;
  var nothingCount = 0;
  var skipped = 0;
  var totalCount = 0;
  var notAskedCount = 0;
  var nothing = questionID + "-nothing";
  var skip = questionID + "-skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };    
    // counts for analysis chart
    if (survey[nothing] === "n/a"){
      notAskedCount ++;
    } else if (survey[nothing] === "TRUE"){
      nothingCount ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "at least 3",
      y: atLeastThree,
    },
    {
      key: "less than 3",
      y: lessThanThree + nothingCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var totalCount = atLeastThree + lessThanThree + nothingCount + skipped;
  var atLeastThreePerc = formatPerc(atLeastThree / totalCount); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalCount);
  var nothingPerc = formatPerc(nothingCount / totalCount);
  var lessThreeDontKnowPerc = formatPerc((lessThanThree + nothingCount)/totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " (" + atLeastThree.toString() + ")<br>" +
    "<span class='percText-2'>" +lessThreeDontKnowPerc + "</span> could identify less than three key responses ("+
    lessThanThreePerc + ", " + lessThanThree.toString()  + ") or nothing <span class='text-tagalog'>[wala]</span> " + 
    " (" + nothingPerc + ", " + nothingCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];    
    var thisHtml = thisResponsePerc + " - " + thisResponseEng +
      ((thisResponseTag !== false) ? " <span class='text-tagalog'>[" + thisResponseTag + "]</span>" : "") +
      " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount.toString() + " not asked this question)</p>"); 
  var thisNote = "<small><strong>Note:</strong> Do not read responses. Record all that are mentioned. " + 
    "<span class='text-tagalog'>[Wag basahin ang mga pagpipilian. Itala lahat ng nabanggit.]</span><br>";
  $(infoSelector).append(thisNote);
  DI3();
}


function DI3(){
  var questionID = "DI3";
  var questionEnglish = "If your baby was to suffer, would/did you breastfeed him/her less than usual, about the same amount or more than usual?";
  var questionTagalog = "Kung nakakaranas ng pagtatae ang iyong sanggol, gaano mo siya kadalas pasusohin ng iyong gatas?";
  var answersEnglish = {
    "less":"less",
    "same":"same",
    "more":"more",
    "not":"child not breastfed",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "less":"bihira",
    "same":"gayag ng dato o walang pagbabago",
    "more":"mas madalas",
    "not":"hindi na ngpapasuso",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DI4();
}

function DI4(){
  var questionID = "DI4";
  var questionEnglish = "If any family member was to suffer diarrhea (or when any family member did have diarrhea last), would/did you offer less than usual to <u>drink</u>, about the same amount, or more than usual to <u>drink</u>?";
  var questionTagalog = "Kung nakakaranas ng pagtataeang sinumang miyembro ng pamilya, gaano mo siya kadalas bibigyan ng <u>inumin</u>, gaya ng dati o mas marami sa <u>karaniwan</u>?";
  var answersEnglish = {
    "less":"less",
    "same":"same",
    "more":"more",
    "not":"",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "less":"bihira",
    "same":"gayag ng dato o walang pagbabago",
    "more":"mas madalas",
    "not":"walang iniinom",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DI5();
}

function DI5(){
  var questionID = "DI5";
  var questionEnglish = "If any family member was to suffer diarrhea (or when did any family member have diarrhea last), would/did you offer less than usual to <u>eat</u>, about the same amount, or more than usual to <u>eat</u>?";
  var questionTagalog = "Kung nakakaranas ng patatae ang isang miyembro ng pamilya, gaano mo siya kadalas <u>pakainin</u>, mas konti, kapareho o higit sa karaniwan niyang <u>kinakain</u>?";
  var answersEnglish = {
    "less":"less",
    "same":"same",
    "more":"more",
    "not":"",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "less":"bihira",
    "same":"gayag ng dato o walang pagbabago",
    "more":"mas madalas",
    "not":"walang kinakain",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DI6();
}

function DI6(){
  var questionID = "DI6"
  var questionEnglish = "Would/ did you seek advice or treatment from someone outside of the home for any family member who suffers from diarrhoea?";
  var questionTagalog = "Kung nakakaranas ng pagtatae ang kahit sinong miyembro ng pamilya, ikaw ba ay kukunsulta o kumukonsulta sa iba?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  DI7();     
}

function DI7(){
  var questionID = "DI7";
  var questionEnglish = "Where would/ did you first go for advice or treatment?";
  var questionTagalog = "Saan o kanino ka unang kukunsulta?";
  var answersEnglish = {
    "A":"your home",
    "B":"midwife/tba home",
    "C":"other home",
    "D":"hospital",
    "E":"rural health unit (RHU)",
    "F":"barangay health station (BHS)",
    "G":"barangay health center (BHC)",
    "H":"private hospital",
    "I":"private clinic",
    "J":"traditional practitioner",
    "K":"shop",
    "L":"pharmacy",
    "M":"community distributors",
    "N":"friend/relative",
    "other":"other",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"sa bahay",
    "B":"kumadrona",
    "C":"sa ibang bahay",
    "D":"ospital",
    "E":false,
    "F":false,
    "G":false,
    "H":"pribadong ospital",
    "I":"pribadong klinika",
    "J":"tradisyonal na mga propesyonal",
    "K":"tindahan",
    "L":"parmasya",
    "M":"tagapamahagi sa komunidad",
    "N":"kaibigan o kamag-anak",
    "other":"ibang sagot",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DI8();
}
  
function DI8(){
  var questionID = "DI8";
  var questionEnglish = "Have you heard of ORS?";
  var questionTagalog = "Alam mo ba kung ano ang ORS?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  DI9sachets();  
}

function DI9sachets(){
  var questionID = "DI9_sachets";
  var questionEnglish = "Ask mother to describe PREPARED SACHETS ORS preparation for you. Once mother has provided a description, record whether she described ors preparation correctly or incorrectly.";
  var questionTagalog = "Ipalarawan sa ina kung paano inihahanda ang NAKA-PAKETE ORS. Itala kung tama o hindi ang paglalarawan.";
  orsPrep(questionID, questionEnglish, questionTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> described correctly if the mother mentioned the following... prepared sachets: use 1 liter of clean drinking water; use the entire packet; dissolve the powder fully" +
    "<span class='text-tagalog'> [tamang paglalarawan kung nabanggit/ nagawa ang mga sumusunod... naka-pakete: gumamit ng 1 litrong malinis na inuming tubig; gamitin ang buong pakete; tunawing mabuti ang powder]</span><br>";
  $(infoSelector).append(thisNote);
  DI9homemade();
}
function DI9homemade(){
  var questionID = "DI9_homemade";
  var questionEnglish = "Ask mother to describe HOMEMADE ORS preparation for you. Once mother has provided a description, record whether she described ors preparation correctly or incorrectly.";
  var questionTagalog = "Ipalarawan sa ina kung paano inihahanda ang HOMEMADE ORS. Itala kung tama o hindi ang paglalarawan.";
  orsPrep(questionID, questionEnglish, questionTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> described correctly if the mother mentioned the following... homemade: use 1 liter of clean drinking water; six level teaspoons of sugar; half level teaspoon of salt; stir until salt and sugar mixture is dissolved" +
    "<span class='text-tagalog'> [tamang paglalarawan kung nabanggit/ nagawa ang mga sumusunod... homemade: gumamit ng 1 litrong malinis na tubig; anim na kutsaritang asukall; kalahating kutsaritang asin; haluin hanggang matunaw ang asin at asukal]</span><br>";
  $(infoSelector).append(thisNote);
  DI10();
}

function DI10(){
  var questionID = "DI10";
  var questionEnglish = "When do you use ORS?";
  var questionTagalog = "Kailan ka gumagamit ng ORS?";
  var answersEnglish = {
    "DI10-A":"when child is suffering from diarrhoea",
    "DI10-B":"when child is thirsty",
    "DI10-C":"when child is suffering from fever",
    "DI10-D":"when child is having vomiting",
    "DI10-other":"other",
    "DI10-dk":"don't know",
    "DI10-skip":"no response"
  };
  var answersTagalog = {
    "DI10-A":"kung ang bata ay nakakaranas ng pagtatae",
    "DI10-B":"kung ang bata ay nauuhaw",
    "DI10-C":"kunng ang bata ay nilalagnat",
    "DI10-D":"kung ang bata ay nagsusuka",
    "DI10-other":"ibang sagot",
    "DI10-dk":"hindi alam",
    "DI10-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> multiple answers possible. ask: anything else? do not read responses. record all that are mentioned. "+
    "<span class='text-tagalog'>[maaari ang maraming sagot. tanungin: mayroon ka pa bang nais idagdag? wag basahin ang mga pagpipilian. itala lahat ng nabanggit.]</span><br>";
  $(infoSelector).append(thisNote);
  DI11();
}

function DI11(){
  var questionID = "DI11";
  var questionEnglish = "Once the ORS is ready, for how long you can use that solution?";
  var questionTagalog = "Kung natimpla na ang ORS, gaano katagal ito pwedeng inumin?";
  var answersEnglish = {
    "A":"less than 8 hours ",
    "B":"8 -12 hours",
    "C":"12 – 24 hours",
    "D":"more than 24 hours",
    "other":"other",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"sa loob lamang ng 8 oras",
    "B":"8 -12 oras",
    "C":"12 – 24 oras ",
    "D":"mahigit sa 24 oras",
    "other":"ibang sagot",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DI12();
}

function DI12(){
  var questionID = "DI12";
  var questionEnglish = "At what frequency ORS should be given to a child suffering from diarrhoea?";
  var questionTagalog = "Gaano kadalas ibinibigay ang ORS sa batang nakakaranas ng pagtatae?";
  var answersEnglish = {
    "A":"once a day",
    "B":"twice a day",
    "C":"thrice a day",
    "D":"after every stool/vomit",
    "E":"quite frequently",
    "other":"other",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"isang beses sa isang araw",
    "B":"2 beses sa isang araw",
    "C":"3 beses sa isang araw",
    "D":"sa bawit pagdumi at pagsusuka",
    "E":"mas madalas",
    "other":"ibang sagot",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DI13();
}

function DI13(){
  var questionID = "DI13";
  var questionEnglish = "How will you know that a child suffering from diarrhoea is dehydrated?";
  var questionTagalog = "Paano mo malalaman kung ang batang nakakaranas ng pagtatae ay dehydrated na?";
  var answersEnglish = {
    "DI13-A":"sunken eyes with little or no tears when crying",
    "DI13-B":"dry mouth and tongue",
    "DI13-C":"thirst",
    "DI13-D":"little or no urine",
    "DI13-E":"dry skin or skin with little elasticity",
    "DI13-F":"feeling weak and very tired",
    "DI13-G":"muscle cramps",
    "DI13-other":"other",
    "DI13-dk":"don't know",
    "DI13-skip":"no response"
  };
  var answersTagalog = {
    "DI13-A":"lubog na ang mga mata at kaunting luha ang lumalabas kapag umiiyak",
    "DI13-B":"tuyo ang bibig at dila",
    "DI13-C":"thirst/ uhaw",
    "DI13-D":"kaunti o hindi umiihi",
    "DI13-E":"tuyo ang balat",
    "DI13-F":"nanghihina at pagod",
    "DI13-G":"pamumulikat",
    "DI13-other":"ibang sagot",
    "DI13-dk":"hindi alam",
    "DI13-skip":"walang sagot"
  };
  var optionCount = 7;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  DI14();
}

function DI14(){
  var questionID = "DI14";
  var questionEnglish = "Do you know when to wash hands with soap?";
  var questionTagalog = "Tuwing kelan dapat maghugas ng kamay gamit ang sabon?";
  var answersEnglish = {
    "WS16-never":"never",
    "WS16-A":"after defecating",
    "WS16-B":"after urinating",
    "WS16-C":"before food preparation",
    "WS16-D":"before eating",
    "WS16-E":"before feeding children/baby",
    "WS16-F":"after cleaning baby/changing diapers",
    "WS16-G":"after handling animals",
    "WS16-H":"after caring for an ill person",
    "WS16-I":"no special time, when they are dirty",
    "WS16-dk":"don't know",
    "WS16-other":"other",
    "WS16-skip":"no response"
  };
  var answersTagalog = {
    "WS16-never":"hindi kailanman",
    "WS16-A":"pagkatapos dumumi",
    "WS16-B":"pagkatapos umihi",
    "WS16-C":"bago magluto",
    "WS16-D":"bago kumain",
    "WS16-E":"bago pakainin ang sanggol/anak",
    "WS16-F":"pagkatapos linisan o palitan ng diaper ang sanggol",
    "WS16-G":"pagkatapos humawak ng hayop",
    "WS16-H":"pagkatapos humawak sa may sakit ",
    "WS16-I":"kung madumi lamang ang kamay",
    "WS16-dk":"hindi alam",
    "WS16-other":"ibang sagot",
    "WS16-skip":"walang sagot"
  };
  var optionCount = 9;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  ari();
}










function ari(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-AR_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#ari").show();
      AR1();
      break;
    case false:
      $("#ari").hide();
      malaria();
      break;
  };
}

function AR1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_ari'></span>Topic: Acute Respiratory Infections</h3><hr>");
  var questionID = "AR1";
  var questionEnglish = "What are the signs of pneumonia or ARI – acute respiratory infections – when a person should be taken immediately to a health facility?";
  var questionTagalog = "Ano ang mga senyales ng pneumonia o ARI – acute respiratory infections – at kalian dapat dalhin ang isang tao sa isang pagamutan upang masuri?";
  var answersEnglish = {
    "AR1-A":"fast breathing",
    "AR1-B":"drawing in the chest when taking a breath",
    "AR1-C":"harsh sound when breathing in (stridor)",
    "AR1-D":"lethargic/unconscious",
    "AR1-E":"unable to drink / breastfeed",
    "AR1-F":"vomits everything",
    "AR1-dk":"don't know",
    "AR1-other":"other",
    "AR1-skip":"no response"
  };
  var answersTagalog = {
    "AR1-A":"mabilis ang paghinga",
    "AR1-B":false,
    "AR1-C":"kakaibang tunog kapag humihinga",
    "AR1-D":"walang malay",
    "AR1-E":"hindi makainom at makakain",
    "AR1-F":"pagsusuka",
    "AR1-dk":"hindi alam",
    "AR1-other":"ibang sagot",
    "AR1-skip":"walang sagot"
  };
  var optionCount = 6;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  AR2();
}
 
function AR2(){
  var questionID = "AR2";
  var questionEnglish = "Has any family member had an illness with a cough at any time in the last two weeks?";
  var questionTagalog = "May miymbro ban g pamilya na nagkasakit na may kasamang ubo sa nakalipas na 2 linggo?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  AR3();
}

function AR3(){
  var questionID = "AR3";
  var questionEnglish = "When any family member had an illness with a cough, did he/she have trouble breathing or breathe faster than usual with short, fast breaths?";
  var questionTagalog = "Kung nagkasakit at may kasamang ubo at kahit sino sa pamilya, nagkaroon ba sya ng problema sa paghinga?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  AR4();
}

function AR4(){
  var questionID = "AR4";
  var questionEnglish = "If any family member had a cough with fast breathing what would action would you take?";
  var questionTagalog = "Kung nakakaranas ng ubo si (pangalan) ano ang iyong ginagawa?";
  var answersEnglish = {
    "A":"seek medical assistance",
    "B":"treat with antibiotics",
    "C":"inform a Red Cross volunteer",
    "other":"other",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"komunsulta sa duktor",
    "B":"bigyan ng antibiotic",
    "C":"ipagbigay alam sa Red Cross volunteer",
    "other":"ibang sagot",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  AR5();
}

function AR5(){
  var questionID = "AR5";
  var questionEnglish = "How long after you noticed/ were noticing any family member cough and fast breathing did/ would you seek treatment?";
  var questionTagalog = "Gaano katagal bago mo napansin ang ubo at mabilis na pahinga ng bata at ipinagamot mo ba ito?";
  var answersEnglish = {
    "A":"same day",
    "B":"next day",
    "C":"two days",
    "D":"three or more days",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"parehong araw",
    "B":"kinabukasan",
    "C":"dalawang araw",
    "D":"tatlong araw o higit pa",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  AR6();
}

function AR6(){
  var questionID = "AR6";
  var questionEnglish = "Where did (or if he/she has not been ill, would) you first go for advice or treatment?";
  var questionTagalog = "Saan mo siya unang dinala upang masuri?";
  var answersEnglish = {
    "A":"hospital",
    "B":"rural health unity (RHU)",
    "C":"barangay health station (BHS)",
    "D":"barangay health center (BHS)",
    "E":"private hospital",
    "F":"private clinic",
    "G":"traditional practitioner",
    "H":"shop",
    "I":"pharmacy",
    "J":"community distributors",
    "K":"friend/relative",
    "other":"other",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"ospital",
    "B":false,
    "C":false,
    "D":false,
    "E":"pribadong klinika",
    "F":"private clinic",
    "G":false,
    "H":"tindahan",
    "I":"parmasya",
    "J":false,
    "K":"kaibigan o kamag-anak",
    "other":"iba pa",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  AR7();
}

function AR7(){
  var questionID = "AR7";
  var questionEnglish = "How can you prevent childhood pneumonia (and ARIs – acute respiratory infections)?";
  var questionTagalog = "Paano mo maiiwasan ang pneumonia sa mga bata (at ARIs – acute respiratory infections)?";
  var answersEnglish = {
    "AR7-A":"breastfeeding babies",
    "AR7-B":"immunizing children",
    "AR7-C":"protecting infants from exposure to cold and damp",
    "AR7-D":"avoiding indoor pollution/ smoke",
    "AR7-E":"avoid smoking near children",
    "AR7-F":"avoiding outdoor pollution",
    "AR7-G":"eating nutritious foods",
    "AR7-H":"practicing good hygiene and hand washing",
    "AR7-dk":"don't know",
    "AR7-other":"other",
    "AR7-skip":"no response"
  };
  var answersTagalog = {
    "AR7-A":"pagpapasuso sa mga sanggol",
    "AR7-B":"pagbabakuna sa mga bata",
    "AR7-C":"pagprotekta sa bata mula sa malamig at pagkakabasa",
    "AR7-D":"iwasan ang usok ng sigarilyo",
    "AR7-E":"iwasang manigarilyo malapiy sa mga bata",
    "AR7-F":"iwasan ang polusyon",
    "AR7-G":"kumain ng masustansyang pagkain",
    "AR7-H":"pananatiling malinis at palaging paghuhugas ng kamay",
    "AR7-dk":"hindi alam",
    "AR7-other":"ibang sagot",
    "AR7-skip":"walang sagot"
  };
  var optionCount = 8;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  malaria();
}

 











function malaria(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-ML_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#malaria").show();
      malariaStart();
      break;
    case false:
      $("#malaria").hide();
      dengue();
      break;
  };
}

function malariaStart(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_malaria'></span>Topic: Malaria Prevention and Control</h3><hr>");
  var questionID = "malaria_start";
  var questionEnglish = "Have you ever heard of Malaria?";
  var questionTagalog = "May kaalaman ka ba tungkol sa Malaria?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  ML8();
}

function ML8(){
  var questionID = "ML8";
  var questionEnglish = "What are the signs/ symptoms of Malaria?";
  var questionTagalog = "Ano ang mga sinyales at sintomas na Malaria?";
  var answersEnglish = {
    "ML8-A":"fever",
    "ML8-B":"chills",
    "ML8-C":"sweats",
    "ML8-D":"headaches",
    "ML8-E":"nausea and vomiting",
    "ML8-F":"body aches",
    "ML8-G":"general malaise",
    "ML8-H":"difficulty eating and drinking",
    "ML8-I":"convulsions/fits",
    "ML8-J":"drowsiness and unconsciousness",
    "ML8-dk":"don't know",
    "ML8-other":"other",
    "ML8-skip":"no response"
  };
  var answersTagalog = {
    "ML8-A":"lagnat",
    "ML8-B":"giniginaw/panlalamig",
    "ML8-C":"pagpapawis",
    "ML8-D":"pananakit ng ulo",
    "ML8-E":"naduduwal at pagsusuka",
    "ML8-F":"pananakit ng katawan",
    "ML8-G":"panghihina ng buong katawan",
    "ML8-H":"hirap sa pagkain at paginom",
    "ML8-I":"kumbolsyon",
    "ML8-J":"pagkaantok o walang malay",
    "ML8-dk":"hindi alam",
    "ML8-other":"ibang sagot",
    "ML8-skip":"walang sagot"
  };
  var optionCount = 10;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  dengue();
}













function dengue(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-DN_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#dengue").show();
      DN1();
      break;
    case false:
      $("#dengue").hide();
      mosquitonets();
      break;
  };
}

function DN1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_dengue'></span>Topic: Dengue Prevention and Control</h3><hr>");
  var questionID = "DN1";
  var questionEnglish = "Have you ever heard of Dengue Fever?";
  var questionTagalog = "May kaalaman ka ba tungkol sa Dengue?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  DN2();  
}

function DN2(){
  var questionID = "DN2";
  var questionEnglish = "How does a person get Dengue Fever?";
  var questionTagalog = "Paano ngkakaroon ng Dengue Fever ang isang tao?";
  var answersEnglish = {
    "A":"mosquito bites",
    "B":"rat bites",
    "dk":"don't know",
    "other":"other",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"kagat ng lamok",
    "B":"kagat ng daga",
    "dk":"hindi alam",
    "other":"ibang sagot",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DN4();
}

function DN4(){
  var questionID = "DN4";
  var questionEnglish = "Do you know the time of the day which dengue mosquitoes bite?";
  var questionTagalog = "Tuwing kalian nangangagat ang lamok?";
  var answersEnglish = {
    "A":"dawn / dusk",
    "B":"morning",
    "C":"daytime",
    "D":"night time",
    "E":"any time",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"bukang liwayway / dapit-hapon",
    "B":"umaga",
    "C":"araw",
    "D":false,
    "E":"kahit anong oras",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  DN5();
}

function DN5(){
  var questionID = "DN5";
  var questionEnglish = "What are the signs/ symptoms of Dengue?";
  var questionTagalog = "Ano ang mga sinyales at simtomas ng Dengue?";
  var answersEnglish = {
    "DN5-A":"fever",
    "DN5-B":"chills",
    "DN5-C":"sweats",
    "DN5-D":"headaches",
    "DN5-E":"nausea and vomiting",
    "DN5-F":"muscular pain",
    "DN5-G":"general malaise",
    "DN5-H":"nose bleeds",
    "DN5-I":"vomiting",
    "DN5-J":"skin rash",
    "DN5-dk":"don't know",
    "DN5-other":"other",
    "DN5-skip":"no response"
  };  
  var answersTagalog = {
    "DN5-A":"lagnat",
    "DN5-B":"nilalamig",
    "DN5-C":"pinagpapawisan",
    "DN5-D":"pananakit ng ulo",
    "DN5-E":"naduduwal o pagsusuka",
    "DN5-F":"masakit ang mga kalamnan",
    "DN5-G":"panghihina ng buong katawan",
    "DN5-H":"npagdurugo ng ilong",
    "DN5-I":"pagsusuka",
    "DN5-J":"mga pantal sa balat",
    "DN5-dk":"hindi alam",
    "DN5-other":"ibang sagot",
    "DN5-skip":"walang sagot"
  };
  var optionCount = 10;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  DN6();
}

function DN6(){
  var questionID = "DN6";
  var questionEnglish = "What can you do to prevent Dengue Fever?";
  var questionTagalog = "Ano ang maaari mong gawin para makaiwas sa Dengue Fever?";
  var answersEnglish = {
    "DN6-A":"cover skin with clothes",
    "DN6-B":"cover water jars or rainwater collection",
    "DN6-C":"clean up areas in the community that may collect standing water",
    "DN6-D":"change standing water in, and clean household objects at least once a week (e.g. fridge, vases)",
    "DN6-E":"use mosquito repellents (spray, lotion) on body",
    "DN6-F":"spray internal walls with mosquito repellent",
    "DN6-G":"put up screens on doors and windows",
    "DN6-H":"use larvicide (e.g. abate) or fish to treat water",
    "DN6-I":"use bed nets/ insecticide treated bed nets especially for children and adults",
    "DN6-dk":"don't know",
    "DN6-other":"other",
    "DN6-skip":"no response"
  };
  var answersTagalog = {
    "DN6-A":"magsuot ng akmang damit",
    "DN6-B":"lagyan ng takip ang mga plorera at mga alulod",
    "DN6-C":"paglilinis ng mga lugar sa barangay na maaaring pagbahayan ng maduming tubig",
    "DN6-D":"palitan ang naka-imbak na tubig, at linisin ang mga kagamitang pambahay ng hindi bababa sa isang beses sa isang linggo (e.g. pridyeder, plorera)",
    "DN6-E":"gumamit ng mosquito repellents (spray, lotion) sa katawan",
    "DN6-F":"magspray ng mosquito repellent sa mga dinding sa loob ng bahay",
    "DN6-G":"maglagay ng mga screen sa pinto at bintana",
    "DN6-H":"gumamit ng larvicide (e.g. abate) o isda para malinisan ang tubig",
    "DN6-I":"gumamit ng kulambo (insecticide treated)",
    "DN6-dk":"hindi alam",
    "DN6-other":"ibang sagot",
    "DN6-skip":"walang sagot"
  };
  var optionCount = 9;
  analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount);
  DN7();
}

function DN7(){
  var questionID = "DN7";
  var questionEnglish = "Is Dengue Fever treatable?";
  var questionTagalog = "Nalulunasan/nagagamot ba ang Dengue?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  DN8();
}

    // "IM2B-A":"",
    // "IM2B-B":"",
    // "IM2B-C":"",
    // "IM2B-D":"",
    // "IM2B-E":"",
    // "IM2B-F":"",
    // "IM2B-G":"",
    // "IM2B-H":"",
    // "IM2B-I":"",
    // "IM2B-J":"",
    // "IM2B-K":"",
    // "IM2B-L":"",
    // "IM2B-M":"",
    // "IM2B-N":"",
    // "IM2B-O":"",
    // "IM2B-none":"",
    // "IM2B-other":"other",
    // "IM2B-dk":"don't know",
    // "IM2B-skip":"no response"


function DN8(){
  var questionID = "DN8";
  var questionEnglish = "If you think that you have Dengue Fever, what do you do?";
  var questionTagalog = "Kung sa tingin mo na ikaw ay may Dengue Fever, ano ang maaari mong gawin?";
  var answersEnglish = {
    "DN8-A":"treat myself at home",
    "DN8-B":"take traditional medicine",
    "DN8-C":"see a doctor",
    "DN8-D":"drink lots of water",
    "DN8-other":"other",
    "DN8-dk":"don't know",
    "DN8-skip":"no response"
  };
  var answersTagalog = {
    "DN8-A":"gamutin ang sarili sa bahay",
    "DN8-B":"uminom ng mga tradisyonal na gamot",
    "DN8-C":"komunsulta sa duktor",
    "DN8-D":"uminom ng madaming tubig",
    "DN8-other":"ibang sagot",
    "DN8-dk":"hindi alam",
    "DN8-skip":"walang sagot"
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> multiple answers possible. ask: anything else? do not read responses. record all that are mentioned. "+
    "<span class='text-tagalog'>[maaari ang maraming sagot. tanungin: mayroon ka pa bang nais idagdag? wag basahin ang mga pagpipilian. itala lahat ng nabanggit.]</span><br>";
  $(infoSelector).append(thisNote);
  mosquitonets();
}









function mosquitonets(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-MN_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#mosquitonets").show();
      MN1();
      break;
    case false:
      $("#mosquitonets").hide();
      hiv();
      break;
  };
}

function MN1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_mosquitonets'></span>Topic: Mosquito Net Use</h3><hr>");
  var questionID = "MN1";
  var questionEnglish = "Does your household have any mosquito nets that can be used while sleeping?";
  var questionTagalog = "Gumagamit ba kayo ng kulambo sa inyong pagtulog?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  MN3();
}

function MN3(){
  var questionID = "MN3";
  var questionEnglish = "When you got the (most recent) net, was it already treated with an insecticide to kill or repel mosquitoes?";
  var questionTagalog = "Nang makuha mo ang kasalukuyang kulambo, ito ba ay may pamatay peste?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  hiv();
}
 









function hiv(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-HA_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#hiv").show();
      HA1();
      break;
    case false:
      $("#hiv").hide();
      tb();
      break;
  };
}

function HA1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_hiv'></span>Topic: HIV and Sexually Transmitted Infections (STI)</h3><hr>");
  var questionID = "HA1";
  var questionEnglish = "Have you ever heard of an illness called AIDS or an infection called HIV?";
  var questionTagalog = "Narinig mo na ba ang tungkol sa sakit na AIDS o ang impeksyon na HIV?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  tb();
}











function tb(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-TB_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#tb").show();
      TB1();
      break;
    case false:
      $("#tb").hide();
      blooddonation();
      break;
  };
}

function TB1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_tb'></span>Topic: Tuberculosis (TB)</h3><hr>");
  var questionID = "TB1";
  var questionEnglish = "Have you heard about the disease called Tuberculosis or TB?";
  var questionTagalog = "Narinig mo na ba ang sakit na Tuberculosis o TB?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);   
  TB3();
}

function TB3(){
  var questionID = "TB3";
  var questionEnglish = "Is TB contagious (can spread easily from one person to another)?";
  var questionTagalog = "Ang TB ba ay madaling makahawa?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  blooddonation();
}










function blooddonation(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-BD_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#blooddonation").show();
      BD1();
      break;
    case false:
      $("#blooddonation").hide();
      roadsafety();
      break;
  };
}

function BD1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_blooddonation'></span>Topic: Blood Donation</h3><hr>");
  var questionID = "BD1";
  var questionEnglish = "Have you donated blood in the last 12 months?";
  var questionTagalog = "Nag-donate ka ba ng dugo sa nakalipas na 12 buwan?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  BD2(); 
}

function BD2(){
  var questionID = "BD2";
  var questionEnglish = "Have any of your family member donated blood in the last 12 months?";
  var questionTagalog = "Mayroon bang miyembro ng pamilya na nag-donate ng dugo ng nakaraang 12 buwan?";
  analysisYesNo(questionID, questionEnglish, questionTagalog); 
  roadsafety();  
}








function roadsafety(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-RS_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#roadsafety").show();
      RS1();
      break;
    case false:
      $("#roadsafety").hide();
      substanceuse();
      break;
  };
}

function RS1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_roadsafety'></span>Topic: Road Safety</h3><hr>");
  var questionID = "RS1";
  var questionEnglish = "Do you currently own a motorcycle or has one been provided for you to use?";
  var questionTagalog = "Sa kasalukuyan, ikaw ba ay nagmamay-ari ng isang motosiklo?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  RS2();   
}
 
function RS2(){
  var questionID = "RS2";
  var questionEnglish = "How frequently do you wear a helmet when you are on a motorcycle?";
  var questionTagalog = "Gaano ka kadalas nagsusuot ng helmet  kapag ikaw ay nakasakay ng motorsiklo?";
  var answersEnglish = {
    "A":"always", 
    "B":"usually",
    "C":"sometimes",
    "D":"never", 
    "E":"i never rode on a motorcycle", 
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"lagi",
    "B":"kadalasan",
    "C":"minsan",
    "D":"hindi kailanman",
    "E":"hindi pa ako nakasakay ng motorsiklo",
    "skip":"walang sagot"
  };
  analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  RS3();
}

function RS3(){
  var questionID = "RS3";
  var questionEnglish = "The last time you rode a motorcycle did you wear a helmet?  ";
  var questionTagalog = "Noong huling sumakay ka ng motorsiklo, ikaw ba ay gumamit ng helmet?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog)
  RS4();
}

function RS4(){
  var questionID = "RS4";
  var questionEnglish = "The last time you rode a motorcycle did you fasten the chin strap on the helmet?";
  var questionTagalog = "Noong huli kang sumakay ng motorsiklo ikinabit mo ba ang chin strap sa helmet?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog)
  RS5();
}

function RS5(){
  var questionID = "RS5";
  var questionEnglish = "What actions make road users (walking, driving, riding) safer?";
  var questionTagalog = "Anaong aksyon ang maaring gawin ng mga gumgamit ng daan upang masigurado ang kanilang kaligtasan? (paglalakad, pagmamaneho, pagsakay sa sasakyan)?";
  var answersEnglish = {
    "RS5-A":"use a seatbelt or helmets in the case of motorcyclist",
    "RS5-B":"keep a safe distance from other vehicles",
    "RS5-C":"keep to the speed limit and adapt driving speeds to weather conditions, the state of roads and amount of traffic",
    "RS5-D":"obey traffic lights and highway codes",
    "RS5-E":"never drive after drinking alcohol or using drugs",
    "RS5-F":"never use mobile phone while driving",
    "RS5-G":"drive carefully and pay special attention to pedestrians, cyclists and to all vulnerable road users",
    "RS5-H":"discourage children from playing on busy roads and show them",
    "RS5-I":"use a light when walking on the road at night",
    "RS5-J":"know where to go for help when a road crash occurs and keep a list of emergency numbers",
    "RS5-dk":"don’t know",
    "RS5-other":"other",
    "RS5-skip":"no response"
  };
  var answersTagalog = {
    "RS5-A":"gumamit ng seatbelt o helmet sa mga gumagamit ng motorsiklo",
    "RS5-B":"panatilihing ligtas ang iyong pagitan sa ibang sasakyan",
    "RS5-C":"panatilihin ang wastong bilis at i-ayon sa lagay ng panahon, kondisyon ng mga daanan at daloy ng trapiko",
    "RS5-D":"sumunod sa mga traffic lights at highway codes",
    "RS5-E":"huwag magmaneho kung nakainom ng alak o ng droga/gamot",
    "RS5-F":"huwag gumamit ng telepono habang nagmamaneho",
    "RS5-G":"maingat na magmaneho at bigyang atensyon ang mga tamang tawiran, siklista at mananawid",
    "RS5-H":"pahintulutan ang mga bata na maglaro sa mga kalsada",
    "RS5-I":"gumamit ng ilaw kung maglalakad sa kalsada ng gabi/madilim",
    "RS5-J":"alamin kung saan pupunnta para humingi ng tulong kung nagkaroon ng aksidente sa kalsada",
    "RS5-dk":"hindi alam",
    "RS5-other":"ibang sagot",
    "RS5-skip":"walang sagot"  
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  substanceuse();
}











function substanceuse(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-ES_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#substanceuse").show();
      ES1();
      break;
    case false:
      $("#substanceuse").hide();
      noncommunicablediseases();
      break;
  };
}

function ES1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_substanceuse'></span>Topic: Excessive Substance Use</h3><hr>");
  
  noncommunicablediseases();
}









function noncommunicablediseases(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-NC_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#noncommunicablediseases").show();
      NC1();
      break;
    case false:
      $("#noncommunicablediseases").hide();
      violenceprevention();
      break;
  };
}

function NC1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_noncommunicablediseases'></span>Topic: Noncommunicable Diseases</h3><hr>");
  var questionID = "NC1";
  var questionEnglish = "Have you ever consumed an alcoholic drink such as wine, beer, spirit?";
  var questionTagalog = "Nakainom ka na ba ng mga inumin na may alcohol tulad ng wine, beer, spirit?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);  
  NC2();
}
function NC2(){
  var questionID = "NC2";
  var questionEnglish = "Have you consumed an alcoholic drink within the past 12 months?";
  var questionTagalog = "Nakainom ka na ba ng inumin na may alcohol sa nakalipas na 12 buwan?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NC3();  
}
function NC3(){
  var questionID = "NC3";
  var questionEnglish = "Have you consumed an alcoholic drink within the past 30 days?";
  var questionTagalog = "Nakainom ka ba ng inuming may alcohol sa nakalipas na 30 araw?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NC4();  
}
function NC4(){
  var questionID = "NC4";
  var questionEnglish = "During each of the past 7 days, on how many occasions did you have at least one alcoholic drink?";
  var questionTagalog = "Sa bawat nakalipas na 7 araw, ilang beses ka nagkaroon ng pagkakataon na uminom ng alcohol?";
  analysisHowManyTimes(questionID, questionEnglish, questionTagalog);
  NC5();
}
function NC5(){
  var questionID = "NC5";
  var questionEnglish = "During the past 7 days, how many times did you have [for men: five or more / for women: four or more] standard alcoholic drinks in a single drinking occasion?";
  var questionTagalog = "Sa nakalipas na 7 araw, ilang beses ka uminom/ gaano [Sa lalaki: lima o higit pa / Sa babae: apat o higit pa] kadami ang iyong nainom kada araw?";
  analysisHowManyTimes(questionID, questionEnglish, questionTagalog);
  NC6();
}
function NC6(){
  var questionID = "NC6";
  var questionEnglish = "Does your work involve moderate-intensity activity that causes large increase in breathing or heart rate like carrying or lifting heavy loads, digging, harvesting for at least 10 minutes continuously?";
  var questionTagalog = "Ang iyong trabaho ba ay nangangailangan ng katamtamang lakas na mga gawain na nagdudulot ng pagbilis ng paghinga at pagbilis ng pintig ng puso kagaya ng pagdadala at pagbubuhat ng mabibigat na bagay, paghuhukay at pag-ani ng tuloy-tuloy sa loob ng kahit na 10 minuto?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NC7();  
}
function NC7(){
  var questionID = "NC7";
  var questionEnglish = "In a typical week, on how many days do you do moderate-intensity activities as part of your work? ";
  var questionTagalog = "Sa tipikal na linggo, ilang araw ka gumagawa ng mga katamtamang lakas na mga gawain bilang parte ng iyong trabaho?";
  analysisHowManyTimes(questionID, questionEnglish, questionTagalog);
  NC9();
}
function NC9(){
  var questionID = "NC9";
  var questionEnglish = "Do you do any moderate-intensity sports, fitness or recreational activities (adult) that cause large increases in breathing or heart rate like running or football for at least 10 minutes continuously?";
  var questionTagalog = "May ginagawa ka bang katamtamang lakas na mga laro, gawaing pampalakas ng katawan, panlibangan (may sapat na gulang) na nagdudulot ng pagbilis ng paghinga at pintig ng puso kagaya ng pagtakbo o paglalaro ng football na tuloy-tuloy sa loob ng kahit na 10 minuto?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NC10(); 
}
function NC10(){
  var questionID = "NC10";
  var questionEnglish = "In a typical week, on how many days do you do moderate-intensity sports, fitness or recreational activities?";
  var questionTagalog = "Sa tipikal na linggo, ilang araw ka gumagawa ng mga katamtamang lakas na mga laro, gawaing pampalakas ng katawan o panlibangan?";
  analysisHowManyTimes(questionID, questionEnglish, questionTagalog);
  NC12();  
}
function NC12(){
  var questionID = "NC12";
  var questionEnglish = "Do you currently smoke any tobacco products such as cigarettes, cigars or pipes?";
  var questionTagalog = "Sa kasalukuyan, ikaw ba ay naninigarilyo ng mga produkto ng tabako katulad ng cigarettes, cigars o pipes?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NC13(); 
}
function NC13(){
  var questionID = "NC13";
  var questionEnglish = "Do you currently smoke tobacco products daily?";
  var questionTagalog = "Sa kasalukuyan, ikaw ba ay naninigarilyo ng tabako araw-araw?";
  analysisYesNo(questionID, questionEnglish, questionTagalog); 
  NC15(); 
}
function NC15(){
  var questionID = "NC15";
  var questionEnglish = "Have you ever had your blood pressure measured by a doctor or other health worker?";
  var questionTagalog = "Nagkaroon ba ng pagkakataon na ipasuri mo sa duktor/nars ang iyong blood pressure?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);  
  NC16();
}
function NC16(){
  var questionID = "NC16";
  var questionEnglish = "Have you ever been told by a doctor or other health worker that you have raised blood pressure or hypertension?";
  var questionTagalog = "May pagkakataon bang na sinabihan ka ng duktor/nars na mataas ang iyong blood pressure?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);
  NC17();  
}
function NC17(){
  var questionID = "NC17";
  var questionEnglish = "Have you been told in the past 12 months?";
  var questionTagalog = "Sinabihan ka ba sa nakalipas na 12 buwan?";
  analysisYesNo(questionID, questionEnglish, questionTagalog);  
  NC18();
}
function NC18(){
  var questionID = "NC18";
  var questionEnglish = "In a typical week, on how many days do you eat fruit?";
  var questionTagalog = "Sa karaniwang linggo, ilang beses ka kumakain ng prutas?";
  analysisHowManyTimesPerWeek(questionID, questionEnglish, questionTagalog);  
  NC19();
}
function NC19(){
  var questionID = "NC19";
  var questionEnglish = "How many servings of fruit do you eat on one of those days?";
  var questionTagalog = "Gaano kadami ang kinakain mong prutas sa mga araw na nabanggit?";
  analysisHowManyTimes(questionID, questionEnglish, questionTagalog);  
  NC20();
}
function NC20(){
  var questionID = "NC20";
  var questionEnglish = "In a typical week, on how many days do you eat vegetables?";
  var questionTagalog = "Sa karaniwang lingo, gaano ka kadalas kumain ng gulay?";
  analysisHowManyTimesPerWeek(questionID, questionEnglish, questionTagalog);  
  NC21();
}
function NC21(){
  var questionID = "NC21";
  var questionEnglish = "How many servings of vegetables do you eat on one of those days?";
  var questionTagalog = "Gaano kadami ang kinain mong gulay sa mga nabanggit na araw?";
  analysisHowManyTimes(questionID, questionEnglish, questionTagalog);  
  violenceprevention();
}








function violenceprevention(){
  var section = false;
  $.each(filteredData, function(index, survey){
    if(survey["cbhfa-VP_section"] == "continue"){
      section = true;
    }
  });
  switch(section){
    case true:
      $("#violenceprevention").show();
      VP1();
      break;
    case false:
      $("#violenceprevention").hide();
      RC1();
      break;
  };
}

function VP1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_violenceprevention'></span>Topic: Violence Prevention</h3><hr>");
  var questionID = "VP1";
  var questionEnglish = 'To what extent do you agree with the statement: "Violence against women, men, girls and boys is preventable."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Ang karahasan sa mga kababaihan at kalalakihan ay maiiwasan."';
  analysisAgreeDisagree(questionID, questionEnglish, questionTagalog);
  VP2();
}
function VP2(){
  var questionID = "VP2";
  var questionEnglish = 'To what extent do you agree with the statement: "There are certain situations in a family when it is okay to hit someone else."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "May mga pagkakataon na maaaring paluin o saktan ng pisikal ang isang tao sa pamilya."';
  analysisAgreeDisagree(questionID, questionEnglish, questionTagalog);
  VP3();
}
function VP3(){
  var questionID = "VP3";
  var questionEnglish = 'To what extent do you agree with the statement: "A woman always has the right to refuse sexual contact."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Ang isang babae ay may karapatang tumanggi sa pakikipagtalik."';
  analysisAgreeDisagree(questionID, questionEnglish, questionTagalog);
  VP4();
}
function VP4(){
  var questionID = "VP4";
  var questionEnglish = 'To what extent do you agree with the statement: "Constantly insulting another person is a form of violence."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Ang madalas na pag-iinsulto sa isang tao ay uri ng karahasan."';
  analysisAgreeDisagree(questionID, questionEnglish, questionTagalog);
  VP5();
}
function VP5(){
  var questionID = "VP5";
  var questionEnglish = 'To what extent do you agree with the statement: "People who see or hear violence occurring have an important role to stop the violence when it is safe to do so."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Sinuman ang nakakakita o nakakarinig ng kahit anong uri ng karahasan ay may importanteng ganap upang maitigil o maihinto sa ligtas na sitwasyon."';
  analysisAgreeDisagree(questionID, questionEnglish, questionTagalog);
  VP6();
}
function VP6(){
  var questionID = "VP6";
  var questionEnglish = "In your opinion, what are the safest ways to discipline children?";
  var questionTagalog = "Sa iyong opinion, ano ang mga ligtas na paraan upang disiplinahin ang mga bata?";
  var answersEnglish = {
    "VP6-A":"separate yourself from the child",
    "VP6-B":"reason with the child",
    "VP6-C":"take away the child’s privileges for a limited time",
    "VP6-D":"model the behaviour you want your child to follow",
    "VP6-other":"other",
    "VP6-dk":"don’t know",
    "VP6-skip":"no response"
  };
  var answersTagalog = {
    "VP6-A":"ihiwalay ang sarili sa bata o mga bata",
    "VP6-B":"pagsabihan ang bata",
    "VP6-C":"pansamantalang isantabi ang mga pribilehiyo ng bata o mga bata",
    "VP6-D":false,
    "VP6-other":"ibang sagot",
    "VP6-dk":"hindi alam",
    "VP6-skip":"walang sagot"  
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> do not prompt respondents. let them know they can provide more than one answer. record all that are mentioned." +
    " <span class='text-tagalog'>[huwag banggitin ang mga kasagutan. maaaring magbigay ng higit sa isang kasagutan. itala lahat ng nabanggit.]</span>";
  $(infoSelector).append(thisNote);
  VP7();
}
function VP7(){
  var questionID = "VP7";
  var questionEnglish = "What are some of the human impacts of violence?";
  var questionTagalog = "Ano ang epekto o mga epekto ng karahasan sa mga tao?";
  var answersEnglish = {
    "VP7-A":"physical injuries",
    "VP7-B":"emotional injuries",
    "VP7-C":"diseases or illness",
    "VP7-D":"loss of trust",
    "VP7-other":"other",
    "VP7-dk":"don’t know",
    "VP7-skip":"no response"
  };
  var answersTagalog = {
    "VP7-A":"sugat",
    "VP7-B":"sakit sa damdamin",
    "VP7-C":"sakit",
    "VP7-D":"pagkawala ng tiwala",
    "VP7-other":"ibang sagot",
    "VP7-dk":"hindi alam",
    "VP7-skip":"walang sagot"  
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> do not prompt respondents. let them know they can provide more than one answer. record all that are mentioned." +
    " <span class='text-tagalog'>[huwag banggitin ang mga kasagutan. maaaring magbigay ng higit sa isang kasagutan. itala lahat ng nabanggit.]</span>";
  $(infoSelector).append(thisNote);
  VP8();
}
function VP8(){
  var questionID = "VP8";
  var questionEnglish = "If you saw or heard someone being sexually violent against another person, what immediate action could you take?";
  var questionTagalog = "Kung ikaw ay nakakita o nakarinig ng isang taong sekswal na nangangahas ng ibang tao, ano ang panandaliang aksyon na dapat mong gawin?";
  var answersEnglish = {
    "VP8-A":"get the person being hurt to safety",
    "VP8-B":"get help immediately",
    "VP8-C":"speak up to bring attention to the violence",
    "VP8-D":"make it clear to the inflictor that violence is unacceptable and must stop immediately",
    "VP8-E":"talk to someone else in the home or community who can help",
    "VP8-other":"other",
    "VP8-dk":"don’t know",
    "VP8-skip":"no response"
  };
  var answersTagalog = {
    "VP8-A":"iligtas ang biktima/taong sinasaktan",
    "VP8-B":"agarang tumawag ng tulong",
    "VP8-C":"magsalita upang mabigyan ng tuon ang karahasan",
    "VP8-D":"ipaalam na ang pangangahas ay hindi katanggap-tanggap at nararapat na agarang ihinto",
    "VP8-E":"lumapit sa isang tao sa tahanan o komunidad na maaaring makatulong",
    "VP8-other":"ibang sagot",
    "VP8-dk":"hindi alam",
    "VP8-skip":"walang sagot"  
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> do not prompt respondents. let them know they can provide more than one answer. record all that are mentioned." +
    " <span class='text-tagalog'>[huwag banggitin ang mga kasagutan. maaaring magbigay ng higit sa isang kasagutan. itala lahat ng nabanggit.]</span>";
  $(infoSelector).append(thisNote);
  VP9();
} 
function VP9(){
  var questionID = "VP9";
  var questionEnglish = "What practical action can you take to prevent violence in disaster?";
  var questionTagalog = "Ano ang maaari mong gawin upang maiwasan ang karahasan sa panahon ng kalamidad?";
  var answersEnglish = {
    "VP9-A":"do not act out violently from anger or fear",
    "VP9-B":"manage your stress levels (by staying busy, meditating, helping others, taking time for yourself)",
    "VP9-C":"do not rely on harmful coping strategies like alcohol or drugs",
    "VP9-D":"make a plan so you and your family know how and where to go to be safe, plan how your family can communicate and re-connect after disaster",
    "VP9-E":"work with your community to build prevention into disaster planning",
    "VP9-other":"other",
    "VP9-dk":"don’t know",
    "VP9-skip":"no response"
  };
  var answersTagalog = {
    "VP9-A":"manatiling kalmado sa anumang sitwasyon",
    "VP9-B":"panatilihing abala ang sarili",
    "VP9-C":"iwasan ang pag-inom ng alak o paggamit ng ipinagbabawal na gamot",
    "VP9-D":"gumawa ng plano kung paano mapapanatiling ligtas ang pamilya sa panahon ng kalamidad",
    "VP9-E":"makipag-ugnayan sa komunidad ukol sa pag-iwas sa kalamidad",
    "VP9-other":"ibang sagot",
    "VP9-dk":"hindi alam",
    "VP9-skip":"walang sagot"  
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> do not prompt respondents. let them know they can provide more than one answer. record all that are mentioned." +
    " <span class='text-tagalog'>[huwag banggitin ang mga kasagutan. maaaring magbigay ng higit sa isang kasagutan. itala lahat ng nabanggit.]</span>";
  $(infoSelector).append(thisNote);
  VP10();
}
function VP10(){
  var questionID = "VP10";
  var questionEnglish = "If a person tells you they are being hurt by violence what can you do to help the person?";
  var questionTagalog = "Kung ang isang taong biktima ng karahasan ay lumapit sayo upang humingi ng tulong, ano ang maaari mong gawin upang siya ay matulungan?";
  var answersEnglish = {
    "VP10-A":"listen to the person and show empathy",
    "VP10-B":"comfort the person",
    "VP10-C":"take the person to a safe place",
    "VP10-D":"know the community resources and support system",
    "VP10-E":"if it involves a child, report the violence to a helping source in the community",
    "VP10-other":"other",
    "VP10-dk":"don’t know",
    "VP10-skip":"no response"
  };
  var answersTagalog = {
    "VP10-A":"makinig at magpakita ng pakikiramay",
    "VP10-B":"damayan ang isang tao",
    "VP10-C":"dalhin ang tao sa isang ligtas na lugar",
    "VP10-D":"alamin ang mga grupo o organisasyon sa komunidad na maaaring lapitan o makatulong",
    "VP10-E":"kung ang biktima ng karahasan ay bata, dumulog sa isang tanggapang makakatulong",
    "VP10-other":"ibang sagot",
    "VP10-dk":"hindi alam",
    "VP10-skip":"walang sagot"  
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  var infoSelector = "#" + questionID + "_info";
  var thisNote = "<small><strong>Note:</strong> do not prompt respondents. let them know they can provide more than one answer. record all that are mentioned." +
    " <span class='text-tagalog'>[huwag banggitin ang mga kasagutan. maaaring magbigay ng higit sa isang kasagutan. itala lahat ng nabanggit.]</span>";
  $(infoSelector).append(thisNote);
  RC1();
}

 





function RC1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='section_redcross'></span>Topic: Red Cross Exposure</h3><hr>");
  var questionID = "RC1";
  var questionEnglish = "Are you aware about Philippine Red Cross?";
  var questionTagalog = "May kaalaman ka ba tungkol sa Philippine Red Cross?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  RC2();
}
 
function RC2(){
  var questionID = "RC2";
  var questionEnglish = "In the last 1 year, has your household received a visit from a PRC volunteer?";
  var questionTagalog = "Sa nakaraang taon, ang iyong sambahayan ay binisita ng isang PRC volunteer?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  RC4();
}


function RC4(){
  var questionID = "RC4";
  var questionEnglish = "Did the PRC volunteer discuss with you or someone in your household any of the following subjects:";
  var questionTagalog = "Tinalakay ba ng Red Cross volunteer ang mga sumusunod na paksa sa iyo at ng iyong pamilya:";
  var answersEnglish = {
    "RC4-A":"prevention of malaria",
    "RC4-B":"vaccination for children",
    "RC4-C":"antenatal care",
    "RC4-D":"hand wash",
    "RC4-E":"prevention of tuberculosis",
    "RC4-other":"other",
    "RC4-dk":"don’t know",
    "RC4-skip":"no response"
  };
  var answersTagalog = {
    "RC4-A":"pag-iwas sa malaria",
    "RC4-B":"bakuna sa mga bata",
    "RC4-C":"pangangalaga sa pagbubuntis",
    "RC4-D":"paghuhugas ng kamay",
    "RC4-E":"pag-iwas tuberculosis",
    "RC4-other":"iba pa",
    "RC4-dk":"hindi alam",
    "RC4-skip":"walang sagot"  
  };
  analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog);
  RC5();
}


function RC5(){
  var questionID = "RC5";
  var questionEnglish = "Did you talk about what was discussed by the volunteer with any other family members or friends?";
  var questionTagalog = "Ibinahagai mo ba ang mga tinalakay ng volunteer sa mga miyembro ng iyong pamilya o mga kaibigan?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
  RC6();
};

function RC6(){
  var questionID = "RC6";
  var questionEnglish = "Did you participate in any activity conducted by PRC? ";
  var questionTagalog = "Ikaw ba ay nakilahok sa talakayang ginawa ng Red Cross/Red Crescent?";
  analysisYesNoDk(questionID, questionEnglish, questionTagalog);
 
}



















    // "IM2B-A":"",
    // "IM2B-B":"",
    // "IM2B-C":"",
    // "IM2B-D":"",
    // "IM2B-E":"",
    // "IM2B-F":"",
    // "IM2B-G":"",
    // "IM2B-H":"",
    // "IM2B-I":"",
    // "IM2B-J":"",
    // "IM2B-K":"",
    // "IM2B-L":"",
    // "IM2B-M":"",
    // "IM2B-N":"",
    // "IM2B-O":"",
    // "IM2B-none":"",
    // "IM2B-other":"other",
    // "IM2B-dk":"don't know",
    // "IM2B-skip":"no response"





function analysisYesNo(questionID, questionEnglish, questionTagalog){
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question)";
  }
  thisInfoHtml += "</p>";
  $(infoSelector).append(thisInfoHtml);   
}


function analysisYesNoDk(questionID, questionEnglish, questionTagalog){
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "dk"){
      dontknowCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var nodk = noCount + dontknowCount;
  var totalCount = yesCount + noCount + dontknowCount + skipped;
  var yesPerc = formatPerc(yesCount / totalCount);
  var nodkPerc = formatPerc(nodk / totalCount); 
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var noPerc = formatPerc(noCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + noPerc +
    ", " + noCount + ") or don't know <span class='text-tagalog'>[hindi alam]</span> (" + dkPerc + ", " +
    dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question)";
  }
  thisInfoHtml += "</p>";
  $(infoSelector).append(thisInfoHtml);
}

function analysisYesNoDontEat(questionID, questionEnglish, questionTagalog){
  var yesCount = 0;
  var noCount = 0;
  var dontEatCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "donteat"){
      dontEatCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/don't eat",
      y: noCount + dontEatCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var nodonteat = noCount + dontEatCount;
  var totalCount = yesCount + noCount + dontEatCount + skipped;
  var yesPerc = formatPerc(yesCount / totalCount);
  var nodonteatPerc = formatPerc(nodonteat / totalCount); 
  var donteatPerc = formatPerc(dontEatCount / totalCount);
  var noPerc = formatPerc(noCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodonteatPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + noPerc +
    ", " + noCount + ") or don't eat <span class='text-tagalog'>[hindi kumakain]</span> (" + donteatPerc + ", " +
    dontEatCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question)";
  }
  thisInfoHtml += "</p>";
  $(infoSelector).append(thisInfoHtml);
}

function analysisSelectOneWhatAnswer(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog){
  var topicSkipped = 0;
  var totalCount = 0;
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "n/a"){
      topicSkipped ++;
    } else {
      allResponses[thisAnswer] ++;
      totalCount ++;
    }   
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<p><strong>" + totalCount.toString() + " respondents (single response)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisEnglish = answersEnglish[response]; 
    var thisTagalog = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisEnglish +
      ((thisTagalog !== false) ? " <span class='text-tagalog'>[" + thisTagalog + "]</span>" : "") +
      " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped + " not asked this question)</p>");  
}



function analysisSelectMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog){
  var skip = questionID + "-skip";
  var totalCount = 0;
  var topicSkipped = 0;
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[skip] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      // counts for each of the responses
      for (response in allResponses){
        if (survey[response] === "TRUE"){
          allResponses[response] ++;
        }
      };
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<p><strong>" + totalCount.toString() + " respondents (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng +
      ((thisResponseTag !== false) ? " <span class='text-tagalog'>[" + thisResponseTag + "]</span>" : "") +
      " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped.toString() + " respondents not asked this question)</p>"); 
}

function observeMultipleWhatAnswers(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog){
  var skip = questionID + "-no";
  var totalCount = 0;
  var topicSkipped = 0;
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[skip] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      // counts for each of the responses
      for (response in allResponses){
        if (survey[response] === "TRUE"){
          allResponses[response] ++;
        }
      };
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<p><strong>" + totalCount.toString() + " respondents (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng +
      ((thisResponseTag !== false) ? " <span class='text-tagalog'>[" + thisResponseTag + "]</span>" : "") +
      " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped.toString() + " respondents not asked this question)</p>"); 
}



function analysisHowManyTimes(questionID, questionEnglish, questionTagalog){
  var numberResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        numberResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxTimes = Math.max.apply(Math,numberResponses);
  var minTimes = Math.min.apply(Math,numberResponses);
  var sum = 0;
  for( var i = 0; i < numberResponses.length; i++ ){
      sum += numberResponses[i];
  }
  var avgTimes = d3.round(sum/numberResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<p><strong>" + numberResponses.length.toString() + " respondents providing #</strong><br>" +
    "Average Times: " + avgTimes.toString() + "<br>" +
    "Min: " + minTimes.toString() + " / Max: " + maxTimes.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know <span class='text-tagalog'>[hindi alam]</span>, " + noResponseCount.toString() + " no response <span class='text-tagalog'>[walang sagot]</span>, " + 
    notAskedCount.toString() + " not asked this question)</p>";
  $(infoSelector).append(thisInfoHtml);
}

function analysisHowManyTimesPerWeek(questionID, questionEnglish, questionTagalog){
  var numberResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        numberResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxTimes = Math.max.apply(Math,numberResponses);
  var minTimes = Math.min.apply(Math,numberResponses);
  var sum = 0;
  for( var i = 0; i < numberResponses.length; i++ ){
      sum += numberResponses[i];
  }
  var avgTimes = d3.round(sum/numberResponses.length, 2);
  var thisPieData = [
    {
      key: "days yes",
      y: sum/numberResponses.length,
    },
    {
      key: "days no",
      y: 7-(sum/numberResponses.length),
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<p><strong>" + numberResponses.length.toString() + " respondents providing #</strong><br>" +
    "Average Times: " + avgTimes.toString() + "<br>" +
    "Min: " + minTimes.toString() + " / Max: " + maxTimes.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know <span class='text-tagalog'>[hindi alam]</span>, " + noResponseCount.toString() + " no response <span class='text-tagalog'>[walang sagot]</span>, " + 
    notAskedCount.toString() + " not asked this question)</p>";
  $(infoSelector).append(thisInfoHtml);
}

function analysisMoreThreeLessThree(questionID, questionEnglish, questionTagalog, answersEnglish, answersTagalog, optionCount){
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var skipped = 0;
  var totalCount = 0;
  var notAskedCount = 0;
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };    
    // counts for analysis chart
    if (survey[dk] === "n/a"){
      notAskedCount ++;
    } else if (survey[dk] === "TRUE"){
      dontKnow ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "at least 3",
      y: atLeastThree,
    },
    {
      key: "less than 3",
      y: lessThanThree + dontKnow,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var totalCount = atLeastThree + lessThanThree + dontKnow + skipped;
  var atLeastThreePerc = formatPerc(atLeastThree / totalCount); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalCount);
  var dontKnowPerc = formatPerc(dontKnow / totalCount);
  var lessThreeDontKnowPerc = formatPerc((lessThanThree + dontKnow)/totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " (" + atLeastThree.toString() + ")<br>" +
    "<span class='percText-2'>" +lessThreeDontKnowPerc + "</span> could identify less than three key responses ("+
    lessThanThreePerc + ", " + lessThanThree.toString()  + ") or don't know <span class='text-tagalog'>[walang sagot]</span> " + 
    " (" + dontKnowPerc + ", " + dontKnow.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];    
    var thisHtml = thisResponsePerc + " - " + thisResponseEng +
      ((thisResponseTag !== false) ? " <span class='text-tagalog'>[" + thisResponseTag + "]</span>" : "") +
      " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount.toString() + " not asked this question)</p>"); 
  var thisNote = "<small><strong>Note:</strong> Do not read responses. Record all that are mentioned. " + 
    "<span class='text-tagalog'>[Wag basahin ang mga pagpipilian. Itala lahat ng nabanggit.]</span><br>";
  $(infoSelector).append(thisNote);
}

function analysisAssessYesNo(questionID, questionEnglish, questionTagalog){
  var yesCount = 0;
  var noCount = 0;
  var cannotObserveCount = 0;
  var notAskedCount = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "cannot"){
        cannotObserveCount ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "no",
      y: noCount,
    },
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "cannot",
      y: cannotObserveCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var cannotPerc =formatPerc(cannotObserveCount / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " observations</strong><br>" +
    "<span class='percText-1'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ") <br>" + 
    "<span class='percText-2'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + cannotPerc + "</span> cannot assess <span class='text-tagalog'>[hindi masuri]</span> (" + 
    cannotObserveCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " no observation attempted)";
  $(infoSelector).append(thisInfoHtml);   
}

function analysisAgreeDisagree(questionID, questionEnglish, questionTagalog){
  var totalCount = 0;
  var agreeCount = 0;
  var neitherCount = 0;
  var disagreeCount = 0;
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "agree"){ agreeCount ++; }
      if (survey[questionID] === "neither"){ neitherCount ++; }
      if (survey[questionID] === "disagree"){ disagreeCount ++; }
      if (survey[questionID] === "dk"){ dkCount ++; }
      if (survey[questionID] === "skip"){ noResponseCount ++; }
    }
  });
  // the viz is overlapping svg rectangle in the same category order
  // calculate each width as its own percentage plus those to the left
  var agree = (agreeCount / totalCount) * 100
  var neither = agree + ((neitherCount / totalCount) * 100);
  var disagree = neither + ((disagreeCount / totalCount) * 100);
  var dk = disagree + ((dkCount / totalCount) * 100);
  var noResponse = dk + ((noResponseCount / totalCount) * 100);
  agree = agree.toString() + "%";
  neither = neither.toString() + "%";
  disagree = disagree.toString() + "%";
  dk = dk.toString() + "%";
  noResponse = noResponse.toString() + "%";
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4><br>"+
    '<div id="' + questionID + '_bar" class="question-block">' +
    '<div class="responsesBar">' +
      '<svg width="100%" height="30">' +
        '<rect class="response-bar noResponse" y="0" height="100%" width="'+ noResponse +'" ></rect>' +
        '<rect class="response-bar dk" y="0" height="100%" width="'+ dk +'" ></rect>' +
        '<rect class="response-bar disagree" y="0" height="100%" width="'+ disagree +'" ></rect>' +
        '<rect class="response-bar neither" y="0" height="100%" width="'+ neither +'" ></rect>' +
        '<rect class="response-bar agree" y="0" height="100%" width="'+ agree +'" ></rect>' +
      '</svg></div></div>' +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='text-agree'>" + formatPerc(agreeCount / totalCount) + "</span> agree <span class='text-tagalog'>[sang-ayon]</span> (" +
    agreeCount.toString() + ")<br>" +
    "<span class='text-neither'>" + formatPerc(neitherCount / totalCount) + "</span> neither <span class='text-tagalog'>[wala sa anuman]</span> (" +
    neitherCount.toString() + ")<br>" +
    "<span class='text-disagree'>" + formatPerc(disagreeCount / totalCount) + "</span> disagree <span class='text-tagalog'>[hindi sang-ayon]</span> (" +
    disagreeCount.toString() + ")<br>" +
    "<span class='text-dk'>" + formatPerc(dkCount / totalCount) + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" +
    dkCount.toString() + ")<br>" +
    "<span class='text-noResponse'>" + formatPerc(noResponseCount / totalCount) + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" +
    noResponseCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " respondents not asked this question)</p>";
  $(infoSelector).append(thisInfoHtml);
}

function vaccineCard(questionID, questionEnglish, questionTagalog){
  var dateCount = 0;
  var nodateCount = 0;
  var recallsCount = 0;
  var notAskedCount = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount++;
      if (survey[questionID] === "date"){
        dateCount ++;
      }
      if (survey[questionID] === "nodate"){
        nodateCount ++;
      }
      if (survey[questionID] === "recalls"){
        recallsCount ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "no",
      y: nodateCount,
    },
    {
      key: "date",
      y: dateCount,
    },
    {
      key: "recalls",
      y: recallsCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var datePerc = formatPerc(dateCount / totalCount); 
  var nodatePerc = formatPerc(nodateCount / totalCount);
  var recallsPerc =formatPerc(recallsCount / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +
    "</h4>" +
    "<p><strong>" + totalCount + " observed/asked</strong><br>" +
    "<span class='percText-1'>" + nodatePerc + "</span> card has no date OR no card and not recalls child receiving (" + 
    nodateCount.toString() + ") <br>" + 
    "<span class='percText-2'>" + datePerc + "</span> card has date (" +
    dateCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + recallsPerc + "</span> no card or no date on card but recalls child receiving (" + 
    recallsCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " not observed/asked)";
  $(infoSelector).append(thisInfoHtml);   
}

function observationStartOptions(questionID, questionEnglish, questionTagalog){
  var yesCount = 0;
  var noCount = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes, permission is given <span class='text-tagalog'>[oo, may pahintulot]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no, permission is not given <span class='text-tagalog'>[hindi, walang pahintulot]</span> (" + 
    noCount.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question)";
  }
  thisInfoHtml += "</p>";
  $(infoSelector).append(thisInfoHtml); 
}

function orsPrep(questionID, questionEnglish, questionTagalog){
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "correct"){
      yesCount ++;
    }
    if (survey[questionID] === "incorrect"){
      noCount ++;
    }
    if (survey[questionID] === "dk"){
      dontknowCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    }
  });
  var thisPieData = [
    {
      key: "correct",
      y: yesCount,
    },
    {
      key: "incorrect/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var nodk = noCount + dontknowCount;
  var totalCount = yesCount + noCount + dontknowCount + skipped;
  var yesPerc = formatPerc(yesCount / totalCount);
  var nodkPerc = formatPerc(nodk / totalCount); 
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var noPerc = formatPerc(noCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    ((questionTagalog !== false) ? "<br><small>" + questionTagalog + "</small>" : "") +    
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> described correctly <span class='text-tagalog'>[tamang paglalarawan]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> described incorrectly <span class='text-tagalog'>[maling paglalarawan]</span> (" + noPerc +
    ", " + noCount + ") or don't know <span class='text-tagalog'>[hindi alam]</span> (" + dkPerc + ", " +
    dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question)";
  }
  thisInfoHtml += "</p>";
  $(infoSelector).append(thisInfoHtml);
}





getSurveyData();