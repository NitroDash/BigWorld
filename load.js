var textures=[];
var loadStatus=[];

var srcs=[];

var numImages=0;
var loaded=0;

var hasSetup=0;

var debug=true;

function load() {
    loadArea(0,0,0);
    init();
}

function requestLoad(id) {
    if (loadStatus[id]==0) {
        textures[id]=loadImage(srcs[id],id);
    } else if (loadStatus[id]==3) {
        loadStatus[id]=2;
    }
}

function deallocate(id) {
    textures[id]=null;
    loadStatus[id]=0;
}

function loadImage(src,id) {
    loaded++;
    loadStatus[id]=1;
    var obj=new Image();
    obj.src=src;
    obj.onload=function() {incrementLoad(id);};
    return obj;
}

function incrementLoad(id) {
    loaded--;
    if (id!=null) {
        loadStatus[id]=2;
    }
    if (loaded<=0) {
        if (hasSetup==0) {
            hasSetup=1;
            setupSelect();
        } else if (hasSetup==1) {
            hasSetup=2;
            setup();
        }
    }
}

function loadJSON(filename,callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(JSON.parse(xobj.responseText));
          } else if (xobj.readyState==4&&xobj.status=="404") {
              callback(null);
          }
    };
    xobj.send(null);  
}

function loadArea(x,y,z) {
    for (var dx=-1; dx<=1; dx++) {
        for (var dy=-1; dy<=1; dy++) {
            loadChunk(x+dx,y+dy,z);
        }
    }
}

function loadChunk(x,y,z) {
    if (addToLoadQueue(x,y,z)) {
        loadJSON("areas/"+x+"_"+y+"_"+z+".json",function(resp) {
            loadInChunk(x,y,z,new Chunk(resp,x,y,z));
        });
    }
}

function loadNPC(name) {
    if (addToLoadQueueNPC(name)) {
        loadJSON("npcs/"+name+".json",function(resp) {
            loadInNPC(name,makeNPC(resp,name));
        })
    }
}

function loadTravelNPC(name,id) {
    if (addToLoadQueueNPC(name)) {
        loadJSON("npcs/"+name+".json",function(resp) {
            loadInNPC(name,makeTravelNPC(resp,name,id));
        })
    }
}