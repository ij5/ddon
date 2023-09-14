import * as PIXI from 'pixi.js';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

let app = new PIXI.Application({
    width: 305, height: 421, antialias: false,
    view: canvas,
    background: '#ffffff',
});

if(window.innerWidth > window.innerHeight) {
    canvas.style.height = '100%';
} else {
    canvas.style.width = '100%';
}

let baseTexture = PIXI.BaseTexture.from('human.bmp');

let standbyArray = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(0, 0, 16, 23)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(16, 0, 16, 23)),
];

let standby = new PIXI.AnimatedSprite(standbyArray);
standby.animationSpeed = 0.2;
standby.play();
standby.x = 140;
standby.y = 398;

app.stage.addChild(standby)

app.ticker.add((dt)=>{
    
})