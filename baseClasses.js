var dist=(Math.hypot)?Math.hypot:function(x,y) {return Math.sqrt(x*x+y*y);};

var keys=[keyboard(87),keyboard(83),keyboard(65),keyboard(68),keyboard(32)];

class Vector {
    constructor(x,y) {
        this.x=x;
        this.y=y;
    }
    
    magSquared() {
        return this.x*this.x+this.y*this.y;
    }
    
    mag() {
        return Math.sqrt(this.magSquared());
    }
    
    dot(v) {
        return this.x*v.x+this.y*v.y;
    }
    
    getScaledX(m) {
        return this.x*m/this.mag();
    }
    
    getScaledY(m) {
        return this.y*m/this.mag();
    }
    
    scale(m) {
        var mag=this.mag();
        if (mag==0) {return new Vector(0,0);}
        return new Vector(this.x*m/mag,this.y*m/mag);
    }
    
    mult(m) {
        return new Vector(this.x*m,this.y*m);
    }
    
    add(v) {
        return new Vector(this.x+v.x,this.y+v.y);
    }
}

class Point {
    constructor(x,y) {
        this.x=x;
        this.y=y;
    }
    
    rotate(x,y,theta) {
        var newX=x+(this.x-x)*Math.cos(theta)+(y-this.y)*Math.sin(theta);
        this.y=y+(this.x-x)*Math.sin(theta)+(this.y-y)*Math.cos(theta);
        this.x=newX;
    }
    
    translate(x,y) {
        this.x+=x;
        this.y+=y;
    }
    
    circleEjectVector(c) {
        if (c.containsPoint(this.x,this.y)) {
            var v=new Vector(c.x-this.x,c.y-this.y);
            return v.scale(c.r-v.mag());
        } else {
            return null;
        }
    }
}

class Segment {
    constructor(x1,y1,x2,y2,z) {
        this.p1=new Point(x1,y1);
        this.p2=new Point(x2,y2);
        this.v=new Vector(x2-x1,y2-y1);
        this.boundBox=new BoundBox(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1),z);
    }
    
    updateV() {
        this.v.x=this.p2.x-this.p1.x;
        this.v.y=this.p2.y-this.p1.y;
        this.boundBox=new BoundBox(Math.min(this.p1.x,this.p2.x),Math.min(this.p1.y,this.p2.y),Math.abs(this.p2.x-this.p1.x),Math.abs(this.p2.y-this.p1.y),this.boundBox.z);
    }
    
    getMidpoint() {
        return new Point((this.p1.x+this.p2.x)/2,(this.p1.y+this.p2.y)/2);
    }
    
    rotate(x,y,theta) {
        this.p1.rotate(x,y,theta);
        this.p2.rotate(x,y,theta);
        this.updateV();
    }
    
    translate(x,y) {
        this.p1.translate(x,y);
        this.p2.translate(x,y);
        this.boundBox.translate(x,y);
    }
    
    circleEjectVector(c) {
        if (!this.boundBox.intersectsCircle(c)) {return null;}
        var dToClosest=new Vector(c.x-this.p1.x,c.y-this.p1.y).dot(this.v)/this.v.mag();
        var pClose=new Point(this.p1.x+this.v.getScaledX(dToClosest),this.p1.y+this.v.getScaledY(dToClosest));
        if (((pClose.x-this.p1.x>0)==(pClose.x-this.p2.x>0))&&((pClose.y-this.p1.y>0)==(pClose.y-this.p2.y>0))) {
            return (dist(this.p1.x-c.x,this.p1.y-c.y)>dist(this.p2.x-c.x,this.p2.y-c.y))?this.p2.circleEjectVector(c):this.p1.circleEjectVector(c);
        } else {
            return pClose.circleEjectVector(c);
        }
    }
}

class Circle {
    constructor(x,y,r,z) {
        this.x=x;
        this.y=y;
        this.r=r;
        this.z=z;
    }
    
    containsPoint(x,y) {
        return dist(x-this.x,y-this.y)<=this.r;
    }
    
