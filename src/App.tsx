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


function App() {
  const [tree, setTree] = useState<BST>({ arr: [], root: -1 } as BST)
  const [val, setVal] = useState(-1);
  const [action, setAction] = useState<"add" | "remove" | "none">("none");
  const ref = useRef<HTMLCanvasElement>(null);

  if (tree.root !== -1) {
    traverse(tree.arr, tree.root);
  }

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
      <canvas width="500" height="500" style={{ backgroundColor: "white" }} ref={ref}></canvas>
      <div>{tree.arr.map((x, i) => (<div key={`${i}{x}`}>{x.val}</div>))}</div>
      <div>
        <Input name='add' handler={addVal} action_={action} treeLength={tree.arr.length} />
        <Input name='remove' handler={removeVal} action_={action} treeLength={tree.arr.length} />
      </div>
    </>
  )
}

export default App
