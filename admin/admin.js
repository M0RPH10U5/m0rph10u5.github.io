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
    // header
    const users = data.users;
    const thead = document.createElement("thead");
    let headerHtml = "<tr><th>ITEM</th><th>NEEDED</th>";
    users.forEach((u) => (headerHtml += `<th>${u}</th>`));
    headerHtml += "<th>TOTAL</th></tr>";
    thead.innerHTML = headerHtml;
    table.appendChild(thead);

    //body
    const tbody = document.createElement("tbody");
    data.items.forEach((item) => {
      let total = 0;
      let rowHtml = `<tr><td>${item.item}</td><td>${item.needed}</td>`;
      users.forEach((u) => {
        const amt = item.inventory[u] || 0;
        total += amt;
        const cls =
          amt === 0 ? "incomplete" : amt < item.needed ? "partial" : "complete";
        rowHtml += `<td class="${cls}" contenteditable="true" data-user="${u}">${amt}</td>`;
      });
      rowHtml += `<td>${total}</td></tr>`;
      tbody.innerHTML += rowHtml;
    });
    table.appendChild(tbody);

    // Listen for Edits
    table.querySelectorAll("td[contenteditable]").forEach((td) => {
      td.addEventListener("input", (e) => {
        const tr = td.closest("tr");
        const itemName = tr.children[0].textContent;
        const user = td.dataset.user;
        const value = parseInt(td.textContent) || 0;

        const item = data.items.find((i) => i.item === itemName);
        item.inventory[user] = value;

        // Update total
        const totalCell = tr.children[tr.children.length - 1];
        totalCell.textContent = Object.values(item.inventory).reduce(
          (a, b) => a + b,
          0
        );

        td.className =
          value === 0
            ? "incomplete"
            : value < item.needed
            ? "partial"
            : "complete";
      });
    });
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
