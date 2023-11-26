class Machine {
    processingTime = 2
    isProcessing = false
    processedTime = 0

    carriedObject = undefined
    processedCarriedObject = false
    constructor(x, y, w, h, name="machine") {
        this.x = x
        this.y = y
        this.h = h
        this.w = w
        this.name = name
    }

    render() {
        textAlign(CENTER, CENTER)
        fill(this.isProcessing ? color(255) : color(0, 0))
        rect(this.x, this.y, this.w, this.h)
        noStroke()
        fill(255)
        textStyle(BOLD)
        let txt = this.name
        if (this.isProcessing) {
            txt += ` ${Math.floor(this.processedTime)}/${this.processingTime} s`
        }
        text(txt, this.x, this.y - this.h / 2 - 10)
    }

    startProcessing() {
        console.log("processing started")
        this.isProcessing = true
    }

    removeCarriedObject() {
        this.carriedObject = undefined
        this.processedCarriedObject = false
    }

    process() {
        if (!this.isProcessing) return

        this.processedTime += 1 / FRAME_RATE
        if (this.processedTime >= this.processingTime) {
            this.isProcessing = false
            this.processedCarriedObject = true
            this.processedTime = 0
        }
    }
}