import { Node } from "../types";

const NODE_SIZE = 15;
const ANGLE = 30 * (Math.PI / 180);
const LINE_HYPOTENUSE = 90;

export function draw(centerX: number, centerY: number, leftAngle: number, rightAngle: number, lengthLeft: number, lengthRight: number, val: number, context: CanvasRenderingContext2D): [number[], number[]] {
    let offsetX1 = 0;
    let offsetY1 = 0;
    let offsetX2 = 0;
    let offsetY2 = 0
    if (lengthRight !== -1) {
        offsetX1 = lengthRight * Math.sin(rightAngle);
        offsetY1 = lengthRight * Math.cos(rightAngle);

        const path1 = new Path2D();
        path1.moveTo(centerX, centerY);
        path1.lineTo(centerX + offsetX1, centerY + offsetY1);
        context.stroke(path1);
    }

    if (lengthLeft !== -1) {
        offsetX2 = lengthLeft * Math.sin(-leftAngle);
        offsetY2 = lengthLeft * Math.cos(-leftAngle);

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
        [centerX + offsetX2, centerY + offsetY2]
    ]
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

export function drawTree(root: number, width: number, height: number, arr: Node[], context: CanvasRenderingContext2D): any[] {
    const queue = [{
        val: arr[root].val,
        index: root,
        centerX: width / 2,
        centerY: NODE_SIZE,
    }];

    const animateArr = [];
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
        if (arr[curr.index].left !== -1) {
            leftLength = LINE_HYPOTENUSE + (LINE_HYPOTENUSE * ((1 / (arr[curr.index].depth + 1)) * (arr[arr[curr.index].left].rightTreeSize * (50 / 100))));
        }
        let rightLength = -1;
        if (arr[curr.index].right !== -1) {
            rightLength = LINE_HYPOTENUSE + (LINE_HYPOTENUSE * ((1 / (arr[curr.index].depth + 1)) * (arr[arr[curr.index].right].leftTreeSize * (50 / 100))));
        }

        const [right, left] = draw(curr.centerX, curr.centerY,
            leftAngle,
            rightAngle,
            leftLength,
            rightLength,
            curr.val, context);

        if (arr[curr.index].left !== -1 && arr[curr.index].left !== arr.length - 1) {
            queue.push({
                val: arr[arr[curr.index].left].val,
                index: arr[curr.index].left,
                centerX: left[0],
                centerY: left[1],
            });
        }
        if (arr[curr.index].right !== -1 && arr[curr.index].right !== arr.length - 1) {
            queue.push({
                val: arr[arr[curr.index].right].val,
                index: arr[curr.index].right,
                centerX: right[0],
                centerY: right[1],
            });
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

    return animateArr
}

export function startAnimations(animations: any[], context: CanvasRenderingContext2D) {
    let currentIndex = 0;

    function nextAnimation() {
        if (currentIndex < animations.length) {
            const { centerX, centerY, speed, leftAngle, rightAngle, leftLength, rightLength, } = animations[currentIndex];
            animateCircle(centerX, centerY, 0, speed, context!, () => {
                currentIndex++;
                animateLine(centerX, centerY, leftLength, leftAngle, 0, 0.1, context, () => { });
                animateLine(centerX, centerY, rightLength, rightAngle, 0, 0.1, context, () => { });
                nextAnimation();
            });
        }
    }

    nextAnimation();
}
