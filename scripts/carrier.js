
class Carrier {
    x = 50
    y = 50
    w = 20
    h = 20
    currentConveyor = undefined
    carriedObject = undefined

    constructor(x = 50, y = 50, w = 30, h = 30) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.assignToClosestConveyor()
    }

    render() {
        fill(255)
        rectMode(CENTER)
        rect(this.x, this.y, this.w, this.h)
    }

    assignToClosestConveyor() {
        let intersectingConveyors = []
        for (let conveyor of conveyors) {
            if (this.isOnConveyor(conveyor)) intersectingConveyors.push(conveyor)
        }
        let conveyorsWithDists = intersectingConveyors.map(c => [c, dist(c.begin.x, c.begin.y, this.x, this.y)])
        conveyorsWithDists.sort((c, o) => c[1] - o[1])
        this.currentConveyor = conveyorsWithDists[0]?.[0]
    }

    intersectsWithClosedGate() {
        let closedGates = gates.filter(g => g.isOpen === false)
        for (let gate of closedGates) {
            if (lineIntersectsRect(gate.begin, gate.end, this.x, this.y, this.w, this.h)) {
                gate.intersectingObj = this
                return true
            }
        }
        return false
    }

    process() {
        if (this.currentConveyor && !this.isOnConveyor(this.currentConveyor)) {
            this.assignToClosestConveyor()
        }
        if (!this.currentConveyor) return
        this.currentConveyor.carriedObjectsCount ++
        if (this.intersectsWithClosedGate()) return

        let conveyor = this.currentConveyor
        // Check if the carrier is on the conveyor
        let conveyorDirection = p5.Vector.sub(conveyor.end, conveyor.begin).normalize();
        let velocity = conveyorDirection.mult(conveyor.v);
        let newX = this.x + velocity.x;
        let newY = this.y + velocity.y;
        // Move the carrier according to the conveyor's velocity
        let oldDist = dist(conveyor.end.x, conveyor.end.y, this.x, this.y)
        let newDist = dist(conveyor.end.x, conveyor.end.y, newX, newY)
        let isAtEndOfConveyor = newDist > oldDist
        if (isAtEndOfConveyor) {
            if (conveyorDirection.x !== 0) this.x = conveyor.end.x
            if (conveyorDirection.y !== 0) this.y = conveyor.end.y
            this.assignToClosestConveyor()
            return
        }
        // Move the carrier if no collision is detected
        let willCollide = this.checkCollision(newX, newY);
        if (!willCollide) {
            this.x = newX;
            this.y = newY;
        }

    }

    isOnConveyor(conveyor) {
        // Check if the carrier's position is within the range of the conveyor's begin and end points
        // This is a simplified version, and you might need a more complex collision detection
        return lineIntersectsRect(conveyor.begin, conveyor.end, this.x, this.y, this.w, this.h)
    }

    removeCarriedObject() {
        this.carriedObject = undefined
    }

    checkCollision(newX, newY) {
        for (let carrier of carriers) {
            if (carrier === this) continue
            let d = dist(newX, newY, carrier.x, carrier.y);
            const margin = CARRIER_COLLISION_MARGIN ?? 5
            let minDist = this.w / 2 + carrier.w / 2 + margin;
            if (d < minDist) {
                return true; // Collision detected
            }
        }
        return false; // No collision detected
    }
}