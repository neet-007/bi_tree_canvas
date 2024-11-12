export type Node = {
  val: number;
  parent: number;
  left: number;
  right: number;
  leftTreeSize: number;
  rightTreeSize: number;
  depth: number;
  // needs more fields
}

export type BST = {
  arr: Node[];
  root: number;
}
