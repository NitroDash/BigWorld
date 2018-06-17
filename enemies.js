class BasicEnemy extends Entity {
    constructor(x,y,z) {
        super(x,y,15,z,1);
        this.shotTimer=60;
        this.canBeHit=true;
        this.hp=3;
        this.justHit=false;
    }
    
    update() {
        if (dist(this.hitbox.x-player.hitbox.x,this.hitbox.y-player.hitbox.y)<500) {
            this.hitbox.translateVec((new Vector(player.hitbox.x-this.hitbox.x,player.hitbox.y-this.hitbox.y)).scale(3));
            this.shotTimer--;
            if (this.shotTimer<=0) {
                this.shotTimer=60;
                addEntity(new BasicShot(this.hitbox.x,this.hitbox.y,getAngle(player.hitbox.x-this.hitbox.x,player.hitbox.y-this.hitbox.y),this.hitbox.z,1,5,1));
            }
        }
        for (var i=0; i<walls.length; i++) {
            this.hitbox.translateVec(walls[i].circleEjectVector(this.hitbox));
        }
        this.checkForHit();
    }
    
    checkForHit() {
        for (var i=0; i<entities.length; i++) {
            if (entities[i].canHit&&entities[i].align!=this.align) {
                if (entities[i].hitbox.intersectsCircle(this.hitbox)) {
                    this.getHit(entities[i]);
                    entities[i].hit(this);
                    if (!this.alive) break;
                }
            }
        }
    }
    
    getHit(other) {
        this.hp--;
        if (this.hp<=0) {
            this.alive=false;
        }
        this.justHit=true;
    }
    
    render(ctx,screen) {
        if (this.justHit) {
            this.justHit=false;
            return;
        }
        if (!screen.intersectsCircle(this.hitbox)){return;}
        ctx.fillStyle="#f00";
        ctx.strokeStyle=black;
        ctx.beginPath();
        ctx.arc(this.hitbox.x,this.hitbox.y,this.hitbox.r,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }
}

class ShieldEnemy extends BasicEnemy {
    constructor(x,y,z) {
        super(x,y,z);
        this.shield=new PolygonWall([0,0,20,30,30,20],[25,-25,-5,-5,5,5],z,"#888");
        this.shield.translate(x,y);
        this.angle=Math.random()*Math.PI*2;
        this.shield.rotate(x,y,this.angle);
    }
    
    update() {
        if (dist(this.hitbox.x-player.hitbox.x,this.hitbox.y-player.hitbox.y)<500) {
            var angleDiff=getAngle(player.hitbox.x-this.hitbox.x,player.hitbox.y-this.hitbox.y)-this.angle;
            if (angleDiff>Math.PI) angleDiff-=2*Math.PI;
            if (angleDiff<-Math.PI) angleDiff+=2*Math.PI;
            if (angleDiff>0.02) angleDiff=0.02;
            if (angleDiff<-0.02) angleDiff=-0.02;
            this.angle+=angleDiff;
            this.shield.rotate(this.hitbox.x,this.hitbox.y,angleDiff);
            this.shotTimer--;
            if (this.shotTimer<=0) {
                this.shotTimer=60;
                var shot=new BasicShot(this.hitbox.x,this.hitbox.y,this.angle,this.hitbox.z,1,5,1);
                shot.hitbox.translateVec(shot.d.scale(40));
                addEntity(shot);
            }
        }
        this.checkForHit();
    }
    
    getHit(other) {
        super.getHit(other);
        if (!this.alive) {
            this.shield.alive=false;
        }
    }
}