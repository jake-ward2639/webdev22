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