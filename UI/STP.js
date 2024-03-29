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
    
    checkOfflineRequests = () => {
        if(navigator.onLine){
            const requests = localStorage.getItem('requests');
            const requestsArray = JSON.parse(requests);
            if(requestsArray.length > 0){
                const currentRequest = JSON.parse(localStorage.getItem(requestsArray[0]));
                
                fetch('https://jw1448.brighton.domains/save_the_pangolin_api', {
                    method: 'POST',
                    headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                    },    
                    body: new URLSearchParams({
                        'username': currentRequest.username,
                        'conditionFound': currentRequest.conditionFound,
                        'notes': currentRequest.notes,
                        'locationOfSighting': currentRequest.locationOfSighting,
                        'imageName': currentRequest.imageName
                    })
                })
                .then((response) => {
                    if(response.status != '201'){
                        localStorage.removeItem(requestsArray[0]);
                        requestsArray.shift();
                        localStorage.setItem('requests', JSON.stringify(requestsArray));
                    }
                    return response.json();
                })
                .then((data) => { 
                    console.log(data); 
                    let image = new Image();
                    image.src = currentRequest.image;
                    let formdata = new FormData();
                    
                    function urltoFile(url, filename, mimeType){
                        return (fetch(url)
                            .then(function(res){return res.arrayBuffer();})
                            .then(function(buf){return new File([buf], filename,{type:mimeType});})
                        );
                    }
                    
                    urltoFile(image.src, currentRequest.imageName, image.type)
                    .then(function(file){ 
                        formdata.append("sightingImage", file);
                        
                        let requestOptions = {
                            method: 'POST',
                            body: formdata,
                            redirect: 'follow'
                        };
                        fetch("https://jw1448.brighton.domains/save_the_pangolin_api/upload", requestOptions)
                        .then(response => response.text())
                        .then((data) => { 
                            console.log(data); 
                        })
                        .catch(console.error);
                        
                        localStorage.removeItem(requestsArray[0]);
                        requestsArray.shift();
                        localStorage.setItem('requests', JSON.stringify(requestsArray));
                    });
                })
                .catch((error) => {
                    console.error;    
                });
            }
        }
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
    
    const requests = localStorage.getItem('requests');
    if(!requests) { localStorage.setItem("requests", "[]"); }
    
    showCFBox();
    getLocation();
    
    const Examples_section = document.querySelector('#Examples_section'); //populate examples
    let requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    fetch("https://jw1448.brighton.domains/save_the_pangolin_api?mostRecent=5", requestOptions)
        .then(response => response.json())
        .then((result) => {
            for (const sightings of result.sightings) {

                let requestOptions = {
                  method: 'GET',
                  redirect: 'follow'
                };
                fetch("https://jw1448.brighton.domains/save_the_pangolin_api/download?imageName="+sightings.imageName, requestOptions)
                    .then(response => response.blob())
                    .then((imageBlob) => {
                        
                        const urlCreator = window.URL || window.webkitURL;
                        let image = document.createElement('img');
                        image.src  = urlCreator.createObjectURL(imageBlob);
                        Examples_section.appendChild(image);
                        
                        let para = document.createElement("p");
                        let node = document.createTextNode("Submitted by " + sightings.username);
                        para.appendChild(node);
                        Examples_section.appendChild(para);
                        
                        para = document.createElement("p");
                        node = document.createTextNode("The pangolin was found " + sightings.conditionFound.replace(/([A-Z])/g, ' $1').trim().toLowerCase());
                        para.appendChild(node);
                        Examples_section.appendChild(para);
                        
                        if(sightings.notes){
                            para = document.createElement("p");
                            node = document.createTextNode("Additional notes:");
                            para.appendChild(node);
                            Examples_section.appendChild(para);
                            para = document.createElement("p");
                            node = document.createTextNode(sightings.notes);
                            para.appendChild(node);
                            Examples_section.appendChild(para);
                        }
                        
                        para = document.createElement("p");
                        node = document.createTextNode("The location of the sighting was " + sightings.locationOfSighting);
                        para.appendChild(node);
                        Examples_section.appendChild(para);
                        Examples_section.appendChild(document.createElement("br"));
                    })
                    .catch(error => console.log('error', error));
                
            }
        })
        .catch(error => console.log('error', error));
    
    document.querySelector("#submitSighting").addEventListener("click", (event) => {
        if(document.querySelector("#imageToSubmit").files.length == 0 ){
            reportError('Select a file to submit');
        } else if(navigator.onLine){
            submitSighting();
        } else {
            const requests = localStorage.getItem('requests');
            const requestsArray = JSON.parse(requests);
            const d = new Date();
            let requestName = "request"+d.getTime();
            requestsArray.push(requestName);
            localStorage.setItem('requests', JSON.stringify(requestsArray));
            
            
            const imageName = d.getTime() + '.' + document.querySelector("#imageToSubmit").files.item(0).name.split('.').pop();
            let conditionFound = "";
            if(document.querySelector('#conditionFoundA').value == "alive" && document.querySelector("#conditionFoundB").value != 'default'){
                conditionFound = document.querySelector("#conditionFoundA").value + ': ' + document.querySelector("#conditionFoundB").value;
            } else if(document.querySelector('#conditionFoundA').value == "dead" && document.querySelector("#conditionFoundC").value != 'default'){
                conditionFound = document.querySelector("#conditionFoundA").value + ': ' + document.querySelector("#conditionFoundC").value;
            }
            
            let base64Imagefile = "";
            const file = document.querySelector("#imageToSubmit")['files'][0];
            const reader = new FileReader();
            reader.onloadend = function () {
                base64Imagefile = reader.result;
                const json = JSON.stringify({
                    'username': document.querySelector("#username").value,
                    'conditionFound': conditionFound,
                    'notes': document.querySelector("#notes").value,
                    'locationOfSighting': locationOfSighting,
                    'imageName': imageName,
                    'image': base64Imagefile
                });
                localStorage.setItem(requestName, json);
            };
            reader.readAsDataURL(file);
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

    setInterval(checkOfflineRequests, 5000);
});