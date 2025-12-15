const files = [
    'overview.json',
    'fleet.json',
    'members.json',
    'logs.json',
    'polaris.json',
    'idris.json'
];

const fileList = document.getElementById('file-list');
const editor = document.getElementById('editor');
const title = document.getElementById('editor-title');
const status = document.getElementById('status');
const exportBtn = document.getElementById('export');

let currentFile = null;
let currentData = null;

/* Populate Sidebar */
files.forEach(file => {
    const li = document.createElement('li');
    li.textContent = file.replace('.json','').toUpperCase();
    li.onclick = () => loadFile(file, li);
    fileList.appendChild(li);
});

async function loadFile(file, el) {
    document.querySelectorAll('#file-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');

    try {
        const res = await fetch(`../data/${file}`);
        currentData = await res.json();
        currentFile = file;
        editor.textContent = JSON.stringify(currentData, null, 4);
        title.textContent = file;
        status.textContent = 'Loaded Successfully';
    } catch (err) {
        status.textContent = 'Failed to load JSON';
    }
}

exportBtn.onclick = () => {
    try {
        const parsed = JSON.parse(editor.textContent);
        const blob = new Blob([JSON.stringify(parsed, null, 4)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = currentFile || 'data.json';
        a.click();
        status.textContent = 'Exported JSON';
    } catch (err) {
        status.textContent = 'Invalid JSON - Export Failed';
    }
};