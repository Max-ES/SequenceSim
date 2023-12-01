
/**
 *
 * @param {Gate} gate
 * @param {Oven} oven
 */
function addPartToCarrierOpenGate(gate, oven) {
    if (oven.carriedObjectsCount >= OVEN_CARRIER_CAPACITY) return
    if (gate.intersectingObj) {
        const carrier = gate.intersectingObj
        const part = new Part(-100, -100)
        part.carrier = carrier
        parts.push(part)
    }
    gate.isOpen = true;
}

function addText(txt, x, y, color = 255) {
    noStroke()
    fill(color)
    text(txt, x, y)
}

function linesIntersect(begin0, end0, begin1, end1) {
    // Calculate the direction of the lines
    let dir0 = p5.Vector.sub(end0, begin0);
    let dir1 = p5.Vector.sub(end1, begin1);

    // Solve for t0 and t1
    let denom = dir0.x * dir1.y - dir0.y * dir1.x;
    if (denom === 0) return false; // Lines are parallel

    let diff = p5.Vector.sub(begin1, begin0);
    let t0 = (diff.x * dir1.y - diff.y * dir1.x) / denom;
    let t1 = (diff.x * dir0.y - diff.y * dir0.x) / denom;

    // Check if the scalar t0 and t1 are within the range [0, 1] to determine if the lines intersect
    return t0 >= 0 && t0 <= 1 && t1 >= 0 && t1 <= 1;
}

function lineIntersectsRect(begin, end, centerX, centerY, width, height) {
    // Calculate the half-width and half-height of the rectangle
    let halfWidth = width / 2;
    let halfHeight = height / 2;

    // Define the rectangle's edges
    let left = centerX - halfWidth;
    let right = centerX + halfWidth;
    let top = centerY - halfHeight;
    let bottom = centerY + halfHeight;

    // Check if the line is inside the rectangle
    if (begin.x > left && begin.x < right && begin.y > top && begin.y < bottom &&
        end.x > left && end.x < right && end.y > top && end.y < bottom) {
        return true;
    }

    // Check if the line intersects with any of the rectangle's sides
    // We use the linesIntersect function from the previous example for this purpose
    if (linesIntersect(begin, end, createVector(left, top), createVector(right, top)) ||
        linesIntersect(begin, end, createVector(right, top), createVector(right, bottom)) ||
        linesIntersect(begin, end, createVector(right, bottom), createVector(left, bottom)) ||
        linesIntersect(begin, end, createVector(left, bottom), createVector(left, top))) {
        return true;
    }

    return false;
}