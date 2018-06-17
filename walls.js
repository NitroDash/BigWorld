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
    constructor(x,y,r,z) {
        this.hitbox=new Circle(x,y,r,z);
        this.boundBox=new BoundBox(x-r,y-r,r+r,r+r,z);
        this.alive=true;
    }
    
    circleEjectVector(c) {
        return this.hitbox.circleEjectVector(c);
    }
    
    translate(x,y) {
        this.hitbox.translate(x,y);
        this.boundBox.translate(x,y);
    }
    
    render(ctx,screen) {
        if (!screen.intersectsRect(this.boundBox)) {return;}
        ctx.fillStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,2*Math.PI);
        ctx.fill();
    }
}

class PolygonWall {
    constructor(x,y,z,fill) {
        this.alive=true;
        this.walls=[new Segment(x[x.length-1],y[y.length-1],x[0],y[0],z)];
        this.fillColor=fill;
        var minX=x[x.length-1];
        var maxX=minX;
        var minY=y[y.length-1];
        var maxY=minY;
        for (var i=0; i<x.length-1; i++) {
            this.walls.push(new Segment(x[i],y[i],x[i+1],y[i+1],z));
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
        for (var i=0; i<this.walls.length; i++) {
            if (this.walls[i].v.magSquared()<100) {
                this.walls[(i+1)%this.walls.length].p1=this.walls[i].getMidpoint();
                this.walls[(i+1)%this.walls.length].updateV();
                this.walls[(i+this.walls.length-1)%this.walls.length].p2=this.walls[i].getMidpoint();
                this.walls[(i+this.walls.length-1)%this.walls.length].updateV();
                this.walls.splice(i,1);
                i--;
            }
        }
        this.boundBox=new BoundBox(minX,minY,maxX-minX,maxY-minY,z);
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
        this.boundBox=new BoundBox(minX,minY,maxX-minX,maxY-minY,this.boundBox.z);
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
        if (this.fillColor) {
            ctx.fillStyle=this.fillColor;
            ctx.fill();
        }
    }
    
    fill(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.walls[0].p1.x,this.walls[0].p1.y);
        for (var i=this.walls.length-1; i>=0; i--) {
            ctx.lineTo(this.walls[i].p1.x,this.walls[i].p1.y);
        }
        ctx.fill();
        ctx.stroke();
    }
}

class Tree {
    constructor(x,y,w,h,seed,z) {
        this.alive=true;
        var trunkWidth=w*(seed*0.0000002+0.2);
        seed=advanceSeed(seed);
        var cx=x+w/2;
        var trunkX=[cx+trunkWidth,cx-trunkWidth];
        var trunkY=[y+h,y+h];
        var a=2*h/(trunkWidth*trunkWidth);
        var sampX=seed*0.000001*trunkWidth/2;
        seed=advanceSeed(seed);
        trunkX.push(sampX+cx-trunkWidth);
        trunkY.push(y+h-a*sampX*sampX);
        trunkX.push(cx-trunkWidth/2);
        trunkX.push(cx+trunkWidth/2);
        trunkY.push(y+h/2);
        trunkY.push(y+h/2);
        sampX=seed*0.000001*trunkWidth/2;
        seed=advanceSeed(seed);
        trunkX.push(cx+trunkWidth-sampX);
        trunkY.push(y+h-a*sampX*sampX);
        this.trunk=new PolygonWall(trunkX,trunkY,z,"#880");
        seed=advanceSeed(seed);
        var leafFill="rgb("+(seed%57)+","+(110+seed%36)+","+(seed%53)+")";
        if (seed%11<7) {
            var cy=y+h/3;
            var thetas=[0.7,2.4];
            for (var i=0; i<10; i++) {
                seed=advanceSeed(seed);
                var newT=seed*0.000001*Math.PI*2;
                var j=0;
                while (j<i+2&&thetas[j]<newT) {j++;}
                thetas.splice(j,0,newT);
            }
            for (var i=1; i<=thetas.length; i++) {
                if (Math.abs(thetas[i%thetas.length]-thetas[i-1]+((i==thetas.length)?Math.PI*2:0))>1) {
                    thetas.splice(i,0,(thetas[i%thetas.length]+thetas[i-1])/2+((i==thetas.length)?Math.PI:0));
                }
            }
            var leavesX=[];
            var leavesY=[];
            for (var i=0; i<thetas.length; i++) {
                leavesX.push(Math.cos(thetas[i])*w/2+cx);
                leavesY.push(Math.sin(thetas[i])*h/3+cy);
            }
            this.leaves=new PolygonWall(leavesX,leavesY,z,leafFill);
        } else {
            this.leaves=new PolygonWall([cx,x+w,x],[y,y+h*5/6,y+h*5/6],z,leafFill);
        }
        this.boundBox=new BoundBox(Math.min(this.leaves.boundBox.x,this.trunk.boundBox.x),Math.min(this.leaves.boundBox.y,this.trunk.boundBox.y),Math.max(this.leaves.boundBox.x+this.leaves.boundBox.w,this.trunk.boundBox.x+this.trunk.boundBox.w)-Math.min(this.leaves.boundBox.x,this.trunk.boundBox.x),Math.max(this.leaves.boundBox.y+this.leaves.boundBox.h,this.trunk.boundBox.y+this.trunk.boundBox.h)-Math.min(this.leaves.boundBox.y,this.trunk.boundBox.y),z);
    }
    
    translate(x,y) {
        this.trunk.translate(x,y);
        this.leaves.translate(x,y);
        this.boundBox.translate(x,y);
    }
    
    circleEjectVector(c) {
        var v1=this.trunk.circleEjectVector(c);
        if (v1) {
            var v2=this.leaves.circleEjectVector(c);
            if (v2) {
                return v1.add(v2);
            } else {
                return v1;
            }
        } else {
            return this.leaves.circleEjectVector(c);
        }
    }
    
    render(ctx,screen) {
        this.trunk.render(ctx,screen);
        this.leaves.render(ctx,screen);
    }
}

class Cabin {
    constructor(x,y,w,h,z) {
        this.alive=true;
        var roofHeight=w/4;
        this.boundary=new PolygonWall([x,x+w/2,x+w,x+w,x],[y+roofHeight,y,y+roofHeight,y+h,y+h],z);
        this.boundBox=this.boundary.boundBox;
        this.door=new PolyCover([x+w/2+40,x+w/2+40,x+w/2-40,x+w/2-40],[y+h,y+h-120,y+h-120,y+h],"#c70",true,z);
        this.doorknob=new CircleCover(x+w/2+25,y+h-60,10,"#cd2",true,z);
    }
    
    translate(x,y) {
        this.boundary.translate(x,y);
        this.door.translate(x,y);
        this.doorknob.translate(x,y);
    }
    
    getDoorWarp(dest) {
        return new Warp(this.boundBox.x+this.boundBox.w/2,this.boundBox.y+this.boundBox.h-30,40,dest,z);
    }
    
    circleEjectVector(c) {
        return this.boundary.circleEjectVector(c);
    }
    
    render(ctx,screen) {
        if (!screen.intersectsRect(this.boundBox)) {return;}
        ctx.fillStyle="#641";
        ctx.strokeStyle=black;
        this.boundary.fill(ctx);
        this.door.render(ctx,screen);
        this.doorknob.render(ctx,screen);
    }
}