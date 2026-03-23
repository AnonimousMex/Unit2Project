const createNode = (value, left = null, right = null) => ({ value, left, right });

const tokenize = (str) => str.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/);

const getPrecedence = (op) => ({ '+': 1, '-': 1, '*': 2, '/': 2 }[op] || 0);

const processClosingParenthesis = (tokens, output, stack) => {
    const top = stack[stack.length - 1];
    if (top === '(') return toPostfix(tokens, output, stack.slice(0, -1));
    return processClosingParenthesis(tokens, [...output, top], stack.slice(0, -1));
};

const processOperator = (token, tokens, output, stack) => {
    if (stack.length === 0) return toPostfix(tokens, output, [...stack, token]);
    const top = stack[stack.length - 1];
    if (top !== '(' && getPrecedence(top) >= getPrecedence(token)) {
        return processOperator(token, tokens, [...output, top], stack.slice(0, -1));
    }
    return toPostfix(tokens, output, [...stack, token]);
};

const toPostfix = (tokens, output = [], stack = []) => {
    if (tokens.length === 0) {
        if (stack.length === 0) return output;
        return toPostfix(tokens, [...output, stack[stack.length - 1]], stack.slice(0, -1));
    }

    const token = tokens[0];
    const restTokens = tokens.slice(1);

    if (!isNaN(token) || token === 'x') return toPostfix(restTokens, [...output, token], stack);
    if (token === '(') return toPostfix(restTokens, output, [...stack, token]);
    if (token === ')') return processClosingParenthesis(restTokens, output, stack);
    
    return processOperator(token, restTokens, output, stack);
};

const buildExpressionTree = (postfix, stack = []) => {
    if (postfix.length === 0) return stack[0];
    
    const token = postfix[0];
    const rest = postfix.slice(1);
    
    if (!isNaN(token) || token === 'x') {
        return buildExpressionTree(rest, [...stack, createNode(token)]);
    } else {
        const right = stack[stack.length - 1];
        const left = stack[stack.length - 2];
        const newStack = stack.slice(0, -2);
        return buildExpressionTree(rest, [...newStack, createNode(token, left, right)]);
    }
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

const evaluateListRecursive = (nums, tree, index = 0) => {
    if (index === nums.length) return [];
    const currentResult = evaluate(tree, nums[index]);
    return [currentResult, ...evaluateListRecursive(nums, tree, index + 1)];
};

const buildBstRecursive = (results, node = null, index = 0) => {
    if (index === results.length) return node;
    const updatedNode = insertBST(node, results[index]);
    return buildBstRecursive(results, updatedNode, index + 1);
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
        childrenHtml = `<ul><li>${leftChild}</li><li>${rightChild}</li></ul>`;
    }
    
    return `<div class="node-val">${node.value}</div>${childrenHtml}`;
};

const parseNumbersRecursive = (strArray, index = 0) => {
    if (index === strArray.length) return [];
    return [parseFloat(strArray[index].trim()), ...parseNumbersRecursive(strArray, index + 1)];
};

function processData() {
    const numsStr = document.getElementById('numbersInput').value;
    if (!numsStr.trim()) return alert("Ingresa una lista de números separada por comas");
    
    const numsArray = numsStr.split(',');
    const nums = parseNumbersRecursive(numsArray);
    
    const expStr = document.getElementById('expressionInput').value;
    const tokens = tokenize(expStr);
    
    const postfix = toPostfix(tokens);
    const expTree = buildExpressionTree(postfix);
    
    const results = evaluateListRecursive(nums, expTree);
    resultsTreeRoot = buildBstRecursive(results);
    
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