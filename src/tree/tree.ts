import { BST, Node } from "../types";

function newBST(arr?: number[] = undefined): BST {
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

function Insert(bst: BST, val: number) {
    let parent = bst.root;
    let curr = bst.root;

    while (curr !== -1) {
        if (bst.arr[curr].val > val) {
            parent = curr;
            curr = bst.arr[curr].left
            continue
        }
        parent = curr;
        curr = bst.arr[curr].right;
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
        right: -1
    } as Node);
}

function remove(bst: BST, val: number) {
    const index = find(bst, val);
    if (index === -1) {
        return
    }

    const curr = bst.arr[index];

    if (curr.left === -1 && curr.right === -1) {
        if (curr.parent !== -1) {
            if (bst.arr[curr.parent].left === index) {
                bst.arr[curr.parent].left = -1;
            } else {
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
                bst.arr[curr.parent].left = next;
            } else {
                bst.arr[curr.parent].right = next;
            }
        }

        if (bst.root === index) {
            bst.root = next;
        }

        bst.arr.splice(index, 1);
        reAdjust(bst, index);
        return
    }

    next = successor(bst.arr, index);
    const nextNode = bst.arr[next];


    if (bst.arr[nextNode.parent].left === next) {
        bst.arr[nextNode.parent].left = nextNode.right;
    } else {
        bst.arr[nextNode.parent].right = nextNode.right;
    }
    if (nextNode.right !== -1) {
        bst.arr[nextNode.right].parent = nextNode.parent;
    }

    nextNode.parent = curr.parent;
    if (curr.parent !== -1) {
        if (bst.arr[curr.parent].left == index) {
            bst.arr[curr.parent].left = next;
        } else {
            bst.arr[curr.parent].right = next;
        }
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

    bst.arr.splice(index, 1);
    reAdjust(bst, index);
}

function find(bst: BST, val: number): number {
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

function traverse(arr: Node[], index: number) {
    if (arr[index].left !== -1) {
        traverse(arr, arr[index].left)
    }
    console.log(arr[index].val);
    if (arr[index].right !== -1) {
        traverse(arr, arr[index].right)
    }
}

const arr: Node[] = [
    {
        val: 5,
        parent: -1,
        left: 1,
        right: 2
    },
    {
        val: 3,
        parent: 0,
        left: 3,
        right: 4
    },
    {
        val: 7,
        parent: 0,
        left: 5,
        right: -1
    },
    {
        val: 2,
        parent: 1,
        left: -1,
        right: -1
    },
    {
        val: 4,
        parent: 1,
        left: -1,
        right: -1
    },
    {
        val: 6,
        parent: 2,
        left: -1,
        right: -1
    },
]

const bst = {
    arr: arr,
    root: 0,
} as BST;

console.log(bst.arr);
traverse(bst.arr, bst.root);
Insert(bst, 10);
Insert(bst, 2);
Insert(bst, 8);
remove(bst, 4);
remove(bst, 3);
Insert(bst, 4);
remove(bst, 7);
Insert(bst, 9);
Insert(bst, 1);
remove(bst, 7);
remove(bst, 5);
console.log(bst.arr);
console.log(bst.root);
traverse(bst.arr, bst.root);

