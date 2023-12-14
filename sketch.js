let timers, conveyors, carriers, gates, machines, parts, robots

let gate, ovenGate, pickupGate, press, robot, robot2

upperLoopActive = true
lowerLoopActive = true
lastLoop = 0 //0 is upper loop 1 is lower loop

const CARRIER_WIDTH = 30
const CARRIER_COUNT = 11
const CARRIER_COLLISION_MARGIN = 5

let MIN_OVEN_TIME = 310
let MAX_OVEN_TIME = 560
let MAX_COOLING_TIME = 16
const OVEN_CARRIER_CAPACITY = 10
let spawnTimer0, spawnTimer1

let robotTimeNeutralBand = 1
let robotTimeBandPart = 1
let robotTimePartPresse = 4
let robotTimeInsertPresse = 1
let robotTimePresseNeutral = 4
let robotTimePartTrash = 4
let robotTimePresseTrash = 4
let robotTimeTrashNeutral = 4

let robotWaitOffsetTillPressFinishes = 2

let pressTime = 6

const FRAME_RATE = 60
let processCount = 0

let trashCount = 0

let speedUp = 4

let selectLoopStep, lowerLoopStartStep, upperLoopStartStep, discardStepFromPresse, discardStepFromBand, discardStep2

function setup() {
    createCanvas(700, 300);
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
    press = new Machine(margin + l + 90, margin + h + loopMargin / 2, 35, 35, "Presse")
    press.processedTime = pressTime
    machines = [press]
    spawnTimer0 = new Timer(1, () => addPartToCarrierOpenGate(gate, oven))
    spawnTimer1 = new Timer(5, () => addPartToCarrierOpenGate(gate2, oven2))
    timers = [spawnTimer0, spawnTimer1]

    robot = new Robot(margin + l + 40, margin + h + loopMargin / 2)
    robot2 = new Robot(margin + l + 140, margin + h + loopMargin / 2)
    robots = [robot, robot2]

    addInput("Zeitraffer", null, speedUp, (e) => speedUp = e.target.value)
    addInput("minimale Ofenzeit", "s", MIN_OVEN_TIME, (e) => MIN_OVEN_TIME = e.target.value)
    addInput("maximale Ofenzeit", "s", MAX_OVEN_TIME, (e) => MAX_OVEN_TIME = e.target.value)
    addInput("maximale Abkühlzeit", "s", MAX_COOLING_TIME, (e) => MAX_COOLING_TIME = e.target.value)
    addToggle("Presse aktiv", true, (c) => press.isBlocked = !c)
    addInput("Zeit Presse", "s", pressTime, (e) => press.processingTime = e.target.value)
    addToggle("Band 1 einlegen", true, (c) => spawnTimer0.isRunning = c)
    addToggle("Band 1 anfahren", true, (c) => upperLoopActive = c)
    addInput("Band 1 Teil einlegen aller", "s", spawnTimer0.time, (e) => spawnTimer0.time = e.target.value)
    addToggle("Band 2 einlegen", true, (c) => spawnTimer1.isRunning = c)
    addToggle("Band 2 anfahren", true, (c) => lowerLoopActive = c)
    addInput("Band 2 Teil einlegen aller", "s", spawnTimer1.time, (e) => spawnTimer1.time = e.target.value)

    addInput("Roboter Offset (vor Presse fertig)", "s", robotWaitOffsetTillPressFinishes, (e) => robotWaitOffsetTillPressFinishes = e.target.value, "robot-gui")
    addInput("Roboter Neutral --> Band", "s", robotTimeNeutralBand, (e) => robotTimeNeutralBand = e.target.value, "robot-gui")
    addInput("Roboter Band --> Teil", "s", robotTimeBandPart, (e) => robotTimeBandPart = e.target.value, "robot-gui")
    addInput("Roboter Teil --> Presse", "s", robotTimePartPresse, (e) => robotTimePartPresse = e.target.value, "robot-gui")
    addInput("Roboter Presse einlegen", "s", robotTimeInsertPresse, (e) => robotTimeInsertPresse = e.target.value, "robot-gui")
    addInput("Roboter Presse --> Neutral", "s", robotTimePresseNeutral, (e) => robotTimePresseNeutral = e.target.value, "robot-gui")
    addInput("Roboter Teil (vom Band) --> Müll", "s", robotTimePartTrash, (e) => robotTimePartTrash = e.target.value, "robot-gui")
    addInput("Roboter Presse --> Müll", "s", robotTimePresseTrash, (e) => robotTimePresseTrash = e.target.value, "robot-gui")
    addInput("Roboter Müll --> Neutral", "s", robotTimeTrashNeutral, (e) => robotTimeTrashNeutral = e.target.value, "robot-gui")
}

function allObjects() {
    return [...timers, ...conveyors, ...machines, ...carriers, ...parts, ...gates, ...robots]

}

