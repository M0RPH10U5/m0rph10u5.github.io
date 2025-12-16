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
    document.querySelectorAll("#file-list li").forEach(li => li.classList.remove("active"));
    el.classList.add("active");

    currentFile = file;

    try {
      const res = await fetch(`data/${file}`);
      currentData = await res.json();
      title.textContent = file;

      const schema = Schemas[file];

      // Remove old editor/table
      const oldTable = document.querySelector(".table-wrap");
      if (oldTable) oldTable.remove();
      editor.style.display = "none";

      if (schema?.type === "logistics") {
        // Create a table element and pass it
        const table = document.createElement("table");
        table.className = "rsi-table";
        renderLogisticsTable(currentData, schema);
      } else if (schema?.type === "logs") {
        renderLogsTable(currentData);
      } else if (currentFile === "overview.json") {
        renderOverviewEditor(currentData);
      } else if (currentFile === "fleet.json") {
        renderCardsEditor(currentData, ["name","manufacturer","role"]);
      } else if (currentFile === "members.json") {
        renderCardsEditor(currentData, ["name","sc-name","role","specialty","ship"]);
      } else {
        editor.style.display = "block";
        editor.textContent = JSON.stringify(currentData, null, 4);
      }

      status.textContent = "Loaded Successfully";
    } catch (err) {
      console.error(err);
      status.textContent = "Failed to load JSON";
    }
  }

  exportBtn.onclick = () => {
    try {
      const parsed = JSON.parse(editor.textContent);
      const blob = new Blob([JSON.stringify(parsed, null, 4)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = currentFile || "data.json";
      a.click();
      status.textContent = "Exported JSON";
    } catch (err) {
      status.textContent = "Invalid JSON - Export Failed";
    }
  };

  /* ----------------- Overview Editor ----------------- */
  function renderOverviewEditor(data) {
    editor.style.display = "block";
    editor.innerHTML = '';

    const table = document.createElement("table");
    table.className = "rsi-table";
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>Title</th><th>Content</th><th></th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    function renderRows() {
      tbody.innerHTML = "";
      data.forEach((item, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td contenteditable="true" data-field="title" data-index="${idx}">${item.title}</td>
          <td contenteditable="true" data-field="content" data-index="${idx}">${item.content}</td>
          <td><button class="delete-row" data-index="${idx}">🗑️</button></td>
        `;
        tbody.appendChild(row);
      });

      tbody.querySelectorAll(".delete-row").forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.index);
          data.splice(idx, 1);
          renderRows();
        };
      });

      tbody.querySelectorAll("td[contenteditable]").forEach(td => {
        td.oninput = () => {
          const idx = parseInt(td.dataset.index);
          const field = td.dataset.field;
          data[idx][field] = td.textContent;
        };
      });
    }

    renderRows();
    editor.appendChild(table);

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Entry";
    addBtn.onclick = () => {
      data.push({ title: "", content: "" });
      renderRows();
    };
    editor.appendChild(addBtn);
  }

  /* ----------------- Cards Editor (Fleet / Members) ----------------- */
  function renderCardsEditor(data, fields) {
    editor.style.display = "block";
    editor.innerHTML = '';

    function renderCards() {
      editor.innerHTML = '';
      data.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "card";
        card.style = "border:1px solid #ccc;padding:10px;margin:5px;border-radius:5px;display:inline-block;vertical-align:top;min-width:200px;";

        fields.forEach(f => {
          const label = document.createElement("div");
          label.textContent = f.toUpperCase();
          const input = document.createElement("input");
          input.value = item[f] || "";
          input.oninput = () => item[f] = input.value;
          label.appendChild(input);
          card.appendChild(label);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {
          if (confirm("Delete this card?")) {
            data.splice(idx, 1);
            renderCards();
          }
        };
        card.appendChild(deleteBtn);

        editor.appendChild(card);
      });

      const addBtn = document.createElement("button");
      addBtn.textContent = "Add Card";
      addBtn.onclick = () => {
        const newItem = {};
        fields.forEach(f => newItem[f] = "");
        data.push(newItem);
        renderCards();
      };
      editor.appendChild(addBtn);
    }

    renderCards();
  }

  /* ----------------- Logs Editor ----------------- */
  function renderLogsTable(data) {
    editor.style.display = "block";
    editor.innerHTML = '';

    const table = document.createElement("table");
    table.className = "rsi-table";

    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>DATE</th><th>USER</th><th>TITLE</th><th>ENTRY</th></tr>";
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
    editor.appendChild(table);

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

  /* ----------------- Logistics Editor (Polaris / Idris) ----------------- */
  function renderLogisticsTable(table, currentData) {
    editor.style.display = "none";
    const main = document.querySelector(".admin-main");
    let tableWrap = document.querySelector(".table-wrap");
    if (tableWrap) tableWrap.remove();
    tableWrap = document.createElement("div");
    tableWrap.className = "table-wrap";
    main.appendChild(tableWrap);
    tableWrap.appendChild(table);

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);

    function renderHeader() {
      let html = "<tr><th>ITEM</th><th>NEEDED</th>";
      data.users.forEach(u => {
        html += `<th>${u} <span class="delete-user" data-user="${u}">X</span></th>`;
      });
      html += "<th>TOTAL</th><th></th></tr>";
      thead.innerHTML = html;

      thead.querySelectorAll(".delete-user").forEach(span => {
        span.onclick = () => {
          const user = span.dataset.user;
          if (confirm(`Remove user "${user}"?`)) {
            data.users = data.users.filter(u => u !== user);
            data.items.forEach(item => delete item.inventory[user]);
            render();
          }
        };
      });
    }

    function renderRows() {
      tbody.innerHTML = '';
      data.items.forEach((item, idx) => {
        let total = 0;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td contenteditable="true">${item.item}</td><td contenteditable="true">${item.needed}</td>`;
        data.users.forEach(u => {
          const val = item.inventory[u] || 0;
          total += val;
          const cls = val === 0 ? "incomplete" : val < item.needed ? "partial" : "complete";
          tr.innerHTML += `<td contenteditable="true" data-user="${u}" class="${cls}">${val}</td>`;
        });
        tr.innerHTML += `<td>${total}</td><td><button class="delete-item" data-index="${idx}">🗑️</button></td>`;
        tbody.appendChild(tr);
      });

      // Attach input events
      tbody.querySelectorAll("tr").forEach((tr, rowIndex) => {
        tr.querySelectorAll("td").forEach((td, colIndex) => {
          td.oninput = () => {
            const item = data.items[rowIndex];
            if (colIndex === 0) item.item = td.textContent;
            else if (colIndex === 1) item.needed = parseInt(td.textContent) || 0;
            else if (colIndex > 1 && colIndex <= data.users.length + 1) {
              const user = data.users[colIndex - 2];
              item.inventory[user] = parseInt(td.textContent) || 0;
            }
            updateRow(tr, item);
          };
        });
      });

      // Delete item
      tbody.querySelectorAll(".delete-item").forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.index);
          if (confirm("Delete this item?")) {
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
        cell.className = val === 0 ? "incomplete" : val < item.needed ? "partial" : "complete";
      });
      tr.children[tr.children.length - 2].textContent = total;
    }

    function render() {
      renderHeader();
      renderRows();
    }

    // Add controls
    const controlsDiv = document.createElement("div");
    controlsDiv.style.marginTop = "10px";

    const addItemBtn = document.createElement("button");
    addItemBtn.textContent = "Add Item";
    addItemBtn.onclick = () => {
      const newItem = { item: "New Item", needed: 0, inventory: {} };
      data.users.forEach(u => newItem.inventory[u] = 0);
      data.items.push(newItem);
      render();
    };

    const addUserBtn = document.createElement("button");
    addUserBtn.textContent = "Add User";
    addUserBtn.style.marginLeft = "10px";
    addUserBtn.onclick = () => {
      const newUser = prompt("Enter new user name:");
      if (!newUser || data.users.includes(newUser)) return;
      data.users.push(newUser);
      data.items.forEach(item => item.inventory[newUser] = 0);
      render();
    };

    controlsDiv.appendChild(addItemBtn);
    controlsDiv.appendChild(addUserBtn);
    tableWrap.appendChild(controlsDiv);

    render();
  }
});
