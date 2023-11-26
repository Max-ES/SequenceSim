
class Gate {
    begin
    end
    isOpen = false
    intersectingObj = undefined

    constructor(begin, end) {
        this.begin = begin
        this.end = end
    }

    render() {
        fill(255)
        stroke(this.isOpen ? "#5caf3a" : "#cc7373")
        strokeWeight(3)
        line(this.begin.x, this.begin.y, this.end.x, this.end.y)
    }

    process() {
        if (this.isOpen) {
            // close as soon as no part is intersecting anymore
            let intersectionExists = false
            for (const c of carriers) {
                if (lineIntersectsRect(this.begin, this.end, c.x, c.y, c.w, c.h)) {
                    intersectionExists = true
                    break
                }
            }
            if (!intersectionExists) {
                this.isOpen = false
                this.intersectingObj = undefined
            }
        }
    }

    open() {
        this.isOpen = true
    }
}