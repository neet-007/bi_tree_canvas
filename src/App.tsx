import React, { ComponentProps, useRef, useState } from 'react'
import './App.css'

type InputProps = {
  name: string;
  handler: (val: number) => void;

}

const Input: React.FC<ComponentProps<"form"> & InputProps> = ({ name, handler, ...props }) => {
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
      <button style={{ width: "fit-content" }}>{name}</button>
    </form>
  );
}

function App() {
  const [tree, setTree] = useState<number[]>([])
  const ref = useRef<HTMLCanvasElement>(null);

  function add(val: number) {
    setTree(prev => {
      const new_ = [...prev];
      new_.push(val);

      return new_
    })
  }

  function remove(val: number) {
    setTree(prev => prev.filter(x => x !== val));
  }

  return (
    <>
      <canvas width="500" height="500" style={{ backgroundColor: "white" }} ref={ref}></canvas>
      <div>{tree.map((x, i) => (<div key={`${i}{x}`}>{x}</div>))}</div>
      <div>
        <Input name='add' handler={add} />
        <Input name='remove' handler={remove} />
      </div>
    </>
  )
}

export default App