    translateVec(v) {
        if (v) {
            this.x+=v.x;
            this.y+=v.y;
        }
    }
    
    translate(x,y) {
        this.x+=x;
        this.y+=y;
    }
    
    circleEjectVector(c) {
        var v=new Vector(c.x-this.x,c.y-this.y);
        if (v.mag()>this.r+c.r) {return null;}
        return v.scale(this.r+c.r-v.mag());
    }
    
    intersectsCircle(c) {
        return c.z===this.z&&dist(c.x-this.x,c.y-this.y)<=this.r+c.r;
    }
}

class BoundBox {
    constructor(x,y,w,h,z) {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.z=z;
    }
    
    translate(x,y) {
        this.x+=x;
        this.y+=y;
    }
    
    intersectsCircle(c) {
        return this.z==c.z&&c.x-c.r<=this.x+this.w&&c.x+c.r>=this.x&&c.y-c.r<=this.y+this.h&&c.y+c.r>=this.y;
    }
    
    intersectsRect(r) {
        return r.z==this.z&&r.x<=this.x+this.w&&r.x+r.w>=this.x&&r.y<=this.y+this.h&&r.y+r.h>=this.y;
    }
    
    containsPoint(x,y,z) {
        return z==this.z&&x>=this.x&&y>=this.y&&x<=this.x+this.w&&y<=this.y+this.h;
    }
}

class CircleCover {
    constructor(x,y,r,fill,stroke,z) {
        this.hitbox=new Circle(x,y,r,z);
        this.fill=fill;
        this.stroke=stroke;
        this.boundBox=new BoundBox(x-r,y-r,r+r,r+r,z);
    }
    
    translate(x,y) {
        this.hitbox.translate(x,y);
        this.boundBox.translate(x,y);
    }
    
    render(ctx,screen) {
        if (screen.intersectsCircle(this.hitbox)) {
            ctx.fillStyle=this.fill;
            ctx.strokeStyle=black;
            ctx.beginPath();
            ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,2*Math.PI);
            ctx.fill();
            if (this.stroke) {ctx.stroke();}
        }
    }
}

class PolyCover {
    constructor(x,y,fill,stroke,z) {
        this.x=x;
        this.y=y;
        this.stroke=stroke;
        this.fill=fill;
        var minX=x[0];
        var minY=y[0];
        var maxX=minX;
        var maxY=minY;
        for (var i=1; i<x.length; i++) {
            if (x[i]<minX) {
                minX=x[i];
            } else if (x[i]>maxX) {
                maxX=x[i];
            }
            if (y[i]<minY) {
                minY=y[i];
            } else if (y[i]>maxY) {
                maxY=y[i];
            }
        }
        this.boundBox=new BoundBox(minX,minY,maxX-minX,maxY-minY,z);
    }
    
    translate(x,y) {
        this.boundBox.translate(x,y);
        for (var i=0; i<this.x.length; i++) {
            this.x[i]+=x;
            this.y[i]+=y;
        }
    }
    
    render(ctx,screen) {
        if (!screen.intersectsRect(this.boundBox)) {return;}
        ctx.fillStyle=this.fill;
        ctx.strokeStyle=black;
        ctx.beginPath();
        ctx.moveTo(this.x[0],this.y[0]);
        for (var i=this.x.length-1; i>=0; i--) {
            ctx.lineTo(this.x[i],this.y[i]);
        }
        ctx.fill();
        if (this.stroke) {ctx.stroke();}
    }
}

class ChunkCover {
    constructor(x,y,fill,z) {
        this.boundBox=new BoundBox(x,y,1000,1000,z);
        this.fill=fill;
    }
    
    translate(x,y) {
        this.boundBox.translate(x,y);
    }
    
    render(ctx,screen) {
        if (!this.boundBox.intersectsRect(screen)) {return;}
        ctx.fillStyle=this.fill;
        ctx.fillRect(this.boundBox.x,this.boundBox.y,1002,1002);
    }
}

class ChunkTerrain {
    constructor(type,z) {
        this.type=type;
        this.boundBox=new BoundBox(0,0,1000,1000,z);
    }
    
