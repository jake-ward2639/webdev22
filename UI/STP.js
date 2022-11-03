addEventListener('load', (event) => {

    showTopNav = () => {
        var nav = document.querySelector("#topNav");
        if (nav.className === "topnav") {
            nav.className += " responsive";
        } else {
            nav.className = "topnav";
        }
    }

    changeContent = (page_section) => {
        document.querySelector("#"+document.querySelector(".active").id.replace('_link','')+"_section").style.display = "none";
        document.querySelector(".active").classList.remove("active");
        document.querySelector("#"+page_section+"_section").style.display = "Block";
        document.querySelector("#"+page_section+"_link").classList.add("active");
    }
    
    function getSightingLocation() {
        function success(position) {
            const geolocation  = position.coords.latitude + ' ' + position.coords.longitude;
            submitSighting(geolocation);
        }
        
        function error(errorType) {
          switch(errorType.code) {
            case errorType.PERMISSION_DENIED:
              alert("You must ENABLE your location to submit a sighting")
              break;
            case errorType.POSITION_UNAVAILABLE:
              alert("Your Location is unavailable.")
              break;
            case errorType.TIMEOUT:
              alert("The request to get your location timed out.")
              break;
            case errorType.UNKNOWN_ERROR:
              alert("An unknown error occurred.")
              break;
          }
        }
                
        if (!navigator.geolocation) {
            alert('Geolocation not supported');
        } else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }
    
    submitSighting = (locationOfSighting) => {
        const d = new Date();
        const imageName = d.getTime() + '.' + document.querySelector("#imageToSubmit").files.item(0).name.split('.').pop();

        fetch('https://jw1448.brighton.domains/save_the_pangolin_api', { //fetch post request using form data
            method: 'POST',
            headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
            },    
            body: new URLSearchParams({
                'username': document.querySelector("#username").value,
                'conditionFound': document.querySelector("#conditionFound").value,
                'notes': document.querySelector("#notes").value,
                'locationOfSighting': locationOfSighting,
                'imageName': imageName
            })
        })
        .then((response) => response.json())
        .then((data) => { console.log(data) })
        .catch(console.error);

        /*fetch('https://jw1448.brighton.domains/save_the_pangolin_api?username=testuser1') get request if needed
        .then((response) => response.json())
        .then((data) => console.log(data));*/
    }

    document.querySelector("#submitSighting").addEventListener("click", function(event){
        getSightingLocation();
    });

});