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

    document.querySelector("#submitSighting").addEventListener("click", function(event){

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
                'locationOfSighting': document.querySelector("#locationOfSighting").value, //remember to send name of file eventually to use in the path
                'imageName': imageName
            })
        })
        .then((response) => response.json())
        .then((data) => { console.log(data) })
        .catch(console.error);

        /*fetch('https://jw1448.brighton.domains/save_the_pangolin_api?username=testuser1') get request if needed
        .then((response) => response.json())
        .then((data) => console.log(data));*/
    });

});