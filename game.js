var ctx;

var init=function() {
    debug=false;
    var canvas=document.getElementById("canvas");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    ctx=document.getElementById("canvas").getContext("2d");
    gameLoop();
}

var player=new Player(100,100);
var camera={"x":100,"y":100};
var walls=[];
var cover=[];

var chunkLoadQueue=[];

var gameLoop=function() {
    update();
    render();
    window.requestAnimationFrame(gameLoop);
}

var update=function() {
    player.update();
    camera.x=player.hitbox.x;
    camera.y=player.hitbox.y;
    checkForChunkLoads();
}

var screenBox=new BoundBox(0,0,0,0);

var render=function() {
    ctx.canvas.width=window.innerWidth;
    ctx.canvas.height=window.innerHeight;
    screenBox.w=ctx.canvas.width;
    screenBox.h=ctx.canvas.height;
    screenBox.x=camera.x-screenBox.w/2;
    screenBox.y=camera.y-screenBox.h/2;
    ctx.translate(ctx.canvas.width/2-camera.x,ctx.canvas.height/2-camera.y);
    for (var i=0; i<cover.length; i++) {
        cover[i].render(ctx,screenBox);
    }
    player.render(ctx);
    for (var i=0; i<walls.length; i++) {
        walls[i].render(ctx,screenBox);
    }
    ctx.translate(camera.x-ctx.canvas.width/2,camera.y-ctx.canvas.height/2);
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
}

var checkForChunkLoads=function() {
    var x=Math.floor(player.hitbox.x/1000);
    var y=Math.floor(player.hitbox.y/1000);
    for (var dx=-1; dx<=1; dx++) {
        for (var dy=-1; dy<=1; dy++) {
            loadChunk(x+dx,y+dy,0);
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

var addToLoadQueue=function(x,y,z) {
    for (var i=chunkLoadQueue.length-1; i>=0; i--) {
        if (chunkLoadQueue[i].matches(x,y,z)) {
            return false;
        }
    }
    chunkLoadQueue.push(new ChunkLoad(x,y,z));
    if (chunkLoadQueue.length>20) {
        for (var i=0; i<chunkLoadQueue.length; i++) {
            if (!canBeSeen(chunkLoadQueue[i].x,chunkLoadQueue[i].y,chunkLoadQueue[i].z)&&chunkLoadQueue[i].status==1) {
                purgeObjects(new BoundBox(chunkLoadQueue[i].x*1000+1,chunkLoadQueue[i].y*1000+1,998,998));
                chunkLoadQueue.splice(i,1);
                break;
            }
        }
    }
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
}

var canBeSeen=function(x,y,z) {
    return Math.abs(Math.floor(player.hitbox.x/1000)-x)+Math.abs(Math.floor(player.hitbox.y/1000)-y)<=3&&z==0;
}