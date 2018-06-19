var ctx;

var init=function() {
    debug=false;
    var canvas=document.getElementById("canvas");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    ctx=document.getElementById("canvas").getContext("2d");
    gameLoop();
}

var player=new Player(100,100,0);
var camera={"x":100,"y":100};
var walls=[];
var entities=[];
var cover=[];
var warps=[];
var terrain=[];
var npcs=[];

var speechFont="20px sans-serif";

var mouse={"x":0,"y":0};

(function() {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        event=event||window.event;
        mouse.x=event.pageX;
        mouse.y=event.pageY;
    }
})();

var z=0;
var warpCounter=0;
var warpDest=null;
var checkpoint={"x":100,"y":100,"z":0};

var circleFadeRadius=1;

var chunkLoadQueue=[];
var npcLoadQueue=[];

var gameLoop=function() {
    update();
    for (var i=0; i<keys.length; i++) {
        keys[i].isPressed=false;
    }
    render();
    window.requestAnimationFrame(gameLoop);
}

var update=function() {
    if (deathAnimCounter!=0) {
        deathAnimCounter++;
        circleFadeRadius=1-Math.abs(deathAnimCounter)/60;
        if (deathAnimCounter>=100) {
            clearAll();
            player.hitbox.x=checkpoint.x;
            player.hitbox.y=checkpoint.y;
            player.hitbox.z=checkpoint.z;
            loadArea(Math.floor(checkpoint.x/1000),Math.floor(checkpoint.y/1000),checkpoint.z);
            camera.x=player.hitbox.x;
            camera.y=player.hitbox.y;
            deathAnimCounter=-100;
            player.reset();
        }
        return;
    } else if (warpCounter!=0) {
        warpCounter++;
        if (warpCounter==30) {
            screenBox.x=player.hitbox.x-500;
            screenBox.y=player.hitbox.y-500;
            screenBox.w=1000;
            screenBox.h=1000;
            screenBox.z=player.hitbox.z;
            for (var i=0; i<entities.length; i++) {
                if (entities[i].intersectsRect(screenBox)) {
                    entities[i].reset();
                }
            }
            player.warpTo(warpDest);
            z=warpDest.chunk.z;
            camera.x=player.hitbox.x;
            camera.y=player.hitbox.y;
            warpCounter=-30;
        }
        circleFadeRadius=1-Math.abs(warpCounter)/25;
        return;
    } else if (cutscene.active) {
        cutscene.update();
        return;
    }
    for (var i=0; i<entities.length; i++) {
        if (entities[i].hitbox.z==z) {
            entities[i].update();
        }
        if (!entities[i].alive) {
            entities.splice(i,1);
            i--;
        }
    }
    for (var i=0; i<walls.length; i++) {
        if (!walls[i].alive) {
            walls.splice(i,1);
            i--;
        }
    }
    for (var i=0; i<npcs.length; i++) {
        npcs[i].update();
    }
    player.update();
    for (var i=0; i<warps.length; i++) {
        if (warps[i].intersectsCircle(player.hitbox)) {
            loadArea(warps[i].dest.chunk.x,warps[i].dest.chunk.y,warps[i].dest.chunk.z);
            warpCounter=1;
            warpDest=warps[i].dest;
        }
    }
    camera.x=player.hitbox.x;
    camera.y=player.hitbox.y;
    checkForChunkLoads();
}

var defaultTerrain=new ChunkTerrain("land");

var getTerrain=function(x,y,z) {
    for (var i=0; i<terrain.length; i++) {
        if (terrain[i].contains(x,y,z)) {
            return terrain[i];
        }
    }
    return defaultTerrain;
}

var screenBox=new BoundBox(0,0,0,0);

