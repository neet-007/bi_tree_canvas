import { BST, Node } from "../types";

export function newBST(arr?: number[] = undefined): BST {
    if (arr !== undefined) {
        const nodeArr = buildTree(arr);
        return {
            arr: nodeArr,
            root: 0
        } as BST
    }

    return {
        arr: [],
        root: -1
    } as BST
}

function buildTree(arr: number[]): Node[] {
    arr.sort((a, b) => a - b);
    let start = 0;
    let end = arr.length - 1;
    let mid = Math.floor((arr.length - 1) / 2);
    let leftMid = Math.floor((mid - start) / 2);
    let rightMi = Math.floor((end - mid) / 2);

    const ret = Array(arr.length).fill(0);

    return ret;
}

export function insert(bst: BST, val: number) {
    let parent = bst.root;
    let curr = bst.root;

    while (curr !== -1) {
        if (bst.arr[curr].val > val) {
            parent = curr;
            bst.arr[curr].next = bst.arr[curr].left;
            curr = bst.arr[curr].left
            continue
        }
        parent = curr;
        bst.arr[curr].next = bst.arr[curr].right;
        curr = bst.arr[curr].right;
    }

    if (parent === -1) {
        bst.arr.push({
            val,
            parent,
            left: -1,
            right: -1,
            leftTreeSize: 0,
            rightTreeSize: 0,
            depth: 0,
            next: -1,
        } as Node);
        bst.root = 0;

        return
    }

    if (bst.arr[parent].val > val) {
        bst.arr[parent].left = bst.arr.length;
    } else {
        bst.arr[parent].right = bst.arr.length;
    }

    bst.arr.push({
        val,
        parent,
        left: -1,
        right: -1,
        leftTreeSize: 0,
        rightTreeSize: 0,
        depth: bst.arr[parent].depth + 1,
        next: -1,
    } as Node);

    adjustParentsTreeSize(bst, bst.arr.length - 1, "add");
}

export function remove(bst: BST, val: number) {
    const index = find(bst, val);
    if (index === -1) {
        return
    }

    const curr = bst.arr[index];

    if (curr.left === -1 && curr.right === -1) {
        if (curr.parent !== -1) {
            if (bst.arr[curr.parent].left === index) {
                adjustParentsTreeSize(bst, index, "remove");
                bst.arr[curr.parent].left = -1;
            } else {
                adjustParentsTreeSize(bst, index, "remove");
                bst.arr[curr.parent].right = -1;
            }
        }

        if (bst.root === index) {
            bst.root = -1;
        }

        bst.arr.splice(index, 1);
        reAdjust(bst, index);
        return
    }

    let next = -1;
    if (curr.left !== -1 && curr.right === -1) {
        next = curr.left;
    }
    if (curr.left === -1 && curr.right !== -1) {
        next = curr.right;
    }
    if (next !== -1) {
        bst.arr[next].parent = curr.parent;
        if (curr.parent !== -1) {
            if (bst.arr[curr.parent].left === index) {
                adjustParentsTreeSize(bst, index, "remove");
                bst.arr[curr.parent].left = next;
            } else {
                adjustParentsTreeSize(bst, index, "remove");
                bst.arr[curr.parent].right = next;
            }
        } else {
            bst.arr[next].leftTreeSize = curr.leftTreeSize;
            bst.arr[next].rightTreeSize = curr.rightTreeSize;
        }

        if (bst.root === index) {
            bst.root = next;
        }

        adjustDepth(bst, next, true);
        bst.arr.splice(index, 1);
        reAdjust(bst, index);
        return
    }

    next = successor(bst.arr, index);
    const nextNode = bst.arr[next];
    adjustParentsTreeSize(bst, next, "remove");

    if (bst.arr[nextNode.parent].left === next) {
        bst.arr[nextNode.parent].left = nextNode.right;
    } else {
        bst.arr[nextNode.parent].right = nextNode.right;
    }
    if (nextNode.right !== -1) {
        adjustDepth(bst, nextNode.right, true);
        bst.arr[nextNode.right].parent = nextNode.parent;
    }

    nextNode.parent = curr.parent;
    if (curr.parent !== -1) {
        if (bst.arr[curr.parent].left == index) {
            bst.arr[curr.parent].left = next;
        } else {
            bst.arr[curr.parent].right = next;
        }
    } else {
        bst.arr[next].leftTreeSize = curr.leftTreeSize;
    }

    nextNode.left = curr.left;
    if (curr.left !== -1) {
        bst.arr[curr.left].parent = next;
    }

    nextNode.right = curr.right;
    if (curr.right !== -1) {
        bst.arr[curr.right].parent = next;
    }

    if (bst.root === index) {
        bst.root = next;
    }

    nextNode.depth = curr.depth;
    nextNode.leftTreeSize = curr.leftTreeSize;
    nextNode.rightTreeSize = curr.rightTreeSize;
    bst.arr.splice(index, 1);
    reAdjust(bst, index);
}

