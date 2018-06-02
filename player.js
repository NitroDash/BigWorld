var black="#000";

class Entity {
    constructor(x,y,r) {
        this.hitbox=new Circle(x,y,r);
        this.alive=true;
    }
    
    update() {}
    
    translate(x,y) {
        this.hitbox.translate(x,y);
    }
    
    intersectsRect(rect) {
        return rect.intersectsCircle(this.hitbox);
    }
    
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

class TestEnemy extends Entity {
    constructor(x,y) {
        super(x,y,15);
        this.shotTimer=60;
    }
    
    update() {
        if (dist(this.hitbox.x-player.hitbox.x,this.hitbox.y-player.hitbox.y)<500) {
            this.hitbox.translateVec((new Vector(player.hitbox.x-this.hitbox.x,player.hitbox.y-this.hitbox.y)).scale(3));
            this.shotTimer--;
            if (this.shotTimer<=0) {
                this.shotTimer=60;
                addEntity(new TestShot(this.hitbox.x,this.hitbox.y,getAngle(player.hitbox.x-this.hitbox.x,player.hitbox.y-this.hitbox.y)));
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
    constructor(x,y,theta) {
        super(x,y,5);
        this.d=new Vector(5*Math.cos(theta),5*Math.sin(theta));
    }
    
    update() {
        this.hitbox.translateVec(this.d);
        for (var i=0; i<walls.length; i++) {
            if (walls[i].circleEjectVector(this.hitbox)) {
                this.alive=false;
                break;
            }
        }
    }
    
    render(ctx,screen) {
        if (!screen.intersectsCircle(this.hitbox)){
            this.alive=false;
            return;
        }
        ctx.fillStyle="#f00";
        ctx.strokeStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }
}