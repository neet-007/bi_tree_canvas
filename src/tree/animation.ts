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

    let leftLine = {
        x: -1,
        y: -1
    }
    if (drawLeft) {
        const path1 = new Path2D();
        path1.moveTo(centerX, centerY);
        leftLine.x = centerX + offsetX1;
        leftLine.y = centerY + offsetY1;
        path1.lineTo(leftLine.x, leftLine.y);
        context.stroke(path1);
    }

    offsetX2 = lengthLeft * Math.sin(-leftAngle);
    offsetY2 = lengthLeft * Math.cos(-leftAngle);

    let rightLine = {
        x: -1,
        y: -1
    }
    if (drawRight) {
        const path2 = new Path2D();
        rightLine.x = centerX + offsetX2;
        rightLine.y = centerY + offsetY2;
        path2.moveTo(centerX, centerY);
        path2.lineTo(rightLine.x, rightLine.y);
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

export function animateCircle(
    centerX: number,
    centerY: number,
    initialAngle: number,
    speed: number,
    context: CanvasRenderingContext2D,
    onComplete: () => void,
) {
    function drawPartialCircle(currentAngle: number) {
        context.save();

        const path = new Path2D();
        path.arc(centerX, centerY, NODE_SIZE, 0, currentAngle);
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.stroke(path);

        currentAngle += speed;
        context.restore();

        if (currentAngle <= 2 * Math.PI) {
            requestAnimationFrame(() => drawPartialCircle(currentAngle));
        } else {
            onComplete();
        }
    }

    drawPartialCircle(initialAngle);
}

function animateLine(
    startX: number,
    startY: number,
    length: number,
    angle: number,
    progress: number,
    speed: number,
    context: CanvasRenderingContext2D,
    onComplete: () => void,
) {
    const path = new Path2D();
    path.moveTo(startX, startY);

    function drawPartialCircle(x: number, y: number) {
        context.save();

        let offsetX1 = 0;
        let offsetY1 = 0;
        if (length !== -1) {
            offsetX1 = length * Math.sin(angle);
            offsetY1 = length * Math.cos(angle);
        }

        path.lineTo(startX + (length + offsetX1) * progress, startY + (length + offsetY1) * progress);
        context.strokeStyle = 'blue';
        context.lineWidth = 2;
        context.stroke(path);

        progress += speed;
        context.restore();

        if (progress <= 1) {
            requestAnimationFrame(() => drawPartialCircle(x, y));
        } else {
            onComplete();
        }
    }

    drawPartialCircle(startX, startY);
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
                    prevCenterY: curr.centerY
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
                    prevCenterY: curr.centerY
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

export function startAnimations(newAdded: { val: number; index: number; centerX: number; centerY: number, prevCenterX: number, prevCenterY: number },
    animations: any[], context: CanvasRenderingContext2D) {
    let currentIndex = 0;

    function nextAnimation() {
        if (currentIndex < animations.length) {
            const { centerX, centerY, speed, leftAngle, rightAngle, leftLength, rightLength, } = animations[currentIndex];

            /*
            animateCircle(centerX, centerY, 0, speed, context!, () => {
                currentIndex++;
                animateLine(centerX, centerY, leftLength, leftAngle, 0, 0.1, context, () => { });
                animateLine(centerX, centerY, rightLength, rightAngle, 0, 0.1, context, () => { });
                nextAnimation();
            });
            */
            animateCirclePop(centerX, centerY, performance.now(), 2000, 1.5, NODE_SIZE, context, () => {
                currentIndex++;
                nextAnimation();
            });
        } else if (newAdded.val !== -1) {
            animateCirclePop(newAdded.centerX, newAdded.centerY, performance.now(), 2000, 1.5, NODE_SIZE, context, () => {
                const path = new Path2D();
                path.moveTo(newAdded.prevCenterX, newAdded.prevCenterY);
                path.lineTo(newAdded.centerX, newAdded.centerY);
                context.stroke(path);
            });
        }
    }

    nextAnimation();
}