function draw() {
    for (const part of parts) {
        part.minOvenTime = MIN_OVEN_TIME
        part.maxOvenTime = MAX_OVEN_TIME
        part.maxCoolingTime = MAX_COOLING_TIME
    }

    background(50);

    render(allObjects());
    addText(Math.floor(processCount / FRAME_RATE), 30, 10)
    addText(Math.floor(frameRate()), width-20, 10, 90)
    if (trashCount > 0) addText(trashCount, press.x, press.y - 75)
    for (let i = 0; i < speedUp; i++) {
        process(allObjects())
    }
}

function moveRobots() {
    robot.beginCommands()
    //first loop
    upperLoopStartStep = robot.waitFor(() => {
        return ovenGate.intersectingObj?.carriedObject?.isHeated()
            && !pickupGate.intersectingObj
            && press.timeUntilFinished <= robotWaitOffsetTillPressFinishes
            && !press.isBlocked
    })
    robot.callFunction(() => ovenGate.open())
    robot.moveTo(pickupGate.begin, robotTimeNeutralBand)
    robot.moveTo(pickupGate.intersectingObj?.carriedObject?.pos(), robotTimeBandPart)
    robot.pickUp(pickupGate.intersectingObj?.carriedObject)
    robot.callFunction(() => pickupGate.open())
    robot.callFunction(() => {
        // if part was in the oven too long -> discard it (throw it to the side of the press)
        if (robot.carriedObject?.ovenTime > robot.carriedObject?.maxOvenTime) {
            robot.forceStep(discardStepFromBand)
        }
    })
    robot.moveTo(createVector(press.x - 20, press.y), robotTimePartPresse)
    robot.callFunction(() => {
        // if part was in the oven too long -> discard it (throw it to the side of the press)
        if (robot.carriedObject?.coolingTime > robot.carriedObject?.maxCoolingTime) {
            robot.forceStep(discardStepFromPresse)
        }
    })
    robot.moveTo(createVector(press.x, press.y), robotTimeInsertPresse)
    robot.put(press)
    robot.callFunction(() => press.startProcessing())
    robot.moveRelativeToBase(createVector(-40, 0), robotTimePresseNeutral)

    robot.setStep(selectLoopStep)

    //2nd loop
    lowerLoopStartStep = robot.waitFor(() =>
        ovenGate2.intersectingObj?.carriedObject?.isHeated()
        && !pickupGate2.intersectingObj
        && press.timeUntilFinished <= robotWaitOffsetTillPressFinishes
        && !press.isBlocked)
    robot.callFunction(() => ovenGate2.open())
    robot.moveTo(pickupGate2.begin, robotTimeNeutralBand)
    robot.moveTo(pickupGate2.intersectingObj?.carriedObject?.pos(), robotTimeBandPart)
    robot.pickUp(pickupGate2.intersectingObj?.carriedObject)
    robot.callFunction(() => pickupGate2.open())
    robot.callFunction(() => {
        // if part was in the oven too long -> discard it (throw it to the side of the press)
        if (robot.carriedObject?.ovenTime > robot.carriedObject?.maxOvenTime) {
            robot.forceStep(discardStepFromBand)
        }
    })
    robot.moveTo(createVector(press.x - 20, press.y), robotTimePartPresse)
    robot.callFunction(() => {
        // if part was in the oven too long -> discard it (throw it to the side of the press)
        if (robot.carriedObject?.coolingTime > robot.carriedObject?.maxCoolingTime) {
            robot.forceStep(discardStepFromPresse)
        }
    })
    robot.moveTo(createVector(press.x, press.y), robotTimeInsertPresse)
    robot.put(press)
    robot.callFunction(() => press.startProcessing())
    robot.moveRelativeToBase(createVector(-40, 0), robotTimePresseNeutral)
    robot.setStep(selectLoopStep)

    //discard part steps
    discardStepFromPresse = robot.moveTo(createVector(press.x, press.y - 50), robotTimePresseTrash)
    robot.setStep(discardStep2)
    discardStepFromBand = robot.moveTo(createVector(press.x, press.y - 50), robotTimePartTrash)
    discardStep2 = robot.callFunction(() => trashCount++)
    robot.put()
    robot.moveRelativeToBase(createVector(-40, 0), robotTimeTrashNeutral)

    // select which loop should be entered (upper or lower one)
    selectLoopStep = robot.waitFor(() => upperLoopActive || lowerLoopActive)
    robot.callFunction(() => {
        let nextStep = undefined
        if (!upperLoopActive || !lowerLoopActive) {
            nextStep = upperLoopActive ? upperLoopStartStep : lowerLoopStartStep
        } else {
            nextStep = lastLoop === 0 ? lowerLoopStartStep : upperLoopStartStep
        }
        lastLoop = nextStep === upperLoopStartStep ? 0 : 1
        robot.forceStep(nextStep)
    })
    robot.endCommands()

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
}


function render(objects) {
    for (let obj of objects) {
        if (obj.render) obj.render()
    }
}

function process(objects) {
    moveRobots()
    for (let obj of objects) {
        if (obj.process) obj.process()
    }
    processCount++;
}





