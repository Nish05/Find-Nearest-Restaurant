/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global google */

var lat_user;            //Latitude of the user
var long_user;           // Longitude of the user
var lat_wm;              // Latitude of walmart
var long_wm;             // Longitude of walmart
var lat_resto;           // Latitude of restaurant 
var long_resto;          // Longitude of restaurant
var restaurant;          // Dictinary to store latitude & longitude of restaurant
var user;                // Dictinary to store latitude & longitude of user

$(document).ready(function(){
    var userip;
    
    $(".Search_User").click(function(){
        
    $(".restoDict").empty();
    $(".walmartDet").empty();
    $(".Maps").empty();
    
        //Obtains the ip of the user
        $.get( " https://www.l2.io/ip" , function(data,status){
            userip=data;
            
            //Finds the location of the user based on the ip of the user
            $.get("http://freegeoip.net/xml/"+userip , function (data,status) {
            getLangLong(data);
            
            //Finds walmart stores near the user
            $.get("http://api.walmartlabs.com/v1/stores?apiKey=APIKEY"+long_user+"&lat="+lat_user+"&format=xml",
            
                function (data,status) {
                    
                    getWMAdd(data);
                
               });
               
            });
            
        });
            
            
    });

/*
 * Gets the longitude and latitude of the User
 */
function getLangLong(data){
    
    var response = data.getElementsByTagName("Response");
    lat_user=response[0].getElementsByTagName("Latitude")[0].childNodes[0].nodeValue;
    long_user=response[0].getElementsByTagName("Longitude")[0].childNodes[0].nodeValue;
}

/*
 * Gets the name and address of the store. It then calls the zomato api to find 
 * out the restaurants near walmart. It uses the co-ordinates of the restaurant
 * and of the user to show the direction from the restaurant to the original
 * location of the user.
 */
function getWMAdd(data){
    
    //Gets all the stores from the data exracted from the api
    var stores=data.getElementsByTagName("ArrayList");
      $(".walmartDet").empty();
      
    for( var i = 0; i < stores.length; i++) {
        
        //Gets individual restaurants from the arraylist
        var store = data.getElementsByTagName( "item" );
        var string = "";
        for( var j = 0; j < store.length ; j++) {
            
            //Name and street address of the restaurant are extracted for each 
            //walmart. This is then appended to a string and displayed on the 
            //user interface.
            var name = store[j].getElementsByTagName("name")[0].childNodes[0].nodeValue;
            var streetAddress = store[j].getElementsByTagName("streetAddress")[0].childNodes[0].nodeValue;
            string +="<a href = '#' id = 'storename'>"+name+"<br/>"+streetAddress+"</a>";
        }
        //Responsible for displaying the content on the user interface
        $(".walmartDet").append(string);
    }
    
    //On the click of a store this function is called
    $(".walmartDet").on('click','a' ,function(){
        index = $(this).index();
        //It gets the streetaddress, city, state of the store
        var streetAddress = store[index].getElementsByTagName("streetAddress")[0].childNodes[0].nodeValue;
        var a = store[index].getElementsByTagName("city")[0].childNodes[0].nodeValue;
        var b = store[index].getElementsByTagName("stateProvCode")[0].childNodes[0].nodeValue;
        
        //The zomato api is called to find restaurant near walmart
        $.ajax({
            url: "https://developers.zomato.com/api/v2.1/search?entity_type=city&q="+ streetAddress + " " +a + " " + b,
            method: "GET",
            dataType: "json",
            headers: {
                "user-key": "APIKEY"
            },
            success: function(data){
                
                $(".restoDict").empty();
                
                var outputInfo="";
                
                restaurantsNearby = data.restaurants;
                //Gets each restaurant and displays it on the interface
                $.each(restaurantsNearby, function(key, value){
                    
                       restInfo=value.restaurant;
                       outputInfo +="<a href = '#' id = 'restInfo'>"+restInfo.name+"<br/>"+restInfo.location.address+"</a>";
                });
               
                 $(".restoDict").append(outputInfo);
            }
        
            
   
            
        });
        
        // It gets the latitude and longitude of the restaurant to plot
        //it on the google maps
        $(".restoDict").on('click','a' ,function(){
            index = $(this).index();
            lat_resto = restaurantsNearby[index].restaurant.location.latitude;
            long_resto = restaurantsNearby[index].restaurant.location.longitude;
            
            initMap();
        });
    });
}

    });
    
 /**
  * It plots the co-ordinates of the user and the restaurant on the google maps
  * @returns None
  */
function initMap() {
                var restaurant = {lat: Number(lat_resto), lng: Number(long_resto)};
                var user = {lat: Number(lat_user), lng: Number(long_user)};
                
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: restaurant,
                    scrollwheel: false,
                    zoom: 7
                });
                var directionsDisplay = new google.maps.DirectionsRenderer({
                    map: map
                });

                // Set destination, origin and travel mode.
                var request = {
                    destination: user,
                    origin: restaurant,
                    travelMode: 'DRIVING'
                };
                    // Pass the directions request to the directions service.
                var directionsService = new google.maps.DirectionsService();
                directionsService.route(request, function(response, status) {
                    if (status === 'OK') {
                    // Display the route on the map.
                        directionsDisplay.setDirections(response);
                        }
                    });
                }

