class Robot {
    r = 40
    v = 1
    base
    target = undefined
    debug = false

    _currentCommandStep = 0
    _commandCount = 0

    constructor(x, y) {
        this.end = createVector(x, y + 50)
        this.base = createVector(x, y)
    }

    render() {
        noStroke()
        fill("#b7772e")
        ellipse(this.base.x, this.base.y, this.r, this.r) // base

        strokeWeight(8)
        stroke(255)
        line(this.base.x, this.base.y, this.end.x, this.end.y)
        stroke("#b7772e")
        strokeWeight(5)
        line(this.base.x, this.base.y, this.end.x, this.end.y)
    }

    process() {
        if (this.target) {
            if (dist(this.end.x, this.end.y, this.target.x, this.target.y) < this.v) {
                this.end = this.target.copy()
                return
            }
            // Move one step in the direction of the target
            let dir = createVector(this.target.x - this.end.x, this.target.y - this.end.y);
            dir.normalize();
            dir.mult(this.v);
            this.end.x += dir.x;
            this.end.y += dir.y;
        }
    }

    timeToExecuteCommand() {
        this._commandCount++;
        return this._commandCount === this._currentCommandStep
    }

    beginCommands() {
        this._commandCount = -1
        if (this.debug) console.log(this._currentCommandStep)
    }

    endCommands() {
        const totalCommands = this._commandCount
        if (this._currentCommandStep > totalCommands) this._currentCommandStep = 0
    }

    waitFor(waitUntilThisFnReturnsTrue) {
        if (!this.timeToExecuteCommand()) return
        if (waitUntilThisFnReturnsTrue()) this._currentCommandStep++;
    }

    callFunction(fn) {
        if (!this.timeToExecuteCommand()) return
        fn()
        this._currentCommandStep++
    }

    isMoving() {
        return !!this.target
    }

    get x () {
        return this.end.x
    }

    get y () {
        return this.end.y
    }

    /**
     * sets the target and the speed v of the robot, so it reaches the goal
     * the specified amount of time
     * @param {p3.Vector} target
     * @param {number} time the time in seconds
     */
    moveTo(target, time) {
        if (!this.timeToExecuteCommand()) return
        const reachedTarget = this.end.equals(this.target)
        if (reachedTarget) {
            this.target = undefined
            this._currentCommandStep++
            return
        }
        if (this.target !== target) {
            this.target = target
            if (time !== undefined) {
                // Set v according to time
                let distance = dist(this.base.x, this.base.y, target.x, target.y);
                this.v = distance / (time * FRAME_RATE);
            }
        }
    }

    moveRelativeToBase(relativeTarget, time) {
        this.moveTo(p5.Vector.add(this.base, relativeTarget), time)
    }

    pickUp(obj) {
        if (!this.timeToExecuteCommand()) return
        obj.setCarrier(this)
        this._currentCommandStep++
    }

    removeCarriedObject() {
        this.carriedObject = undefined
    }

    put(obj){
        if (!this.timeToExecuteCommand()) return
        this.carriedObject.setCarrier(obj)
        this._currentCommandStep++
    }
}