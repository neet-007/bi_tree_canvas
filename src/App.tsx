import React, { ComponentProps, useEffect, useRef, useState } from 'react'
import './App.css'
import { BST } from './types';
import { insert, remove, traverse } from './tree/tree.ts'

type InputProps = {
  name: string;
  handler: (val: number) => void;
  action_: "add" | "remove" | "none";
  treeLength: number;

}

const Input: React.FC<ComponentProps<"form"> & InputProps> = ({ name, handler, action_, treeLength, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ref.current) return;

    handler(Number(ref.current.value));
  }

  return (
    <form {...props} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onSubmit={onSubmit}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <label htmlFor={name}>{name}</label>
        <input type="number" name={name} id={name} ref={ref} />
      </div>
      <button style={{ width: "fit-content" }} disabled={(action_ !== "none" || (name === "remove" ? treeLength <= 0 : false))}>{name}</button>
    </form>
  );
}

const NODE_SIZE = 15;
const ANGLE = 30 * (Math.PI / 180);
const LINE_HYPOTENUSE = 90;

function App() {
  const [tree, setTree] = useState<BST>({ arr: [], root: -1 } as BST)
  const [val, setVal] = useState(-1);
  const [drawing, setDrawing] = useState(false);
  const [action, setAction] = useState<"add" | "remove" | "none">("none");
  const ref = useRef<HTMLCanvasElement>(null);


  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const width = ref.current.width;
    const height = ref.current.height;
    const context = ref.current.getContext("2d");
    if (!context || !drawing) {
      return;
    }

    function draw(centerX: number, centerY: number, leftAngle: number, rightAngle: number, lengthLeft: number, lengthRight: number, val: number, context: CanvasRenderingContext2D): [number[], number[]] {
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

    const queue = [{
      val: tree.arr[tree.root].val,
      index: tree.root,
      centerX: width / 2,
      centerY: NODE_SIZE,
    }];

    context.clearRect(0, 0, width, height);

    while (queue.length > 0) {
      const curr = queue.shift()!;

      let leftAngle = ANGLE;
      if (tree.arr[curr.index].left !== -1 && tree.arr[tree.arr[curr.index].left].right !== -1) {
        leftAngle *= 2.7;
      }
      let rightAngle = ANGLE;
      if (tree.arr[curr.index].right !== -1 && tree.arr[tree.arr[curr.index].right].left !== -1) {
        rightAngle *= 2.7;
      }

      let leftLength = -1;
      if (tree.arr[curr.index].left !== -1) {
        leftLength = LINE_HYPOTENUSE + (LINE_HYPOTENUSE * ((1 / (tree.arr[curr.index].depth + 1)) * (tree.arr[tree.arr[curr.index].left].rightTreeSize * (50 / 100))));
      }
      let rightLength = -1;
      if (tree.arr[curr.index].right !== -1) {
        rightLength = LINE_HYPOTENUSE + (LINE_HYPOTENUSE * ((1 / (tree.arr[curr.index].depth + 1)) * (tree.arr[tree.arr[curr.index].right].leftTreeSize * (50 / 100))));
      }

      const [right, left] = draw(curr.centerX, curr.centerY,
        leftAngle,
        rightAngle,
        leftLength,
        rightLength,
        curr.val, context);

      if (tree.arr[curr.index].left !== -1) {
        queue.push({
          val: tree.arr[tree.arr[curr.index].left].val,
          index: tree.arr[curr.index].left,
          centerX: left[0],
          centerY: left[1],
        });
      }
      if (tree.arr[curr.index].right !== -1) {
        queue.push({
          val: tree.arr[tree.arr[curr.index].right].val,
          index: tree.arr[curr.index].right,
          centerX: right[0],
          centerY: right[1],
        });
      }
    }

    setDrawing(false);
  }, [drawing])

  useEffect(() => {
    if (action === "none") {
      return;
    }

    switch (action) {
      case "add": {
        setTree(prev => {
          const new_ = { arr: [...prev.arr], root: prev.root } as BST;
          insert(new_, val);
          setAction("none");
          return new_
        })

        setDrawing(true);
        return;
      }

      case "remove": {
        setTree(prev => {
          const new_ = { arr: [...prev.arr], root: prev.root } as BST;
          remove(new_, val);
          setAction("none");
          return new_
        });

        setDrawing(true);
        return;
      }

    }
  }, [action])

  function addVal(val: number) {
    setAction("add");
    setVal(val);
  }

  function removeVal(val: number) {
    setAction("remove");
    setVal(val);
  }

  return (
    <>
      <canvas width="1200" height="500" style={{ backgroundColor: "white" }} ref={ref}></canvas>
      <div>
        <Input name='add' handler={addVal} action_={action} treeLength={tree.arr.length} />
        <Input name='remove' handler={removeVal} action_={action} treeLength={tree.arr.length} />
      </div>
    </>
  )
}

export default App
