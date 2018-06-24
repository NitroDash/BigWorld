var travelnpcs=[
    {
        "path":[
            {"type":"line","start":0,"end":600,"x1":400,"y1":-400,"x2":1400,"y2":-400,"z":0},
            {"type":"line","start":600,"end":1200,"x2":400,"y2":-400,"x1":1400,"y1":-400,"z":0}
        ],
        "name":"test4"
    }
]

var checkForNPCLoads=function() {
    for (var i=0; i<travelnpcs.length; i++) {
        var pos=getNPCPosition(i);
        if (canBeSeen(Math.floor(pos.x/1000),Math.floor(pos.y/1000),pos.z)) {
            loadTravelNPC(travelnpcs[i].name,i);
        }
    }
}

var getNPCPosition=function(id) {
    var pathTime=time%travelnpcs[id].path[travelnpcs[id].path.length-1].end;
    for (var i=0; i<travelnpcs[id].path.length; i++) {
        if (pathTime<=travelnpcs[id].path[i].end) {
            return getPathPosition(pathTime,travelnpcs[id].path[i]);
        }
    }
    return {"x":0,"y":0};
}

var getPathPosition=function(pathTime,path) {
    switch(path.type) {
        case "line":
            var timeRatio=(pathTime-path.start)/(path.end-path.start);
            return {"x":path.x1+timeRatio*(path.x2-path.x1),"y":path.y1+timeRatio*(path.y2-path.y1),"z":path.z};
    }
}