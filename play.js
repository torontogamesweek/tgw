window.addEventListener("scroll", e => {
    let scrollTop = document.body.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop; 
    let newPos = scrollTop + "px";
    document.documentElement.style.setProperty('--scrollPos', newPos);
  });