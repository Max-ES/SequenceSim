
class Part {
    /**
     *
     * @type {Carrier}
     */
    carrier = undefined
    ovenTime = 0
    maxOvenTime = 5
    minOvenTime = 1

    constructor(x = 0, y = 0, r = 30) {
        this.x = x
        this.y = y
        this.r = r
    }

    render() {
        let c = color("#646060")
        if (this.ovenTime > this.minOvenTime) c = color("#568151")
        if (this.ovenTime > this.maxOvenTime) c = color("#914848")
        fill(c)
        noStroke()
        ellipse(this.x, this.y, this.r, this.r)

        if (this.ovenTime) {
            fill(255)
            textAlign(CENTER, CENTER)
            textStyle(BOLD)
            text(Math.floor(this.ovenTime), this.x, this.y)
        }
    }

    process() {
        if (this.carrier) {
            this.carrier.carriedObject = this
            this.x = this.carrier.x
            this.y = this.carrier.y
            // check if carrier is in oven -> inc oven timer
            if (this.carrier.currentConveyor instanceof Oven) {
                this.ovenTime += 1/FRAME_RATE
            }
        }
    }

    isHeated() {
        return this.ovenTime > this.minOvenTime
    }

    pos() {
        return createVector(this.x, this.y)
    }

    setCarrier(newCarrier) {
        if(this.carrier) this.carrier.removeCarriedObject()
        this.carrier = newCarrier
    }
}

