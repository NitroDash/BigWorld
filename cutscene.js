var cutscene={};
cutscene.active=false;
cutscene.queue=[];

cutscene.update=function() {
    if (this.queue.length>0) {
        this.queue[0].update();
        if (this.queue[0].done) {
            this.queue.splice(0,1);
            if (this.queue.length==0) {
                this.active=false;
            }
        }
    } else {
        this.active=false;
    }
}

cutscene.render=function(ctx) {
    if (this.queue.length>0) {
        this.queue[0].render(ctx);
    }
}

class CutscenePart {
    constructor() {
        this.done=false;
    }
    update() {}
    render(ctx) {}
}

class Dialog extends CutscenePart {
    constructor(text,x,y) {
        super();
        this.text=text;
        this.x=x;
        this.y=y;
        this.index=0;
    }
    
    update() {
        if (keys[4].isPressed) {
            this.index++;
            if (this.index>=this.text.dialog.length) {
                this.done=true;
            }
        }
    }
    
    render(ctx) {
        drawSpeechBox(this.text.dialog[this.index],this.x,this.y);
    }
}

class CameraGlide extends CutscenePart {
    constructor(x1,y1,x2,y2,speed) {
        super();
        this.x=x2;
        this.y=y2;
        this.d=new Vector(x2-x1,y2-y1);
        this.counter=Math.ceil(this.d.mag()/speed);
        this.d=this.d.scale(speed);
    }
    
    update() {
        camera.x+=this.d.x;
        camera.y+=this.d.y;
        if (--this.counter<=0) {
            camera.x=this.x;
            camera.y=this.y;
            this.done=true;
        }
    }
}

cutscene.addDialog=function(text,x,y) {
    this.queue.push(new CameraGlide(camera.x,camera.y,x,y,2));
    this.queue.push(new Dialog(text,x,y));
    this.queue.push(new CameraGlide(x,y,camera.x,camera.y,2));
    this.active=true;
}