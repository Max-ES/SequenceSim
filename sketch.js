let timers, conveyors, carriers, gates, machines, parts, robots

let gate, ovenGate, pickupGate, press, robot, robot2

const CARRIER_WIDTH = 30
const CARRIER_COUNT = 11
const CARRIER_COLLISION_MARGIN = 5

let MIN_OVEN_TIME = 10
let MAX_OVEN_TIME = 60
const OVEN_CARRIER_CAPACITY = 10

const FRAME_RATE = 60
let processCount = 0

function setup() {
    createCanvas(800, 500);
    frameRate(FRAME_RATE);
    let h = 50
    let margin = 50
    let ovenMargin = 30
    let l = (OVEN_CARRIER_CAPACITY * (CARRIER_WIDTH + CARRIER_COLLISION_MARGIN)) + 2 * ovenMargin + 10
    let loopStart = createVector(margin, margin + h)

    let loopMargin = 50
    let loop2Start = createVector(margin, margin + h + loopMargin)

    let oven = new Oven(createVector(margin + ovenMargin, margin + h), createVector(margin + l - ovenMargin, margin + h))
    let oven2 = new Oven(createVector(margin + ovenMargin, margin + h + loopMargin), createVector(margin + l - ovenMargin, margin + h + loopMargin))
    conveyors = [
        new Conveyor(loopStart, createVector(margin + ovenMargin, margin + h)),
        oven,
        new Conveyor(createVector(margin + l - ovenMargin, margin + h), createVector(margin + l, margin + h)),
        new Conveyor(createVector(margin + l, margin + h), createVector(margin + l, margin)),
        new Conveyor(createVector(margin + l, margin), createVector(margin, margin)),
        new Conveyor(createVector(margin, margin), loopStart),

        new Conveyor(loop2Start, createVector(margin + ovenMargin, margin + h + loopMargin)),
        oven2,
        new Conveyor(createVector(margin + l - ovenMargin, margin + h + loopMargin), createVector(margin + l, margin + h + loopMargin)),
        new Conveyor(createVector(margin + l, margin + h + loopMargin), createVector(margin + l, margin + h + loopMargin + h)),
        new Conveyor(createVector(margin + l, margin + h + loopMargin + h), createVector(margin, margin + h + loopMargin + h)),
        new Conveyor(createVector(margin, margin + h + loopMargin + h), loop2Start),
    ]
    carriers = []
    for (let i = 0; i <= CARRIER_COUNT; i++) {
        carriers.push(new Carrier(loopStart.x + (CARRIER_WIDTH + 5) * i, loopStart.y + -50, CARRIER_WIDTH, CARRIER_WIDTH))
        carriers.push(new Carrier(loopStart.x + (CARRIER_WIDTH + 5) * i, loop2Start.y + 50, CARRIER_WIDTH, CARRIER_WIDTH))
    }
    gate = new Gate(createVector(margin - 20, margin + h), loopStart)
    ovenGate = new Gate(createVector(margin + l - ovenMargin - 10, margin + h - 10), createVector(margin + l - ovenMargin - 10, margin + h + 10))
    pickupGate = new Gate(createVector(margin + l, margin + h), createVector(margin + l + 15, margin + h + 15))

    gate2 = new Gate(createVector(margin - 20, margin + h + loopMargin), loop2Start)
    ovenGate2 = new Gate(createVector(margin + l - ovenMargin - 10, margin + h - 10 + loopMargin), createVector(margin + l - ovenMargin - 10, margin + h + 10 + loopMargin))
    pickupGate2 = new Gate(createVector(margin + l, margin + h + loopMargin), createVector(margin + l + 15, margin + h - 15 + loopMargin))

    gates = [gate, ovenGate, pickupGate, gate2, ovenGate2, pickupGate2]
    parts = []
    press = new Machine(margin + l + 90, margin + h + loopMargin/ 2, 35, 35, "Presse")
    machines = [press]
    timers = [
        new Timer(5, () => addPartToCarrierOpenGate(gate, oven)),
        new Timer(5, () => addPartToCarrierOpenGate(gate2, oven2))]

    let button = createButton('open gate');
    button.position(0, 0);
    button.mousePressed(() => gate.open());

    let OvenButton = createButton('open oven gate');
    OvenButton.position(100, 0);
    OvenButton.mousePressed(() => ovenGate.open());

    let pickupGateButton = createButton('open pick up gate');
    pickupGateButton.position(250, 0);
    pickupGateButton.mousePressed(() => pickupGate.open());

    robot = new Robot(margin + l + 40, margin + h + loopMargin / 2)
    robot2 = new Robot(margin + l + 140, margin + h + loopMargin / 2)
    robots = [robot, robot2]

}

function allObjects() {
    return [...timers, ...conveyors, ...machines, ...carriers, ...parts, ...gates, ...robots]

}

function draw() {
    let nextPartFromUpper = true

    robot.beginCommands()
    robot.waitFor(() =>
        ovenGate.intersectingObj?.carriedObject?.isHeated()
        && !pickupGate.intersectingObj
        && !press.isProcessing)
    robot.callFunction(() => ovenGate.open())
    robot.moveTo(pickupGate.begin, 1)
    robot.moveTo(pickupGate.intersectingObj?.carriedObject?.pos())
    robot.pickUp(pickupGate.intersectingObj?.carriedObject)
    robot.callFunction(() => pickupGate.open())
    robot.moveTo(createVector(press.x, press.y))
    robot.put(press)
    robot.callFunction(() => press.startProcessing())
    robot.moveRelativeToBase(createVector(-40, 0))

    //2nd loop
    robot.waitFor(() =>
        ovenGate2.intersectingObj?.carriedObject?.isHeated()
        && !pickupGate.intersectingObj
        && !press.isProcessing)
    robot.callFunction(() => ovenGate2.open())
    robot.moveTo(pickupGate2.begin, 1)
    robot.moveTo(pickupGate2.intersectingObj?.carriedObject?.pos())
    robot.pickUp(pickupGate2.intersectingObj?.carriedObject)
    robot.callFunction(() => pickupGate2.open())
    robot.moveTo(createVector(press.x, press.y))
    robot.put(press)
    robot.callFunction(() => press.startProcessing())
    robot.moveRelativeToBase(createVector(-40, 0))
    robot.endCommands()

    robot2.debug = true
    robot2.beginCommands()
    robot2.waitFor(() =>
        press.processedCarriedObject)
    robot2.moveTo(press.carriedObject?.pos())
    robot2.pickUp(press.carriedObject)
    robot2.moveRelativeToBase(createVector(40, 0))
    robot2.callFunction(() => {
        parts = parts.filter((p) => p !== robot2.carriedObject)
    })
    robot2.endCommands()

    for (const part of parts) {
        part.minOvenTime = MIN_OVEN_TIME
        part.maxOvenTime = MAX_OVEN_TIME
    }


    background(50);
    render(allObjects());
    process(allObjects())
}


function render(objects) {
    for (let obj of objects) {
        if (obj.render) obj.render()
    }
}

function process(objects) {
    for (let obj of objects) {
        if (obj.process) obj.process()
    }
    processCount++;
}





