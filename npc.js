class Path {
    constructor(owner) {
        this.d=new Vector(0,0);
        this.owner=owner;
    }
    update() {}
    translate(x,y) {}
}

class RadiusWander extends Path {
    constructor(x,y,r,owner) {
        super(owner);
        this.x=x;
        this.y=y;
        this.r=r;
        this.pickPath();
    }
    
    pickPath() {
        var radius=Math.random()*this.r;
        var theta=Math.random()*Math.PI*2;
        this.d.x=radius*Math.cos(theta)+this.x-this.owner.hitbox.x;
        this.d.y=radius*Math.sin(theta)+this.y-this.owner.hitbox.y;
        this.counter=Math.floor(this.d.mag()/3);
        this.d=this.d.mult(1/this.counter);
    }
    
    translate(x,y) {
        this.x+=x;
        this.y+=y;
    }
    
    update() {
        this.counter--;
        if (this.counter==0) {
            this.d.x=0;
            this.d.y=0;
        } else if (this.counter==-30) {
            this.pickPath();
        }
    }
}

var makePath=function(path,owner) {
    return new RadiusWander(x,y,150,owner)
}

class NPC extends Entity {
    constructor(x,y,z,data) {
        super(x,y,20,z,0);
        data=data||{};
        this.name=data.name||"???";
        this.path=data.path?makePath(data.path,this):new RadiusWander(x,y,150,this);
        this.dialog=data.dialog;
    }
    
    update() {
        this.path.update();
        this.hitbox.translateVec(this.path.d);
    }
    
    speak() {
        cutscene.addDialog(this.dialog,this.hitbox.x,this.hitbox.y-this.hitbox.r);
    }
}

var makeNPC=function(resp) {
    return new NPC(resp.pos.x,resp.pos.y,resp.pos.z,resp);
}