    translate(x,y) {
        this.boundBox.translate(x,y);
    }
    
    contains(x,y,z) {
        return this.boundBox.containsPoint(x,y,z);
    }
}

class CircleTerrain {
    constructor(type,x,y,r,z) {
        this.type=type;
        this.x=x;
        this.y=y;
        this.r=r;
        this.boundBox=new BoundBox(x-r,y-r,r+r,r+r,z);
    }
    
    translate(x,y) {
        this.boundBox.translate(x,y);
        this.x+=x;
        this.y+=y;
    }
    
    contains(x,y,z) {
        if (!this.boundBox.containsPoint(x,y,z)) return false;
        return dist(x-this.x,y-this.y)<=this.r;
    }
}

class PolyTerrain {
    constructor(type,x,y,z) {
        this.type=type;
        this.x=x;
        this.y=y;
        this.numPoints=x.length;
        var minX=x[0];
        var minY=y[0];
        var maxX=x[0];
        var maxY=y[0];
        for (var i=1; i<this.numPoints; i++) {
            if (x[i]>maxX) {
                maxX=x[i];
            } else if (x[i]<minX) {
                minX=x[i];
            }
            if (y[i]>maxY) {
                maxY=y[i];
            } else if (y[i]<minY) {
                minY=y[i];
            }
        }
        this.boundBox=new BoundBox(minX,minY,maxX-minX,maxY-minY,z);
    }
    
    translate(x,y) {
        this.boundBox.translate(x,y);
        for (var i=0; i<this.numPoints; i++) {
            this.x[i]+=x;
            this.y[i]+=y;
        }
    }
    
    contains(x,y,z) {
        var intersectCount=0;
        if (!this.boundBox.containsPoint(x,y,z)) return false;
        for (var i=0; i<this.numPoints; i++) {
            if (crossesRay(this.x[i],this.y[i],this.x[(i+1)%this.numPoints],this.y[(i+1)%this.numPoints],x,y)) {
                intersectCount++;
            }
        }
        return (intersectCount%2)==1;
    }
}

var crossesRay=function(x1,y1,x2,y2,x,y) {
    if ((y1-y)*(y2-y)>=0) return false;
    var amountAlong = (y-y1)/(y2-y1);
    return x1+(x2-x1)*amountAlong>=x;
}

var defaultResp=function(x,y,z) {
    return {"bgFill":"#000"};
    //return {"bgFill":"#0b0","walls":[{"type":"forest","w":100,"h":200,"spacing":30}],"seed":Math.abs(5748*x+92381*y)};
}

