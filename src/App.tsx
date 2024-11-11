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

const NODE_SIZE = 10;
const ANGLE = 30 * (Math.PI / 180);
const LINE_HYPOTENUSE = 50;

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

    function draw(centerX: number, centerY: number, leftAngle: number, rightAngle: number, lengthLeft: number, lengthRight: number, context: CanvasRenderingContext2D): [number[], number[]] {
      context.beginPath();
      context.arc(centerX, centerY, NODE_SIZE, 0, 2 * Math.PI);
      context.fillStyle = "white";
      context.fill();
      context.stroke();

      const offsetX1 = lengthRight * Math.sin(rightAngle);
      const offsetY1 = lengthRight * Math.cos(rightAngle);

      const offsetX2 = lengthLeft * Math.sin(-leftAngle);
      const offsetY2 = lengthLeft * Math.cos(-leftAngle);

      const path1 = new Path2D();
      path1.moveTo(centerX, centerY);
      path1.lineTo(centerX + offsetX1, centerY + offsetY1);
      context.stroke(path1);

      const path2 = new Path2D();
      path2.moveTo(centerX, centerY);
      path2.lineTo(centerX + offsetX2, centerY + offsetY2);
      context.stroke(path2);

      return [
        [centerX + offsetX1, centerY + offsetY1],
        [centerX + offsetX2, centerY + offsetY2]
      ]
    }

    const queue = [{
      index: tree.root,
      centerX: width / 2,
      centerY: NODE_SIZE,
      lengthLeft: LINE_HYPOTENUSE + (LINE_HYPOTENUSE * (tree.arr[tree.root].leftTreeSize * (20 / 100))),
      lengthRight: LINE_HYPOTENUSE + (LINE_HYPOTENUSE * (tree.arr[tree.root].rightTreeSize * (20 / 100))),
      leftAngle: ANGLE + (ANGLE * (tree.arr[tree.root]).leftTreeSize * (15 / 100)),
      rightAngle: ANGLE + (ANGLE * (tree.arr[tree.root]).rightTreeSize * (15 / 100)),
    }];

    context.clearRect(0, 0, width, height);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const [right, left] = draw(curr.centerX, curr.centerY, curr.leftAngle, curr.rightAngle, curr.lengthLeft, curr.lengthRight, context);
      if (tree.arr[curr.index].left !== -1) {
        queue.push({
          index: tree.arr[curr.index].left,
          centerX: left[0],
          centerY: left[1],
          lengthLeft: LINE_HYPOTENUSE + (LINE_HYPOTENUSE * (tree.arr[curr.index].leftTreeSize * (20 / 100))),
          lengthRight: LINE_HYPOTENUSE + (LINE_HYPOTENUSE * (tree.arr[curr.index].rightTreeSize * (20 / 100))),
          leftAngle: ANGLE + (ANGLE * (tree.arr[curr.index].leftTreeSize * (15 / 100))),
          rightAngle: ANGLE + (ANGLE * (tree.arr[curr.index].rightTreeSize * (15 / 100))),
        });
      }
      if (tree.arr[curr.index].right !== -1) {
        queue.push({
          index: tree.arr[curr.index].right,
          centerX: right[0],
          centerY: right[1],
          lengthLeft: LINE_HYPOTENUSE + (LINE_HYPOTENUSE * (tree.arr[curr.index].leftTreeSize * (20 / 100))),
          lengthRight: LINE_HYPOTENUSE + (LINE_HYPOTENUSE * (tree.arr[curr.index].rightTreeSize * (20 / 100))),
          leftAngle: ANGLE + (ANGLE * (tree.arr[curr.index].leftTreeSize * (15 / 100))),
          rightAngle: ANGLE + (ANGLE * (tree.arr[curr.index].rightTreeSize * (15 / 100))),
        });
      }
    }

    setDrawing(false);
    () => context.clearRect(0, 0, width, height);
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
      <div>{tree.arr.map((x, i) => (<div key={`${i}{x}`}>{x.val}</div>))}</div>
      <div>
        <Input name='add' handler={addVal} action_={action} treeLength={tree.arr.length} />
        <Input name='remove' handler={removeVal} action_={action} treeLength={tree.arr.length} />
      </div>
    </>
  )
}

export default App
