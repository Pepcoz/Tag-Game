document.getElementById("start").onclick = function(){
    var ip = document.getElementById("ip").value;
    localStorage.setItem('ip', ip)
}