
class Timer {
    constructor(time, callback) {
        this.time = time
        this.lastTrigger = processCount
        this.callback = callback
        this.callback()
    }

    process() {
        const passedSeconds = (processCount - this.lastTrigger) / FRAME_RATE
        if (passedSeconds >= this.time) {
            this.callback()
            this.lastTrigger = processCount
        }
    }
}