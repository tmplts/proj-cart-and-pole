/// <reference path="./types/p5/global.d.ts" />
/// <reference path="./types/matter-js/index.d.ts" />

// matter-js
const { Engine, Composite, Constraint, Bodies, Body, Runner } = Matter;
const engine = Engine.create();

// constants
const WALL_THICKNESS = 50;
const CART_WIDTH = 75;
const CART_HEIGHT = 50;
const POLE_WIDTH = 20;
const POLE_HEIGHT = 100;
const MAX_SPEED = 0.025;
const WIND = true;

// world
let cart;
let pole;
let floor;

let img;

function setup() {
  // Setup p5
  createCanvas(1080, 1080);
  rectMode(CENTER);

  img = loadImage("sketch/img/AHHHHHH.png");

  // Create world
  floor = Bodies.rectangle(
    // Floor
    width / 2,
    height - WALL_THICKNESS / 2,
    width,
    WALL_THICKNESS,
    { isStatic: true }
  );

  // Create cart
  cart = Bodies.rectangle(
    width / 2,
    height - (WALL_THICKNESS + 10),
    CART_WIDTH,
    CART_HEIGHT,
    { mass: 10, restitution: 0 }
  );
  pole = Bodies.circle(
    cart.position.x,
    cart.position.y - POLE_HEIGHT,
    POLE_WIDTH / 2
  );

  setTimeout(() => console.log(cart.position), 20);

  // Add objects to world
  Composite.add(engine.world, cart);
  Composite.add(engine.world, pole);
  Composite.add(engine.world, floor);

  const constraint = Constraint.create({
    bodyA: cart,
    bodyB: pole,
    length: POLE_HEIGHT,
    stiffness: 1,
  });

  Composite.add(engine.world, constraint);
}

function draw() {
  Engine.update(engine, deltaTime);

  noStroke();
  background(220);

  // cart
  fill("green");
  push();
  translate(cart.position.x, cart.position.y);
  rotate(cart.angle);
  rect(0, 0, CART_WIDTH, CART_HEIGHT);
  pop();

  // pole
  fill("orange");
  stroke("orange");
  strokeWeight(POLE_WIDTH);
  line(cart.position.x, cart.position.y, pole.position.x, pole.position.y);
  noStroke();

  push();
  translate(pole.position.x, pole.position.y);
  rotate(pole.angle);
  circle(0, 0, POLE_WIDTH);
  pop();

  // world
  fill("grey");
  rect(floor.position.x, floor.position.y, width, WALL_THICKNESS);

  // Create a vector for determining angle
  arm = createVector();
  arm.x = pole.position.x - cart.position.x;
  arm.y = pole.position.y - cart.position.y;

  // Apply pid
  fill("red");
  let calc = Math.max(
    Math.min(pid(arm.heading(), pole.position.x), MAX_SPEED),
    -MAX_SPEED
  ) || 0;

  Body.applyForce(cart, cart.position, {
    x: calc,
    y: 0,
  });

  fill("black");
  text("movement", cart.position.x + 3, cart.position.y - 5);
  fill("yellow");
  circle(cart.position.x, cart.position.y, 5);
  circle(
    cart.position.x + calc * 1000,
    cart.position.y,
    10
  );

  if (WIND) {
    // Apply light "wind" to pole
    Body.applyForce(pole, pole.position, {
      x: (noise(millis() / 1000) - 0.5) / 100000,
      y: 0,
    });
  
    
    fill("black");
    text("wind", pole.position.x + 3, pole.position.y - 3);
    fill("lightblue");
    circle(pole.position.x, pole.position.y, 5);
    circle(
      pole.position.x + (noise(millis() / 1000) - 0.5)*100,
      pole.position.y,
      10
    );
  }

  if (degrees(arm.heading()) > 0) {
    push();
    translate(cart.position.x, cart.position.y - 200)
    rotate(random())
    image(img, -250, -250, 500, 500);
    pop();
  }

  // Reset cart
  if (keyIsDown(ENTER)) {
    Body.setPosition(cart, { x: width / 2, y: height - CART_HEIGHT - 1 });
    Body.setVelocity(cart, { x: 0, y: 0 });
    Body.setPosition(pole, { x: width / 2, y: cart.position.y - POLE_HEIGHT });
    Body.setVelocity(pole, { x: 0, y: 0 });
  }
}
