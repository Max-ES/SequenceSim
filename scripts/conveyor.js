
class Conveyor {
    v = 1
    c = color(255)
    carriedObjectsCount = 0

    constructor(begin, end) {
        this.begin = begin
        this.end = end
    }

    render() {
        stroke(this.c)
        strokeWeight(3)
        line(this.begin.x, this.begin.y, this.end.x, this.end.y)
    }

    process() {
        this.carriedObjectsCount = 0
    }
}

class Oven extends Conveyor {
    constructor(begin, end) {
        super(begin, end);
        this.c = color("#912424")
    }
}
