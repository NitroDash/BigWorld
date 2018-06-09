var black="#000";

class Entity {
    constructor(x,y,r,z) {
        this.hitbox=new Circle(x,y,r,z);
        this.alive=true;
    }
    
    update() {}
    
    translate(x,y) {
        this.hitbox.translate(x,y);
    }
    
    reset() {
        this.alive=false;
    }
    
    warpTo(dest) {
        this.translate(dest.chunk.x*1000+dest.x-this.hitbox.x,dest.chunk.y*1000+dest.y-this.hitbox.y);
        this.hitbox.z=dest.chunk.z;
    }
    
    intersectsRect(rect) {
        return rect.intersectsCircle(this.hitbox);
    }
    
    render(ctx,screen) {
        if (!screen.intersectsCircle(this.hitbox)) {return;}
        ctx.fillStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,2*Math.PI);
        ctx.fill();
    }
}

class Player extends Entity {
    constructor(x,y,z) {
        super(x,y,20,z);
        this.SPEED=5;
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
        var speed=this.SPEED;
        switch(getTerrain(this.hitbox.x,this.hitbox.y,this.hitbox.z).type) {
            case "water":
                speed/=2;
                break;
        }
        d=d.scale(speed);
        this.hitbox.translateVec(d);
        for (var i=0; i<walls.length; i++) {
            this.hitbox.translateVec(walls[i].circleEjectVector(this.hitbox));
        }
    }
    
    reset() {}
}

class TestEnemy extends Entity {
    constructor(x,y,z) {
        super(x,y,15,z);
        this.shotTimer=60;
    }
    
    update() {
        if (dist(this.hitbox.x-player.hitbox.x,this.hitbox.y-player.hitbox.y)<500) {
            this.hitbox.translateVec((new Vector(player.hitbox.x-this.hitbox.x,player.hitbox.y-this.hitbox.y)).scale(3));
            this.shotTimer--;
            if (this.shotTimer<=0) {
                this.shotTimer=60;
                addEntity(new TestShot(this.hitbox.x,this.hitbox.y,getAngle(player.hitbox.x-this.hitbox.x,player.hitbox.y-this.hitbox.y),this.hitbox.z));
            }
        }
        for (var i=0; i<walls.length; i++) {
            this.hitbox.translateVec(walls[i].circleEjectVector(this.hitbox));
        }
    }
    
    render(ctx,screen) {
        if (!screen.intersectsCircle(this.hitbox)){return;}
        ctx.fillStyle="#f00";
        ctx.strokeStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }
}

class TestShot extends Entity {
    constructor(x,y,theta,z) {
        super(x,y,5,z);
        this.d=new Vector(5*Math.cos(theta),5*Math.sin(theta));
    }
    
    update() {
        this.hitbox.translateVec(this.d);
        for (var i=0; i<walls.length; i++) {
            var v=walls[i].circleEjectVector(this.hitbox);
            if (v) {
                v=v.scale(1);
                var newX=-v.x*this.d.x-v.y*this.d.y;
                this.d.y=-v.y*this.d.x+v.x*this.d.y;
                this.d.x=v.x*newX-v.y*this.d.y;
                this.d.y=v.y*newX+v.x*this.d.y;
            }
        }
        if (dist(this.hitbox.x-player.hitbox.x,this.hitbox.y-player.hitbox.y)>2000) {
            this.alive=false;
        }
    }
    
    render(ctx,screen) {
        if (!screen.intersectsCircle(this.hitbox)){return;}
        ctx.fillStyle="#f00";
        ctx.strokeStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }
}