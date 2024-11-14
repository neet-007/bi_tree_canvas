import { Node } from "../types";

const NODE_SIZE = 15;
const ANGLE = 30 * (Math.PI / 180);
const LINE_HYPOTENUSE = 90;

export function draw(centerX: number, centerY: number, leftAngle: number, rightAngle: number,
    lengthLeft: number, lengthRight: number, val: number, drawLeft: boolean, drawRight: boolean,
    context: CanvasRenderingContext2D): [number[], number[]] {
    let offsetX1 = 0;
    let offsetY1 = 0;
    let offsetX2 = 0;
    let offsetY2 = 0

    offsetX1 = lengthRight * Math.sin(rightAngle);
    offsetY1 = lengthRight * Math.cos(rightAngle);

    if (drawLeft) {
        const path1 = new Path2D();
        path1.moveTo(centerX, centerY);
        path1.lineTo(centerX + offsetX1, centerY + offsetY1);
        context.stroke(path1);
    }

    offsetX2 = lengthLeft * Math.sin(-leftAngle);
    offsetY2 = lengthLeft * Math.cos(-leftAngle);

    if (drawRight) {
        const path2 = new Path2D();
        path2.moveTo(centerX, centerY);
        path2.lineTo(centerX + offsetX2, centerY + offsetY2);
        context.stroke(path2);
    }

    context.beginPath();
    context.arc(centerX, centerY, NODE_SIZE, 0, 2 * Math.PI);
    context.fillStyle = "white";
    context.fill();
    context.stroke();

    context.font = "20px serif";
    const metrics = context.measureText("1");
    const textHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    const width = (metrics.width / 2) + (`${val}`.length) * 3;
    const height = (textHeight / 2) - (`${val}`.length) * 3;
    context.strokeText(`${val}`, centerX - width, centerY + height);

    return [
        [centerX + offsetX1, centerY + offsetY1],
        [centerX + offsetX2, centerY + offsetY2],
    ]
}

function easeOutElastic(t: number) {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

function animateCirclePop(
    centerX: number,
    centerY: number,
    startTime: number,
    duration: number,
    overshoot: number,
    targetRadius: number,
    context: CanvasRenderingContext2D,
    onComplete: () => void,

) {

    const canvas = context.canvas;
    const originalContent = context.getImageData(0, 0, canvas.width, canvas.height);
    function animate(time: number) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const scale = overshoot - (overshoot - 1) * easeOutElastic(progress);
        const currentRadius = targetRadius * scale;

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.putImageData(originalContent, 0, 0);

        context.save();
        context.beginPath();
        context.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        context.fillStyle = "blue";
        context.fill();

        context.restore();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.putImageData(originalContent, 0, 0);
            onComplete();
        }
    }

    requestAnimationFrame(animate);
}

function animateLine(
    startX: number,
    startY: number,
    length: number,
    angle: number,
    progress: number,
    speed: number,
    dir: "l" | "r",
    context: CanvasRenderingContext2D,
    onComplete: () => void,
) {
    let endX = -1;
    let endY = -1;
    if (dir === "l") {
        endX = startX + length * Math.sin(-angle);
        endY = startY + length * Math.cos(-angle);
    } else {
        endX = startX + length * Math.sin(angle);
        endY = startY + length * Math.cos(angle);
    }

    const canvas = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    function drawPartialLine() {
        context.save();

        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(currentX, currentY);
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.stroke();

        context.restore();
        progress += speed;

        if (progress <= 1) {
            requestAnimationFrame(drawPartialLine);
        } else {
            context.putImageData(canvas, 0, 0);
            onComplete();
        }
    }

    drawPartialLine();
}