export function find(bst: BST, val: number): number {
    let curr = bst.root;

    while (curr !== -1) {
        if (bst.arr[curr].val === val) {
            return curr;
        }
        if (bst.arr[curr].val > val) {
            curr = bst.arr[curr].left
            continue
        }
        curr = bst.arr[curr].right;
    }

    return -1;
}

function adjustParentsTreeSize(bst: BST, index: number, mode: "add" | "remove") {
    let parent = bst.arr[index].parent;
    let dir = "";

    if (parent !== -1) {
        if (bst.arr[parent].left === index) {
            dir = "l";
        } else {
            dir = "r";
        }
    } else {
        return;
    }

    while (parent !== -1) {
        if (dir === "l") {
            if (mode === "add") {
                bst.arr[parent].leftTreeSize++;
            } else {
                bst.arr[parent].leftTreeSize--;
            }
        } else {
            if (mode === "add") {
                bst.arr[parent].rightTreeSize++;
            } else {
                bst.arr[parent].rightTreeSize--;
            }
        }

        if (bst.arr[parent].parent !== -1) {
            if (bst.arr[bst.arr[parent].parent].left === parent) {
                dir = "l";
            } else {
                dir = "r";
            }
        }
        parent = bst.arr[parent].parent;

    }
}

function adjustDepth(bst: BST, index: number, oneChild: boolean) {
    if (oneChild) {
        bst.arr[index].depth = Math.max(bst.arr[index].depth - 1, 0);
        if (bst.arr[index].left !== -1) {
            adjustDepth(bst, bst.arr[index].left, oneChild);
        }
        if (bst.arr[index].right !== -1) {
            adjustDepth(bst, bst.arr[index].right, oneChild);
        }
    }
}

function reAdjust(bst: BST, index: number) {
    for (let i = 0; i < bst.arr.length; i++) {
        if (bst.arr[i].parent >= index) {
            bst.arr[i].parent = Math.max(bst.arr[i].parent - 1, -1);
        }
        if (bst.arr[i].left >= index) {
            bst.arr[i].left = Math.max(bst.arr[i].left - 1, -1);
        }
        if (bst.arr[i].right >= index) {
            bst.arr[i].right = Math.max(bst.arr[i].right - 1, -1);
        }
    }
    if (bst.root >= index) {
        bst.root -= 1;
    }
}

export function cleanNext(bst: BST) {
    let next = bst.root;
    let curr = bst.root;

    while (curr !== -1) {
        next = bst.arr[curr].next;
        bst.arr[curr].next = -1;
        curr = bst.arr[curr].next;
    }
}

function successor(arr: Node[], index: number): number {
    let curr = arr[index].right;

    if (curr === -1) {
        throw new Error("this function does not support find successor if you have no right child will be impleanted later");
    }
    while (arr[curr].left !== -1) {
        curr = arr[curr].left;
    }

    return curr
}

export function traverse(arr: Node[], index: number) {
    if (arr[index].left !== -1) {
        traverse(arr, arr[index].left)
    }
    console.log(arr[index]);
    if (arr[index].right !== -1) {
        traverse(arr, arr[index].right)
    }
}
