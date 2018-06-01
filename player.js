var black="#000";

class Entity {
    constructor(x,y,r) {
        this.hitbox=new Circle(x,y,r);
    }
    
    update() {}
    
    render(ctx) {
        ctx.fillStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,2*Math.PI);
        ctx.fill();
    }
}

class Player extends Entity {
    constructor(x,y) {
        super(x,y,20);
        this.SPEED=10;
    }
    
    update() {
        var d=new Vector(0,0);
        if (keys[0].isDown) {
            d.y=-1;
        } else if (keys[1].isDown) {
            d.y=1;
        }
        if (keys[2].isDown) {
            d.x=-1;
        } else if (keys[3].isDown) {
            d.x=1;
        }
        d=d.scale(this.SPEED);
        this.hitbox.translateVec(d);
        for (var i=0; i<walls.length; i++) {
            this.hitbox.translateVec(walls[i].circleEjectVector(this.hitbox));
        }
    }
}

class Wall {
    constructor(x1,y1,x2,y2) {
        this.hitbox=new Segment(x1,y1,x2,y2);
    }
    
    circleEjectVector(c) {
        return this.hitbox.circleEjectVector(c);
    }
    
    rotate(x,y,theta) {
        this.hitbox.rotate(x,y,theta);
    }
    
    render(ctx) {
        ctx.strokeStyle=black;
        ctx.beginPath();
        ctx.moveTo(this.hitbox.p1.x,this.hitbox.p1.y);
        ctx.lineTo(this.hitbox.p2.x,this.hitbox.p2.y);
        ctx.stroke();
    }
}

class CircleWall {
    constructor(x,y,r) {
        this.hitbox=new Circle(x,y,r);
        this.boundBox=new BoundBox(x-r,y-r,r+r,r+r);
    }
    
    circleEjectVector(c) {
        return this.hitbox.circleEjectVector(c);
    }
    
    translate(x,y) {
        this.hitbox.translate(x,y);
        this.boundBox.translate(x,y);
    }
    
    render(ctx) {
        ctx.fillStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,2*Math.PI);
        ctx.fill();
    }
}

class PolygonWall {
    constructor(x,y) {
        this.walls=[new Segment(x[x.length-1],y[y.length-1],x[0],y[0])];
        var minX=x[x.length-1];
        var maxX=minX;
        var minY=y[y.length-1];
        var maxY=minY;
        for (var i=0; i<x.length-1; i++) {
            this.walls.push(new Segment(x[i],y[i],x[i+1],y[i+1]));
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
        for (var i=0; i<this.walls.length; i++) {
            this.walls[i].translate(x,y);
        }
        this.boundBox.translate(x,y);
    }
    
    updateBounds() {
        var minX=this.walls[0].p1.x;
        var maxX=minX;
        var minY=this.walls[0].p1.y;
        var maxY=minY;
        for (var i=1; i<this.walls.length; i++) {
            if (this.walls[i].p1.x<minX) {
                minX=this.walls[i].p1.x;
            } else if (this.walls[i].p1.x>maxX) {
                maxX=this.walls[i].p1.x;
            }
            if (this.walls[i].p1.y<minY) {
                minY=this.walls[i].p1.y;
            } else if (this.walls[i].p1.y>maxY) {
                maxY=this.walls[i].p1.y;
            }
        }
        this.boundBox=new BoundBox(minX,minY,maxX-minX,maxY-minY);
    }
    
    rotate(x,y,theta) {
        for (var i=0; i<this.walls.length; i++) {
            this.walls[i].rotate(x,y,theta);
        }
        this.updateBounds();
    }
    
    circleEjectVector(c) {
        if (!this.boundBox.intersectsCircle(c)) {return null;}
        for (var i=0; i<this.walls.length; i++) {
            var v=this.walls[i].circleEjectVector(c);
            if (v) {
                var w=this.walls[(i+1)%this.walls.length].circleEjectVector(c);
                if (w) {
                    return (v.magSquared()>w.magSquared())?v:w;
                } else if (i==0) {
                    w=this.walls[this.walls.length-1].circleEjectVector(c);
                    if (w) {
                        return (v.magSquared()>w.magSquared())?v:w;
                    } else {
                        return v;
                    }
                } else {
                    return v;
                }
            }
        }
        return null;
    }
    
    render(ctx,screen) {
        if (!screen.intersectsRect(this.boundBox)) {return;}
        ctx.strokeStyle=black;
        ctx.beginPath();
        ctx.moveTo(this.walls[0].p1.x,this.walls[0].p1.y);
        for (var i=this.walls.length-1; i>=0; i--) {
            ctx.lineTo(this.walls[i].p1.x,this.walls[i].p1.y);
        }
        ctx.stroke();
    }
}