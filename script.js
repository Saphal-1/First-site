setTimeout(()=>{
  document.getElementById("loader").style.display="none";
  document.querySelector(".container").style.display="grid";
},2000);

new Typed("#typing",{
  strings:[
    "Hi, it's me <span style='color:#ff9f43'>Saphal Thapaliya</span>. I am from <span style='color:#00f2ff'>Dhading, Nepal</span>. I am a student <span style='color:#00ffb3'>learning and playing with codes</span> to build creative digital experiences."
  ],
  typeSpeed:35,
  showCursor:false
});

particlesJS("particles-js",{
  particles:{
    number:{value:80},
    size:{value:3},
    move:{speed:1},
    line_linked:{enable:true},
    color:{value:"#00f2ff"}
  }
});

function copyText(text){
  navigator.clipboard.writeText(text);
  alert("Copied: "+text);
}

fetch("https://api.mcsrvstat.us/2/play.mcnpnetwork.com")
.then(res=>res.json())
.then(data=>{
  if(data.online){
    document.getElementById("status").innerHTML =
    "Server Status: <span style='color:#00ffb3'>ONLINE</span><br>Players: "+data.players.online+"/"+data.players.max+"<br>MOTD: "+data.motd.clean[0];
  }else{
    document.getElementById("status").innerHTML =
    "Server Status: <span style='color:red'>OFFLINE</span>";
  }
});
