addEventListener('load', (event) => {
    
    let locationOfSighting;

    showTopNav = () => { //open nav
        let nav = document.querySelector("#topNav");
        if (nav.className === "topnav") {
            nav.className += " responsive";
        } else {
            nav.className = "topnav";
        }
    }

    changeContent = (page_section) => { //remove the active class and hide content of previous page while showing and adding active class to new page
        try{
            document.querySelector("#"+document.querySelector(".active").id.replace('_link','')+"_section").style.display = "none";
            document.querySelector(".active").classList.remove("active");
        } catch{
            document.querySelector("#Thanks_section").style.display = "none";
        }
        document.querySelector("#"+page_section+"_section").style.display = "Block";
        try{
            document.querySelector("#"+page_section+"_link").classList.add("active");
        }catch{}
    }

    reportError = (errorMessage) => { //report any kind of error message on screen
        document.querySelector('#report_error').textContent = errorMessage;
    }

    showCFBox = () => { //display the correct condition found element in the form
        if(document.querySelector('#conditionFoundA').value == "default") {
            document.querySelector('#conditionFoundB').style.display = "none";
            document.querySelector('#conditionFoundC').style.display = "none";
        } else if(document.querySelector('#conditionFoundA').value == "alive"){
            document.querySelector('#conditionFoundB').style.display = "inline-block";
            document.querySelector('#conditionFoundC').style.display = "none";
        } else if(document.querySelector('#conditionFoundA').value == "dead"){
            document.querySelector('#conditionFoundB').style.display = "none";
            document.querySelector('#conditionFoundC').style.display = "inline-block";
        }
    }
    
    getLocation = () => {
        success = (position) => {
            let latitude  = position.coords.latitude;
            let longitude  = position.coords.longitude;
            loadMap(latitude, longitude);
            locationOfSighting = latitude + " " + longitude;
        }
        
        error = (errorType) => { //report errors if required
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
    
    loadMap = (latitude, longitude) => {
        let map = L.map('map').setView([latitude, longitude], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        let marker = L.marker([latitude, longitude]).addTo(map);
        marker.dragging.enable();
        marker.bindPopup("<b>Location of Sighting<br><br>"+latitude+" "+longitude).openPopup();
        
        marker.on('dragend', (e) => {
            let newLatLng = marker.getLatLng();
            marker.setPopupContent("<b>Location of Sighting<br><br>"+newLatLng.lat+" "+newLatLng.lng);
            locationOfSighting = newLatLng.lat.toString() + " " + newLatLng.lng.toString();
        });
    }
    
    
    submitSighting = () => { //send information to API
        const d = new Date();
        const imageName = d.getTime() + '.' + document.querySelector("#imageToSubmit").files.item(0).name.split('.').pop();
        let conditionFound = "";
        if(document.querySelector('#conditionFoundA').value == "alive" && document.querySelector("#conditionFoundB").value != 'default'){
            conditionFound = document.querySelector("#conditionFoundA").value + ': ' + document.querySelector("#conditionFoundB").value;
        } else if(document.querySelector('#conditionFoundA').value == "dead" && document.querySelector("#conditionFoundC").value != 'default'){
            conditionFound = document.querySelector("#conditionFoundA").value + ': ' + document.querySelector("#conditionFoundC").value;
        }
        

        fetch('https://jw1448.brighton.domains/save_the_pangolin_api', { //fetch post request using form data
            method: 'POST',
            headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
            },    
            body: new URLSearchParams({
                'username': document.querySelector("#username").value,
                'conditionFound': conditionFound,
                'notes': document.querySelector("#notes").value,
                'locationOfSighting': locationOfSighting,
                'imageName': imageName
            })
        })
        .then((response) => {
            if(response.status = '400'){
                reportError(' Please make sure all mandatory fields are filled in and you are submitting an jpg or png file');
            } else if (response.status = '500'){
                reportError(' There was a server error, please try again later');
            }
            return response.json();
        })
        .then((data) => { 
            console.log(data); 
            if (data.hasOwnProperty('id')) {
                uploadImage(imageName); 
            }
        })
        .catch((error) => {
            console.error;    
        });

    }

    uploadImage = (imageName) => { //upload file
        let blob = document.querySelector("#imageToSubmit").files[0];
        let imageToSubmit = new File([blob], imageName, {type: blob.type});

        let formdata = new FormData();
        formdata.append("sightingImage", imageToSubmit);

        let requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow'
        };

        fetch("https://jw1448.brighton.domains/save_the_pangolin_api/upload", requestOptions)
        .then(response => response.text())
        .then((data) => { 
            console.log(data); 
            let jsonData = JSON.parse(data);
            if (JSON.stringify(jsonData).includes("\"status\":true")){
                changeContent('Thanks');
            }
        })
        .catch(console.error);
        
    }

    navigator.serviceWorker.register('./sw.js', {'scope': './'});

    const json = localStorage.getItem('formState');
    if(json) {
        const formState = JSON.parse(json);
        changeContent(formState.activePage);
        document.querySelector("#username").value = formState.username;
        document.querySelector('#conditionFoundA').value = formState.conditionFoundA;
        document.querySelector("#conditionFoundB").value = formState.conditionFoundB;
        document.querySelector("#conditionFoundC").value = formState.conditionFoundC;
        document.querySelector("#notes").value = formState.notes;
    }else{
        changeContent('Upload');
    }
    
    showCFBox();
    getLocation();
    
    document.querySelector("#submitSighting").addEventListener("click", (event) => {
        if(document.querySelector("#imageToSubmit").files.length == 0 ){
            reportError('Select a file to submit');
        } else if(navigator.onLine){
            submitSighting();
        } else {
            reportError('You do not have an internet connection, submit again once you have one');
        }
    });

    document.querySelector('#conditionFoundA').addEventListener("change", (event) => {
        showCFBox();
    });
    
    window.onpagehide = () => {
        const json = JSON.stringify({
            "activePage" : document.querySelector(".active").id.replace('_link',''),
            "username" : document.querySelector("#username").value,
            "conditionFoundA" : document.querySelector('#conditionFoundA').value,
            "conditionFoundB" : document.querySelector('#conditionFoundB').value,
            "conditionFoundC" : document.querySelector('#conditionFoundC').value,
            "notes" : document.querySelector('#notes').value
        });
        localStorage.setItem('formState', json);
    };

});