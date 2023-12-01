
class Timer {
    constructor(time, callback) {
        this.isRunning = true
        this.time = time
        this.lastTrigger = processCount
        this.callback = callback
        this.callback()
    }

    process() {
        if(!this.isRunning) return
        const passedSeconds = (processCount - this.lastTrigger) / FRAME_RATE
        if (passedSeconds >= this.time) {
            this.callback()
            this.lastTrigger = processCount
        }
    }
}