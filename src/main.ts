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

let ddon = PIXI.Sprite.from('ddon.bmp');

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
    if(name === 'main') standby.zIndex = 999;
    return standby;
}

let state: {
    [key: string]: {
        x: number,
        dead: boolean,
        velocity: number,
    }
} = {};

function addCharacter(name: string) {
    app.stage.getChildByName(name)?.removeFromParent();
    app.stage.addChild(createCharacter('stand', name, 140));
    state[name] = {
        dead: false,
        velocity: 0,
        x: 140,
    }
}

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


addCharacter('main');

const VELOCITY_FACTOR = 1.5;

let count = 0;

function updateCharacter(dt: number, name: string) {
    if(controlState === 'right') {
        state[name].velocity += 0.2 * dt;
    }
    if(controlState === 'left') {
        state[name].velocity -= 0.2 * dt;
    }
    if(controlState === null) {
        state[name].velocity /= 1.05 * dt;
    }
    
    let currentPos = state[name].x;
    let velocity = state[name].velocity;
    currentPos += velocity;
    if(currentPos < WIDTH - 16) {
        if (currentPos < 4) {
            currentPos = 5;
            state[name].velocity = Math.abs(velocity) / (VELOCITY_FACTOR * dt);
        }
    } else {
        currentPos = WIDTH - 16;
        state[name].velocity = -Math.abs(velocity) / (VELOCITY_FACTOR * dt);
    }
    state[name].x = currentPos;
    app.stage.getChildByName(name)?.position.set(state[name].x, 398);
}

let ddonState: {
    velocity: number,
    sprite: PIXI.Sprite,
}[] = [];

function updateDdon(dt: number) {
    ddonState.forEach((d, i) => {
        d.sprite.y += d.velocity * dt * 0.02;
        d.velocity += 0.8 * dt;
        if(d.velocity < 100) d.velocity = 100
        if(d.sprite.y > HEIGHT) {
            d.sprite.destroy();
            ddonState.splice(i, 1);
        }
        if(ddonState.length < 7) addDdon();
    });
}

function addDdon() {
    let d = ddons.addChild(PIXI.Sprite.from(ddon.texture));
    d.x = Math.floor(Math.random() * WIDTH);
    d.y = -Math.floor(Math.random() * 1000) - 10;
    ddonState.push({
        sprite: d,
        velocity: 0,
    });
}

let ddons = app.stage.addChild(new PIXI.Container());
ddons.name = 'ddons';

function stop() {
    ddonState = [];
    ddons.destroy({children: true});
}

function start() {
    for(let i = 0; i < 7; i++) {
        addDdon();
    }
}


app.ticker.add((dt)=>{
    count += 1;
    updateCharacter(dt, 'main');
    updateDdon(dt);
})