var render=function() {
    ctx.canvas.width=window.innerWidth;
    ctx.canvas.height=window.innerHeight;
    screenBox.w=ctx.canvas.width;
    screenBox.h=ctx.canvas.height;
    screenBox.x=camera.x-screenBox.w/2;
    screenBox.y=camera.y-screenBox.h/2;
    screenBox.z=z;
    ctx.translate(ctx.canvas.width/2-camera.x,ctx.canvas.height/2-camera.y);
    ctx.fillStyle=black;
    if (circleFadeRadius!=1) {
        ctx.fillRect(camera.x-ctx.canvas.width/2,camera.y-ctx.canvas.height/2,ctx.canvas.width,ctx.canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(camera.x,camera.y,Math.max(circleFadeRadius*Math.max(ctx.canvas.width,ctx.canvas.height)/2,1),0,2*Math.PI);
        ctx.clip();
    }
    for (var i=0; i<cover.length; i++) {
        cover[i].render(ctx,screenBox);
    }
    for (var i=0; i<walls.length; i++) {
        walls[i].render(ctx,screenBox);
    }
    for (var i=0; i<entities.length; i++) {
        entities[i].render(ctx,screenBox);
    }
    for (var i=0; i<npcs.length; i++) {
        npcs[i].render(ctx,screenBox);
    }
    player.render(ctx,screenBox);
    cutscene.render(ctx);
    if (circleFadeRadius!=1) {
        ctx.restore();
    }
    ctx.translate(camera.x-ctx.canvas.width/2,camera.y-ctx.canvas.height/2);
    player.renderHP(ctx);
}

var drawSpeechBox=function(text,x,y) {
    ctx.font=speechFont;
    var w=0;
    for (var i=0; i<text.length; i++) {
        var newW=ctx.measureText(text[i]).width;
        w=Math.max(newW,w);
    }
    w+=20;
    var rectX=x-w/2;
    if (rectX<camera.x-ctx.canvas.width/2) rectX=camera.x-ctx.canvas.width/2;
    if (rectX>camera.x+ctx.canvas.width/2-w) rectX=camera.x+ctx.canvas.width/2-w;
    var h=text.length*23+6;
    ctx.fillStyle="#ddd";
    ctx.strokeStyle=black;
    ctx.beginPath();
    ctx.moveTo(rectX,y-h-20);
    ctx.lineTo(rectX+w,y-h-20);
    ctx.lineTo(rectX+w,y-20);
    ctx.lineTo(x+10,y-20);
    ctx.lineTo(x,y);
    ctx.lineTo(x-10,y-20);
    ctx.lineTo(rectX,y-20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle=black;
    for (var i=0; i<text.length; i++) {
        ctx.fillText(text[i],rectX+10,y-h+23*i);
    }
}

var loadInChunk=function(x,y,z,chunk) {
    for (var i=chunkLoadQueue.length-1; i>=0; i--) {
        if (chunkLoadQueue[i].matches(x,y,z)) {
            if (chunkLoadQueue[i].status==0) {
                chunkLoadQueue[i].status=1;
                break;
            } else {
                return;
            }
        }
    }
    for (var i=0; i<chunk.walls.length; i++) {
        chunk.walls[i].translate(x*1000,y*1000);
        walls.push(chunk.walls[i]);
    }
    for (var i=0; i<chunk.groundCover.length; i++) {
        chunk.groundCover[i].translate(x*1000,y*1000);
        cover.push(chunk.groundCover[i]);
    }
    for (var i=0; i<chunk.enemies.length; i++) {
        chunk.enemies[i].translate(x*1000,y*1000);
        entities.push(chunk.enemies[i]);
    }
    for (var i=0; i<chunk.warps.length; i++) {
        chunk.warps[i].translate(x*1000,y*1000);
        warps.push(chunk.warps[i]);
    }
    for (var i=0; i<chunk.terrain.length; i++) {
        chunk.terrain[i].translate(x*1000,y*1000);
        terrain.push(chunk.terrain[i]);
    }
}

var loadInNPC=function(name, npc) {
    for (var i=npcLoadQueue.length-1; i>=0; i--) {
        if (npcLoadQueue[i].name===name) {
            if (npcLoadQueue[i].status==0) {
                npcLoadQueue[i].status=1;
                break;
            } else {
                return;
            }
        }
    }
    npcs.push(npc);
}

var checkForChunkLoads=function() {
    var x=Math.floor(player.hitbox.x/1000);
    var y=Math.floor(player.hitbox.y/1000);
    for (var dx=-1; dx<=1; dx++) {
        for (var dy=-1; dy<=1; dy++) {
            loadChunk(x+dx,y+dy,z);
        }
    }
}

class ChunkLoad {
    constructor(x,y,z) {
        this.x=x;
        this.y=y;
        this.z=z;
        this.status=0;
    }
    
    matches(x,y,z) {
        return this.x==x&&this.y==y&&this.z==z;
    }
}

class NPCLoad {
    constructor(name) {
        this.name=name;
        this.status=0;
    }
}

var isLoaded=function(x,y,z) {
    for (var i=0; i<chunkLoadQueue.length; i++) {
        if (chunkLoadQueue[i].matches(x,y,z)) {
            return chunkLoadQueue[i].status==1?true:false;
        }
    }
    return false;
}

var isLoadedNPC=function(name,notLoadedYetResponse) {
    for (var i=0; i<npcLoadQueue.length; i++) {
        if (npcLoadQueue[i].name===name) {
            return npcLoadQueue[i].status==1?true:notLoadedYetResponse;
        }
    }
    return false;
}

var addToLoadQueue=function(x,y,z) {
    for (var i=chunkLoadQueue.length-1; i>=0; i--) {
        if (chunkLoadQueue[i].matches(x,y,z)) {
            return false;
        }
    }
    chunkLoadQueue.push(new ChunkLoad(x,y,z));
    if (chunkLoadQueue.length>40) {
        for (var i=0; i<chunkLoadQueue.length; i++) {
            if (!canBeSeen(chunkLoadQueue[i].x,chunkLoadQueue[i].y,chunkLoadQueue[i].z)&&chunkLoadQueue[i].status==1) {
                purgeObjects(new BoundBox(chunkLoadQueue[i].x*1000+1,chunkLoadQueue[i].y*1000+1,998,998,chunkLoadQueue[i].z));
                chunkLoadQueue.splice(i,1);
                break;
            }
        }
    }
    return true;
}

var addToLoadQueueNPC=function(name) {
    if (isLoadedNPC(name,true)) return false;
    npcLoadQueue.push(new NPCLoad(name));
    return true;
}

var purgeObjects=function(rect) {
    for (var i=0; i<walls.length; i++) {
        if (walls[i].boundBox.intersectsRect(rect)) {
            walls.splice(i,1);
            i--;
        }
    }
    for (var i=0; i<cover.length; i++) {
        if (cover[i].boundBox.intersectsRect(rect)) {
            cover.splice(i,1);
            i--;
        }
    }
    for (var i=0; i<entities.length; i++) {
        if (entities[i].intersectsRect(rect)) {
            entities.splice(i,1);
            i--;
        }
    }
    for (var i=0; i<warps.length; i++) {
        if (warps[i].boundBox.intersectsRect(rect)) {
            warps.splice(i,1);
            i--;
        }
    }
    for (var i=0; i<terrain.length; i++) {
        if (terrain[i].boundBox.intersectsRect(rect)) {
            terrain.splice(i,1);
            i--;
        }
    }
    for (var i=0; i<npcs.length; i++) {
        if (rect.intersectsCircle(npcs[i])) {
            removeNPC(npcs[i].name);
            npcs.splice(i,1);
            i--;
        }
    }
}

var clearAll=function() {
    walls=[];
    cover=[];
    entities=[];
    warps=[];
    terrain=[];
    chunkLoadQueue=[];
    npcs=[];
    npcLoadQueue=[];
}

var removeNPC=function(name) {
    for (var i=0; i<npcLoadQueue.length; i++) {
        if (npcLoadQueue[i].name===name) {
            npcLoadQueue.splice(i,1);
            return;
        }
    }
}

var addEntity=function(entity) {
    entities.push(entity);
}

var canBeSeen=function(x,y,z) {
    return Math.abs(Math.floor(player.hitbox.x/1000)-x)+Math.abs(Math.floor(player.hitbox.y/1000)-y)<=3&&z==0;
}