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

class TravelPath extends Path {
    constructor(data,owner) {
        super(owner);
        this.data=data;
        this.length=this.data[this.data.length-1].end;
        this.section=0;
        for (var i=0; i<this.data.length; i++) {
            if (time%this.length<=this.data[i].end) {
                this.section=i;
                break;
            }
        }
    }
    
    update() {
        var t=time%this.length;
        if (t>=this.data[this.section].start&&t<this.data[this.section].end) {
            var dest=getPathPosition(t,this.data[this.section]);
            this.owner.hitbox.z=dest.z;
            this.d.x=dest.x-this.owner.hitbox.x;
            this.d.y=dest.y-this.owner.hitbox.y;
        } else {
            this.section++;
            this.section%=this.data.length;
            this.owner.hitbox.z=this.data[this.section].z;
        }
    }
}

var makePath=function(path,owner) {
    return new RadiusWander(x,y,150,owner)
}

class NPC extends Entity {
    constructor(x,y,z,data,realName) {
        super(x,y,20,z,0);
        this.realName=realName;
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
        cutscene.addDialog(this.getDialog(),this.hitbox.x,this.hitbox.y-this.hitbox.r);
    }
    
    getDialog() {
        for (var i=0; i<this.dialog.length; i++) {
            var works=true;
            if (this.dialog[i].plot) {
                if (plotCounters[this.dialog[i].plot.counter]<this.dialog[i].plot.value) {
                    works=false;
                }
            }
            if (this.dialog[i].time) {
                //Decide on syntax later
            }
            if (works) return this.dialog[i].text;
        }
        return [["Whoops. This debug text shouldn't be shown."]];
    }
}

var makeNPC=function(resp,name) {
    return new NPC(resp.pos.x,resp.pos.y,resp.pos.z,resp,name);
}

class TravelNPC extends NPC {
    constructor(path,pos,data,realName) {
        super(pos.x,pos.y,pos.z,data,realName);
        this.path=new TravelPath(path,this);
    }
    
    update() {
        super.update();
        if (!isLoaded(Math.floor(this.hitbox.x/1000),Math.floor(this.hitbox.y/1000),this.hitbox.z)) {
            this.alive=false;
        }
    }
}

var makeTravelNPC=function(resp,name,id) {
    return new TravelNPC(travelnpcs[id].path,getNPCPosition(id),resp,name);
}