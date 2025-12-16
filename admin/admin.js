import { Schemas } from "./schemas/admin.schemas.js";
import { LogisticsSchema } from "./schemas/logistics.schema.js";
import { LogsSchema } from "./schemas/logs.schema.js";

document.addEventListener("DOMContentLoaded", () => {

  const files = [
    "overview.json",
    "fleet.json",
    "members.json",
    "logs.json",
    "polaris.json",
    "idris.json",
  ];

  const fileList = document.getElementById("file-list");
  const editor = document.getElementById("editor");
  const title = document.getElementById("editor-title");
  const status = document.getElementById("status");
  const exportBtn = document.getElementById("export");

  let currentFile = null;
  let currentData = null;

  /* Populate Sidebar */
  files.forEach((file) => {
    const li = document.createElement("li");
    li.textContent = file.replace(".json", "").toUpperCase();
    li.addEventListener("click", () => loadFile(file, li));
    fileList.appendChild(li);
  });

  async function loadFile(file, el) {
    document
      .querySelectorAll("#file-list li")
      .forEach((li) => li.classList.remove("active"));
    el.classList.add("active");

    currentFile = file;

    try {
      const res = await fetch(`data/${file}`);
      currentData = await res.json();
      title.textContent = file;

      const schema = Schemas[file];

      // Remove any existing schema editor
      const oldTable = document.querySelector(".table-wrap");
      if (oldTable) oldTable.remove();

      if (schema) {
        renderSchemaEditor(currentData, schema);
      } else {
        editor.style.display = "block";
        editor.textContent = JSON.stringify(currentData, null, 4);
      }

      status.textContent = "Loaded Successfully";
    } catch (err) {
      status.textContent = "Failed to load JSON";
    }
  }

  exportBtn.onclick = () => {
    try {
      const parsed = JSON.parse(editor.textContent);
      const blob = new Blob([JSON.stringify(parsed, null, 4)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = currentFile || "data.json";
      a.click();
      status.textContent = "Exported JSON";
    } catch (err) {
      status.textContent = "Invalid JSON - Export Failed";
    }
  };

  function renderSchemaEditor(data, schema) {
    editor.style.display = "none"; // hide raw editor

    const main = document.querySelector(".admin-main");
    let tableWrap = document.querySelector(".table-wrap");
    if (tableWrap) tableWrap.remove(); // remove old table

    tableWrap = document.createElement("div");
    tableWrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "rsi-table";
    tableWrap.appendChild(table);

    main.appendChild(tableWrap);

    if (schema.type === "logistics") {
      renderLogisticsTable(table, data);
    } else if (schema.type === "logs") {
      renderLogsTable(table, data);
    }
  }

  function renderLogisticsTable(table, data) {
    // Remove old table contents
    table.innerHTML = '';
    
    // header
    const thead = document.createElement("thead");

    function renderHeader() {
      let html = '<tr><th>ITEM</th><th>NEEDED</th>';
      data.users.forEach((u, i) => {
        html += `<th>
          ${u}
          <span class="delete-user" data-user="${u}">X</span>
        </th>`;
      });
      html += '<th>TOTAL</th><th></th></tr>';
      thead.innerHTML = html;
      
      // RE-Attach Delete Events
      thead.querySelectorAll('.delete-user').forEach(span => {
        span.onclick = () => {
          const user = span.dataset.user;
          if (confirm(`Remove user "${user}" from all items?`)) {
            deleteUser(user);
          }
        };
      });
    }

    //body
    const tbody = document.createElement("tbody");

    function renderRows() {
      tbody.innerHTML = '';
      data.items.forEach((item, index) => {
        let total = 0;
        let row = `<tr>
          <td contenteditable="true">${item.item}</td>
          <td contenteditable="true">${item.needed}</td>`;

        data.users.forEach(u => {
          const val = item.inventory[u] || 0;
          total += val;
          const cls = val === 0 ? "incomplete" : val < item.needed ? "partial" : "complete";
          row += `<td contenteditable="true" data-user="${u}" class="${cls}">${val}</td>`;
        });

        row += `<td>${total}</td>
                <td><button class="delete-item" data-index="${index}">🗑️</button></td>
            </tr>`;

        tbody.innerHTML += row;
      });
    }
    
    renderRows();

    // =========== Add Controls ==============
    const controlsDiv = document.createElement('div');
    controlsDiv.style.marginTop = '10px';

    const addItemBtn = document.createElement('button');
    addItemBtn.textContent = 'Add Item';
    addItemBtn.onclick = () => {
      const newItem = { item: 'New Item', needed: 0, inventory: {} };
      data.users.forEach(u => newItem.inventory[u] = 0);
      data.items.push(newItem);
      render();
    };

    const addUserBtn = document.createElement('button');
    addUserBtn.textContent = 'Add User';
    addUserBtn.style.marginLeft = '10px';
    addUserBtn.onclick = () => {
      const newUser = prompt('Enter new user name:');
      if (!newUser) return;

      if (data.users.includes(newUser)) {
        alert ('User Already Exists');
        return;
      }

      data.users.push(newUser);
      data.items.forEach(item =>
        item.inventory[newUser] = 0);
      render();
    };

    controlsDiv.appendChild(addItemBtn);
    controlsDiv.appendChild(addUserBtn);
    table.parentElement.appendChild(controlsDiv);

    // ===== Input Listeners =====
    function attachInputListeners() {
      tbody.querySelectorAll('tr').forEach((tr, rowIndex) => {
        tr.querySelectorAll('td').forEach((td, colIndex) => {
          td.oninput = () => {
            const item = data.items[rowIndex];

            if (colIndex === 0) {
              item.item = td.textContent;
            } else if (colIndex === 1) {
              item.needed = parseInt(td.textContent) || 0;
            } else if (colIndex > 1 && colIndex <= data.users.length + 1) {
              const user = data.users[colIndex - 2];
              item.inventory[user] = parseInt(td.textContent) || 0;
            }

            updateRow(tr, item);

          };
        });
      });

      // Delete item
      table.querySelectorAll('.delete-item').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.index);
          if (confirm('Delete this item?')) {
            data.items.splice(idx, 1);
            render();
          }
        };
      });
    }

    function updateRow(tr, item) {
      let total = 0;
      data.users.forEach((u, i) => {
        const cell = tr.children[i + 2];
        const val = item.inventory[u] || 0;
        total += val;
        cell.textContent = val;
        cell.className =
          val === 0 ? 'incomplete' : val < item.needed ? 'partial' : 'complete';
      });
    tr.children[tr.children.length - 2].textContent = total;
  }

  function render() {
    renderHeader();
    renderRows();
    attachInputListeners();
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  render();

    function deleteUser(user) {
      data.users = data.users.filter(u => u !== user);
      data.items.forEach(item => delete item.inventory[user]);
      render();
    }

  }

  function renderLogsTable(table, data) {
    const thead = document.createElement("thead");
    thead.innerHTML =
      "<tr><th>DATE</th><th>USER</th><th>TITLE</th><th>ENTRY</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach((log) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td contenteditable="true">${log.date}</td>
            <td contenteditable="true">${log.user}</td>
            <td contenteditable="true">${log.title}</td>
            <td contenteditable="true" style="font-family:Courier New;">${log.entry}</td>
        `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // update data when editing
    tbody.querySelectorAll("tr").forEach((tr, idx) => {
      tr.querySelectorAll("td").forEach((td, col) => {
        td.addEventListener("input", () => {
          const log = data[idx];
          if (col === 0) log.date = td.textContent;
          else if (col === 1) log.user = td.textContent;
          else if (col === 2) log.title = td.textContent;
          else if (col === 3) log.entry = td.textContent;
        });
      });
    });
  }
});