class Chunk {
    constructor(obj,x,y,z) {
        this.walls=[];
        this.groundCover=[];
        this.enemies=[];
        this.warps=[];
        this.terrain=[];
        if (!obj) {obj=defaultResp(x,y,z);}
        this.seed=obj.seed?obj.seed:0;
        if (obj.walls) {
            for (var i=0; i<obj.walls.length; i++) {
                switch (obj.walls[i].type) {
                    case "circle":
                        this.walls.push(new CircleWall(obj.walls[i].x,obj.walls[i].y,obj.walls[i].r,z));
                        break;
                    case "poly":
                        this.walls.push(new PolygonWall(obj.walls[i].x,obj.walls[i].y,z));
                        break;
                    case "tree":
                        this.walls.push(new Tree(obj.walls[i].x,obj.walls[i].y,obj.walls[i].w,obj.walls[i].h,this.seed+1,z));
                        this.seed=advanceSeed(this.seed);
                        break;
                    case "forest":
                        var testRect=new BoundBox(0,0,obj.walls[i].w+2*obj.walls[i].spacing,obj.walls[i].h+2*obj.walls[i].spacing,z);
                        var maxX=1000-testRect.w;
                        var maxY=1000-testRect.h;
                        var addRects=[];
                        for (var k=0; k<40; k++) {
                            this.seed=advanceSeed(this.seed);
                            testRect.x=this.seed%maxX;
                            this.seed=advanceSeed(this.seed);
                            testRect.y=this.seed%maxY;
                            var open=true;
                            for (var j=0; j<addRects.length; j++) {
                                if (addRects[j].intersectsRect(testRect)) {
                                    open=false;
                                    break;
                                }
                            }
                            if (open) {
                                addRects.push(new BoundBox(testRect.x+obj.walls[i].spacing,testRect.y+obj.walls[i].spacing,obj.walls[i].w,obj.walls[i].h,z));
                            }
                        }
                        for (var j=0; j<addRects.length; j++) {
                            this.walls.push(new Tree(addRects[j].x-obj.walls[i].spacing/2,addRects[j].y-obj.walls[i].spacing/2,addRects[j].w,addRects[j].h,advanceSeed(this.seed++),z));
                        }
                        break;
                    case "cabin":
                        var c=new Cabin(obj.walls[i].x,obj.walls[i].y,obj.walls[i].w,obj.walls[i].h,z);
                        this.walls.push(c);
                        this.warps.push(c.getDoorWarp(obj.walls[i].dest));
                        break;
                }
            }
        }
        if (obj.bgFill) {
            this.groundCover.push(new ChunkCover(0,0,obj.bgFill,z));
        }
        if (obj.groundCover) {
            for (var i=0; i<obj.groundCover.length; i++) {
                switch(obj.groundCover[i].type) {
                    case "circle":
                        this.groundCover.push(new CircleCover(obj.groundCover[i].x,obj.groundCover[i].y,obj.groundCover[i].r,obj.groundCover[i].fill,obj.groundCover[i].stroke,z));
                        break;
                    case "poly":
                        this.groundCover.push(new PolyCover(obj.groundCover[i].x,obj.groundCover[i].y,obj.groundCover[i].fill,obj.groundCover[i].stroke,z));
                        break;
                }
            }
        }
        if (obj.enemies) {
            for (var i=0; i<obj.enemies.length; i++) {
                switch(obj.enemies[i].type) {
                    case "test":
                        this.enemies.push(new BasicEnemy(obj.enemies[i].x,obj.enemies[i].y,z));
                        break;
                    case "shield":
                        this.enemies.push(new ShieldEnemy(obj.enemies[i].x,obj.enemies[i].y,z));
                        this.walls.push(this.enemies[this.enemies.length-1].shield);
                        break;
                }
            }
        }
        if (obj.warps) {
            for (var i=0; i<obj.warps.length; i++) {
                this.warps.push(new Warp(obj.warps[i].x,obj.warps[i].y,obj.warps[i].r,obj.warps[i].dest,z));
            }
        }
        if (obj.terrain) {
            for (var i=0; i<obj.terrain.length; i++) {
                switch(obj.terrain[i].hitbox.type) {
                    case "poly":
                        this.terrain.push(new PolyTerrain(obj.terrain[i].type,obj.terrain[i].hitbox.x,obj.terrain[i].hitbox.y,z));
                        break;
                    case "chunk":
                        this.terrain.push(new ChunkTerrain(obj.terrain[i].type,z));
                        break;
                    case "circle":
                        this.terrain.push(new CircleTerrain(obj.terrain[i].type,obj.terrain[i].hitbox.x,obj.terrain[i].hitbox.y,obj.terrain[i].hitbox.r,z));
                        break;
                }
            }
        }
    }
}

var getAngle=function(dx,dy) {
    if (dx==0) {return (dy>0?Math.PI/2:-Math.PI/2);}
    return Math.atan(dy/dx)+(dx>0?0:Math.PI);
}

var advanceSeed=function(seed) {
    return (57374*seed*seed+3914857*seed+598721)%1000000;
}

class Warp {
    constructor(x,y,r,dest,z) {
        this.x=x;
        this.y=y;
        this.r=r;
        this.dest=dest;
        this.boundBox=new BoundBox(x-r,y-r,r+r,r+r,z);
    }
    
    intersectsCircle(c) {
        return c.z==this.boundBox.z&&dist(c.x-this.x,c.y-this.y)<=this.r+c.r;
    }
    
    translate(x,y) {
        this.x+=x;
        this.y+=y;
        this.boundBox.translate(x,y);
    }
}