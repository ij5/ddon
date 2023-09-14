import * as PIXI from 'pixi.js';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

const WIDTH = 305;
const HEIGHT = 421;

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
let leftArray = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(0, 31, 16, 21)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(26, 30, 12, 24)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(51, 30, 10, 26)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(26, 30, 12, 24)),
];
let rightArray = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(0, 64, 10, 27)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(22, 64, 13, 24)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(44, 65, 17, 21)),
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(22, 64, 13, 24)),
];
let deadArray = [
    new PIXI.Texture(baseTexture, new PIXI.Rectangle(44, 0, 15, 25)),
];

function createCharacter(type: string, name: string, x: number) {
    let standby;
    if(type == 'standby') standby = new PIXI.AnimatedSprite(standbyArray);
    else if(type === 'left') standby = new PIXI.AnimatedSprite(leftArray);
    else if(type === 'right') standby = new PIXI.AnimatedSprite(rightArray);
    else if(type === 'dead') standby = new PIXI.AnimatedSprite(deadArray);
    else standby = new PIXI.AnimatedSprite(standbyArray);
    standby.animationSpeed = 0.25;
    standby.play();
    standby.x = x;
    standby.y = type === 'dead' ? 396 : 398;
    standby.name = name;
    return standby;
}

app.stage.getChildByName('main')?.removeFromParent();
app.stage.addChild(createCharacter('stand', 'main', 140));

let controlState: 'left' | 'right' | null = null;

window.addEventListener('keydown', (e) => {
    if(e.repeat) return;
    if(controlState !== 'left' && e.key === 'ArrowLeft') {
        controlState = 'left';
        app.stage.getChildByName('main')?.removeFromParent();
        app.stage.addChild(createCharacter('left', 'main', state['main'].x));
    }
    if(controlState !== 'right' && e.key === 'ArrowRight') {
        controlState = 'right';
        app.stage.getChildByName('main')?.removeFromParent();
        app.stage.addChild(createCharacter('right', 'main', state['main'].x));
    }
});

window.addEventListener('keyup', (e) => {
    if(e.repeat) return;
    if((e.key === 'ArrowLeft' && controlState === 'left') || (e.key === 'ArrowRight' && controlState === 'right')) {
        controlState = null;
        app.stage.getChildByName('main')?.removeFromParent();
        app.stage.addChild(createCharacter('standby', 'main', state['main'].x));
    }
});

let state: {
    [key: string]: {
        x: number,
        dead: boolean,
        velocity: number,
    }
} = {};

state['main'] = {
    dead: false,
    x: 140,
    velocity: 0,
}

const VELOCITY_FACTOR = 1.5;

let count = 0;

app.ticker.add((dt)=>{
    if(controlState === 'right') {
        state['main'].velocity += 0.3 * dt;
    }
    if(controlState === 'left') {
        state['main'].velocity -= 0.3 * dt;
    }
    if(controlState === null) {
        state['main'].velocity /= 1.1 * dt;
    }
    
    
    let currentPos = state['main'].x;
    let velocity = state['main'].velocity;
    currentPos += velocity;
    if(currentPos < WIDTH - 16) {
        if (currentPos < 4) {
            currentPos = 3;
            state['main'].velocity = Math.abs(velocity) / (VELOCITY_FACTOR * dt);
        }
    } else {
        currentPos = WIDTH - 16;
        state['main'].velocity = -Math.abs(velocity) / (VELOCITY_FACTOR * dt);
    }
    state['main'].x = currentPos;
    count += 1;
    app.stage.getChildByName('main')?.position.set(state['main'].x, 398);
})