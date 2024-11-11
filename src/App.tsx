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
const ANGLE = 70 * (Math.PI / 180);
const LINE_HYPOTENUSE = 150;

function App() {
  const [tree, setTree] = useState<BST>({ arr: [], root: -1 } as BST)
  const [val, setVal] = useState(-1);
  const [action, setAction] = useState<"add" | "remove" | "none">("none");
  const ref = useRef<HTMLCanvasElement>(null);

  if (tree.root !== -1) {
    traverse(tree.arr, tree.root);
  }


  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const width = ref.current.width;
    const height = ref.current.height;
    const context = ref.current.getContext("2d");
    if (!context) {
      return;
    }
    function draw(centerX: number, centerY: number, angle: number, length: number, context: CanvasRenderingContext2D): [number[], number[]] {
      console.log("centerx:", centerX)
      context.beginPath();
      context.arc(centerX, centerY, NODE_SIZE, 0, 2 * Math.PI);
      context.fillStyle = "white";
      context.fill();
      context.stroke();

      const offsetX1 = length * Math.sin(angle);
      const offsetY1 = length * Math.cos(angle);

      const offsetX2 = length * Math.sin(-angle);
      const offsetY2 = length * Math.cos(-angle);

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

    const [right, left] = draw(width / 2, NODE_SIZE, ANGLE, LINE_HYPOTENUSE, context);

    const [right2, left2] = draw(right[0], right[1], ANGLE, LINE_HYPOTENUSE, context);
    const [right3, left3] = draw(left[0], left[1], ANGLE, LINE_HYPOTENUSE, context);
    draw(right2[0], right2[1], ANGLE, LINE_HYPOTENUSE, context);
    draw(left2[0], left2[1], ANGLE, LINE_HYPOTENUSE, context);
    draw(right3[0], right3[1], ANGLE, LINE_HYPOTENUSE, context);
    draw(left3[0], left3[1], ANGLE, LINE_HYPOTENUSE, context);

    () => context.clearRect(0, 0, width, height);
  }, [])

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

        return;
      }

      case "remove": {
        setTree(prev => {
          const new_ = { arr: [...prev.arr], root: prev.root } as BST;
          remove(new_, val);
          setAction("none");
          return new_
        });

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
