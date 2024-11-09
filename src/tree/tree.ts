import { Node } from "../types";
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

function Insert(arr: Node[], val: number) {
    let parent = 0;
    let curr = 0;

    console.log("valll: ", val)
    while (curr != -1) {
        console.log(curr)
        if (arr[curr].val > val) {
            parent = curr;
            curr = arr[curr].left
            continue
        }
        parent = curr;
        curr = arr[curr].right;
    }

    console.log(parent)
    if (arr[parent].val > val) {
        arr[parent].left = arr.length;
    } else {
        arr[parent].right = arr.length;
    }

    arr.push({
        val,
        parent,
        left: -1,
        right: -1
    } as Node);
}

function remove(arr: Node[], val: number) {
    const index = find(arr, val);
    if (index === -1) {
        return
    }

    const curr = arr[index];
    if (curr.left === -1 && curr.right === -1) {
        if (curr.parent !== -1) {
            if (arr[curr.parent].left === index) {
                arr[curr.parent].left = -1;
            } else {
                arr[curr.parent].right = -1;
            }
        }

        arr.splice(index, 1);
        reAdjust(arr, index, arr.length);
        return
    }
    if (curr.left !== -1 && curr.right === -1) {
        if (arr[curr.parent].left === index) {
            arr[curr.parent].left = curr.left;
        } else {
            arr[curr.parent].right = curr.left;
        }

        arr[curr.left].parent = curr.parent;
        arr.splice(index, 1);
        reAdjust(arr, index, arr.length);

        return
    }
    if (curr.left === -1 && curr.right !== -1) {
        if (arr[curr.parent].left === index) {
            arr[curr.parent].left = curr.right;
        } else {
            arr[curr.parent].right = curr.right;
        }

        arr[curr.right].parent = curr.parent;
        arr.splice(index, 1);
        reAdjust(arr, index, arr.length);

        return
    }

    const next = successor(arr, index);
    if (arr[arr[next].parent].left === next) {
        arr[arr[next].parent].left = -1;
    } else {
        arr[arr[next].parent].right = -1;
    }
    if (arr[curr.parent].left === index) {
        arr[curr.parent].left = next;
    } else {
        arr[curr.parent].right = next;
    }

    arr[next].left = curr.left;
    if (curr.left !== -1) {
        arr[curr.left].parent = next;
    }
    arr[next].right = curr.right;
    if (curr.right !== -1) {
        arr[curr.right].parent = next;
    }

    arr.splice(index, 1);
    reAdjust(arr, index, arr.length);
}

function find(arr: Node[], val: number): number {
    let found = -1;
    let curr = 0;

    while (curr != -1) {
        if (arr[curr].val > val) {
            found = curr;
            curr = arr[curr].left
            continue
        }
        found = curr;
        curr = arr[curr].right;
    }

    return found
}

function getChild(dir: "l" | "r", index: number) {
    if (dir === "l") {
        return (index * 2) + 1
    }
    return (index * 2) + 2
}

function getParent(index: number) {
    return Math.floor((index - 1) / 2);
}

function reAdjust(arr: Node[], start: number, end: number) {
    for (let i = start; i < end; i++) {
        arr[i].parent = Math.max(arr[i].parent - 1, 0);
        arr[i].right = Math.max(arr[i].right - 1, -1);
        arr[i].left = Math.max(arr[i].left - 1, -1);
    }
}

function successor(arr: Node[], index: number): number {
    let curr = arr[index].right;

    while (arr[curr].left !== -1) {
        curr = arr[curr].left;
    }

    return curr
}

function trevarse(arr: Node[], index: number) {
    if (arr[index].left !== -1) {
        trevarse(arr, arr[index].left)
    }
    console.log(arr[index].val);
    if (arr[index].right !== -1) {
        trevarse(arr, arr[index].right)
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

Insert(arr, 10);
Insert(arr, 2);
Insert(arr, 8);
remove(arr, 4);
remove(arr, 3);
remove(arr, 7);

console.log(arr);

