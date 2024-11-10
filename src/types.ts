export type Node = {
  val: number;
  parent: number;
  left: number;
  right: number;
  // needs more fields
}

export type BST = {
  arr: Node[];
  root: number;
}