function animateLineCurve(
    centerX: number,
    centerY: number,
    startAngle: number,
    finalAngle: number,
    speed: number,
    dir: "l" | "r",
    context: CanvasRenderingContext2D,
    onComplete: () => void,
) {
    const canvas = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    function drawPartialLine(angle: number) {
        context.putImageData(canvas, 0, 0);

        let currentX = -1;
        let currentY = -1;
        if (dir === "l") {
            console.log("l", dir);
            currentX = centerX + (LINE_HYPOTENUSE * Math.sin(-angle));
            currentY = centerY + (LINE_HYPOTENUSE * Math.cos(-angle));
        } else {
            console.log("r", dir);
            currentX = centerX + (LINE_HYPOTENUSE * Math.sin(angle));
            currentY = centerY + (LINE_HYPOTENUSE * Math.cos(angle));
        }

        const path = new Path2D();
        path.moveTo(centerX, centerY);
        path.lineTo(currentX, currentY);
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.stroke(path);

        context.beginPath();
        context.arc(currentX, currentY, NODE_SIZE, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        angle -= speed;

        if (angle >= finalAngle) {
            requestAnimationFrame(() => drawPartialLine(angle));
        } else {
            onComplete();
        }
    }

    drawPartialLine(startAngle);
}

export function drawTree(root: number, width: number, height: number, arr: Node[], context: CanvasRenderingContext2D): [any[], {
    val: number;
    index: number;
    centerX: number;
    centerY: number;
}] {
    const queue = [{
        val: arr[root].val,
        index: root,
        centerX: width / 2,
        centerY: NODE_SIZE,
    }];

    const animateArr = [];
    let newAdded = {
        val: -1,
        index: -1,
        centerX: -1,
        centerY: -1,
        prevCenterX: -1,
        prevCenterY: -1,
        dir: "l",
    };
    context.clearRect(0, 0, width, height);
    let next = 0;

    while (queue.length > 0) {
        const curr = queue.shift()!;

        let leftAngle = ANGLE;
        if (arr[curr.index].left !== -1 && arr[arr[curr.index].left].right !== -1) {
            leftAngle *= 2.7;
        }
        let rightAngle = ANGLE;
        if (arr[curr.index].right !== -1 && arr[arr[curr.index].right].left !== -1) {
            rightAngle *= 2.7;
        }

        let leftLength = -1;
        const drawLeft = arr[curr.index].left !== -1;
        if (drawLeft) {
            leftLength = LINE_HYPOTENUSE + (LINE_HYPOTENUSE * ((1 / (arr[curr.index].depth + 1)) * (arr[arr[curr.index].left].rightTreeSize * (50 / 100))));
        }

        let rightLength = -1;
        const drawRight = arr[curr.index].right !== -1;
        if (drawRight) {
            rightLength = LINE_HYPOTENUSE + (LINE_HYPOTENUSE * ((1 / (arr[curr.index].depth + 1)) * (arr[arr[curr.index].right].leftTreeSize * (50 / 100))));
        }

        const [right, left] = draw(curr.centerX, curr.centerY,
            leftAngle,
            rightAngle,
            leftLength,
            rightLength,
            curr.val,
            drawLeft,
            drawRight,
            context);

        if (arr[curr.index].left !== -1) {
            if (arr[curr.index].left === arr.length - 1) {
                newAdded = {
                    val: arr[arr[curr.index].left].val,
                    index: arr[curr.index].left,
                    centerX: left[0] - 50,
                    centerY: left[1] - 50,
                    prevCenterX: curr.centerX,
                    prevCenterY: curr.centerY,
                    dir: "l",
                };
            } else {
                queue.push({
                    val: arr[arr[curr.index].left].val,
                    index: arr[curr.index].left,
                    centerX: left[0],
                    centerY: left[1],
                });
            }
        }
        if (arr[curr.index].right !== -1) {
            if (arr[curr.index].right === arr.length - 1) {
                newAdded = {
                    val: arr[arr[curr.index].right].val,
                    index: arr[curr.index].right,
                    centerX: right[0] + 50,
                    centerY: right[1] - 50,
                    prevCenterX: curr.centerX,
                    prevCenterY: curr.centerY,
                    dir: "r",
                };
            } else {
                queue.push({
                    val: arr[arr[curr.index].right].val,
                    index: arr[curr.index].right,
                    centerX: right[0],
                    centerY: right[1],
                });
            }
        }

        if (next === curr.index) {
            animateArr.push({
                centerX: curr.centerX,
                centerY: curr.centerY,
                leftAngle,
                rightAngle,
                leftLength,
                rightLength,
                speed: 0.1,
            });
            next = arr[curr.index].next;
        }
    }

    return [animateArr, newAdded]
}

export function startAnimations(newAdded: { val: number; index: number; centerX: number; centerY: number, prevCenterX: number, prevCenterY: number, dir: "l" | "r" },
    animations: any[], context: CanvasRenderingContext2D) {
    let currentIndex = 0;

    function nextAnimation() {
        if (currentIndex < animations.length) {
            const { centerX, centerY, speed, leftAngle, rightAngle, leftLength, rightLength, } = animations[currentIndex];
            animateCirclePop(centerX, centerY, performance.now(), 2000, 1.5, NODE_SIZE, context, () => {
                currentIndex++;
                nextAnimation();
            });
        } else if (newAdded.val !== -1) {
            animateCirclePop(newAdded.centerX, newAdded.centerY, performance.now(), 2000, 1.5, NODE_SIZE, context, () => {
                animateLine(newAdded.prevCenterX, newAdded.prevCenterY, LINE_HYPOTENUSE, ANGLE * 2.7, 0, 0.01, newAdded.dir, context, () => {
                    animateLineCurve(newAdded.prevCenterX, newAdded.prevCenterY, ANGLE * 2.7, ANGLE, 0.01, newAdded.dir, context, () => { });
                })
            });
        }
    }

    nextAnimation();
}
