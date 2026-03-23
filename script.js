const createNode = (value, left = null, right = null) => ({ value, left, right });

const tokenize = (str) => str.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);

const getPrecedence = (op) => ({ '+': 1, '-': 1, '*': 2, '/': 2 }[op] || 0);

const toPostfix = (tokens) => {
    const output = [];
    const stack = [];
    tokens.forEach(token => {
        if (!isNaN(token) || token === 'x') output.push(token);
        else if (token === '(') stack.push(token);
        else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') output.push(stack.pop());
            stack.pop();
        } else {
            while (stack.length && getPrecedence(stack[stack.length - 1]) >= getPrecedence(token)) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    });
    return [...output, ...stack.reverse()];
};

const buildExpressionTree = (postfix) => {
    const stack = [];
    postfix.forEach(token => {
        if (!isNaN(token) || token === 'x') {
            stack.push(createNode(token));
        } else {
            const right = stack.pop();
            const left = stack.pop();
            stack.push(createNode(token, left, right));
        }
    });
    return stack[0];
};

const insertBST = (node, value) => {
    if (!node) return createNode(value);
    if (value < node.value) return { ...node, left: insertBST(node.left, value) };
    return { ...node, right: insertBST(node.right, value) };
};

const evaluate = (node, xValue) => {
    if (!node.left && !node.right) {
        return node.value === 'x' ? parseFloat(xValue) : parseFloat(node.value);
    }
    const leftVal = evaluate(node.left, xValue);
    const rightVal = evaluate(node.right, xValue);
    switch (node.value) {
        case '+': return leftVal + rightVal;
        case '-': return leftVal - rightVal;
        case '*': return leftVal * rightVal;
        case '/': return leftVal / rightVal;
        default: return 0;
    }
};

const findMin = (node) => (node.left ? findMin(node.left) : node);

const deleteNode = (node, value) => {
    if (!node) return null;
    if (value < node.value) return { ...node, left: deleteNode(node.left, value) };
    if (value > node.value) return { ...node, right: deleteNode(node.right, value) };
    
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    
    const temp = findMin(node.right);
    return { 
        ...node, 
        value: temp.value, 
        right: deleteNode(node.right, temp.value) 
    };
};

let resultsTreeRoot = null;

const renderTreeHtml = (node) => {
    if (!node) return "";
    let childrenHtml = "";
    
    if (node.left || node.right) {
        const leftChild = node.left ? renderTreeHtml(node.left) : '<div class="node-val invisible-node"></div>';
        const rightChild = node.right ? renderTreeHtml(node.right) : '<div class="node-val invisible-node"></div>';
        
        childrenHtml = `
            <ul>
                <li>${leftChild}</li>
                <li>${rightChild}</li>
            </ul>
        `;
    }
    
    return `<div class="node-val">${node.value}</div>${childrenHtml}`;
};

function processData() {
    const numsStr = document.getElementById('numbersInput').value;
    if (!numsStr.trim()) return alert("Ingresa una lista de números");
    
    const nums = numsStr.split(',').map(n => parseFloat(n.trim()));
    const expStr = document.getElementById('expressionInput').value;
    
    const postfix = toPostfix(tokenize(expStr));
    const expTree = buildExpressionTree(postfix);
    
    const results = nums.map(n => evaluate(expTree, n));
    
    resultsTreeRoot = results.reduce((acc, curr) => insertBST(acc, curr), null);
    
    if(expTree) {
        document.getElementById('expressionTreeCanvas').innerHTML = `<div class="css-tree"><ul><li>${renderTreeHtml(expTree)}</li></ul></div>`;
    }
    if(resultsTreeRoot) {
        document.getElementById('resultsTreeCanvas').innerHTML = `<div class="css-tree"><ul><li>${renderTreeHtml(resultsTreeRoot)}</li></ul></div>`;
    }
}

function handleDelete() {
    const valInput = document.getElementById('deleteNodeInput').value;
    if (!valInput.trim()) return;
    
    const val = parseFloat(valInput);
    resultsTreeRoot = deleteNode(resultsTreeRoot, val);
    
    if(resultsTreeRoot) {
        document.getElementById('resultsTreeCanvas').innerHTML = `<div class="css-tree"><ul><li>${renderTreeHtml(resultsTreeRoot)}</li></ul></div>`;
    } else {
        document.getElementById('resultsTreeCanvas').innerHTML = "<p>Árbol vacío</p>"; 
    }
}