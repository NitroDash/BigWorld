var dist=(Math.hypot)?Math.hypot:function(x,y) {return Math.sqrt(x*x+y*y);};

var keys=[keyboard(87),keyboard(83),keyboard(65),keyboard(68)];

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
    constructor(x1,y1,x2,y2) {
        this.p1=new Point(x1,y1);
        this.p2=new Point(x2,y2);
        this.v=new Vector(x2-x1,y2-y1);
        this.boundBox=new BoundBox(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));
    }
    
    updateV() {
        this.v.x=this.p2.x-this.p1.x;
        this.v.y=this.p2.y-this.p1.y;
        this.boundBox=new BoundBox(Math.min(this.p1.x,this.p2.x),Math.min(this.p1.y,this.p2.y),Math.abs(this.p2.x-this.p1.x),Math.abs(this.p2.y-this.p1.y));
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
    constructor(x,y,r) {
        this.x=x;
        this.y=y;
        this.r=r;
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
}

class BoundBox {
    constructor(x,y,w,h) {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
    }
    
    translate(x,y) {
        this.x+=x;
        this.y+=y;
    }
    
    intersectsCircle(c) {
        return c.x-c.r<=this.x+this.w&&c.x+c.r>=this.x&&c.y-c.r<=this.y+this.h&&c.y+c.r>=this.y;
    }
    
    intersectsRect(r) {
        return r.x<=this.x+this.w&&r.x+r.w>=this.x&&r.y<=this.y+this.h&&r.y+r.h>=this.y;
    }
}

class CircleCover {
    constructor(x,y,r,fill) {
        this.hitbox=new Circle(x,y,r);
        this.fill=fill;
        this.boundBox=new BoundBox(x-r,y-r,r+r,r+r);
    }
    
    translate(x,y) {
        this.hitbox.translate(x,y);
        this.boundBox.translate(x,y);
    }
    
    render(ctx,screen) {
        if (screen.intersectsCircle(this.hitbox)) {
            ctx.fillStyle=this.fill;
            ctx.beginPath();
            ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,2*Math.PI);
            ctx.fill();
        }
    }
}

class PolyCover {
    constructor(x,y,fill) {
        this.x=x;
        this.y=y;
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
        this.boundBox=new BoundBox(minX,minY,maxX-minX,maxY-minY);
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
        ctx.beginPath();
        ctx.moveTo(this.x[0],this.y[0]);
        for (var i=this.x.length-1; i>=0; i--) {
            ctx.lineTo(this.x[i],this.y[i]);
        }
        ctx.fill();
    }
}

class ChunkCover {
    constructor(x,y,fill) {
        this.boundBox=new BoundBox(x,y,1000,1000);
        this.fill=fill;
    }
    
    translate(x,y) {
        this.boundBox.translate(x,y);
    }
    
    render(ctx,screen) {
        if (!this.boundBox.intersectsRect(screen)) {return;}
        ctx.fillStyle=this.fill;
        ctx.fillRect(this.boundBox.x,this.boundBox.y,1000,1000);
    }
}

var defaultResp={"groundCover":[{"type":"circle","x":500,"y":500,"r":500,"fill":"#0ff"}]};

class Chunk {
    constructor(obj) {
        this.walls=[];
        this.groundCover=[];
        this.enemies=[];
        if (!obj) {obj=defaultResp;}
        if (obj.walls) {
            for (var i=0; i<obj.walls.length; i++) {
                switch (obj.walls[i].type) {
                    case "circle":
                        this.walls.push(new CircleWall(obj.walls[i].x,obj.walls[i].y,obj.walls[i].r));
                        break;
                    case "poly":
                        this.walls.push(new PolygonWall(obj.walls[i].x,obj.walls[i].y));
                        break;
                }
            }
        }
        if (obj.bgFill) {
            this.groundCover.push(new ChunkCover(0,0,obj.bgFill));
        }
        if (obj.groundCover) {
            for (var i=0; i<obj.groundCover.length; i++) {
                switch(obj.groundCover[i].type) {
                    case "circle":
                        this.groundCover.push(new CircleCover(obj.groundCover[i].x,obj.groundCover[i].y,obj.groundCover[i].r,obj.groundCover[i].fill));
                        break;
                    case "poly":
                        this.groundCover.push(new PolyCover(obj.groundCover[i].x,obj.groundCover[i].y,obj.groundCover[i].fill));
                        break;
                }
            }
        }
        if (obj.enemies) {
            for (var i=0; i<obj.enemies.length; i++) {
                switch(obj.enemies[i].type) {
                    case "test":
                        this.enemies.push(new TestEnemy(obj.enemies[i].x,obj.enemies[i].y));
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