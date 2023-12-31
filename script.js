let db;
let request = window.indexedDB.open("myDB", 1);

request.onerror = function(event) {
  console.log("Ошибка при открытии базы данных");
};

request.onsuccess = function(event) {
  db = request.result;
  updateTable();
};

request.onupgradeneeded = function(event) {
  let db = event.target.result;
  let objectStore = db.createObjectStore("tableName", { keyPath: "id", autoIncrement: true });
  objectStore.createIndex("column1", "column1", { unique: false });
  objectStore.createIndex("column2", "column2", { unique: false });
};

// Функция для обновления таблицы
function updateTable() {
  let transaction = db.transaction(["tableName"], "readonly");
  let objectStore = transaction.objectStore("tableName");
  let table = document.getElementById("myTable");
  table.innerHTML = '';

  objectStore.openCursor().onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      let row = table.insertRow();
      row.insertCell(0).textContent = cursor.value.column1;
      row.insertCell(1).textContent = cursor.value.column2;
      let key = cursor.primaryKey;

      let input = document.createElement("input");
      input.type = "text";
      input.value = key;
      row.insertCell(2).appendChild(input);

      let editButtonCell = row.insertCell();
      addEditButton(editButtonCell, key);

      let deleteButtonCell = row.insertCell();
      addDeleteButton(deleteButtonCell, key);

      cursor.continue();
    }
  };
}


function saveItem() {
  let column1Val = document.getElementById("inputColumn1").value;
  let column2Val = document.getElementById("inputColumn2").value;

  let transaction = db.transaction(["tableName"], "readwrite");
  let objectStore = transaction.objectStore("tableName");
  let newItem = { column1: column1Val, column2: column2Val };

  let request = objectStore.add(newItem);
  request.onsuccess = function(event) {
    alert("Запись успешно добавлена");
    updateTable();
  };

  request.onerror = function(event) {
    alert("Ошибка при добавлении записи");
  };
}


function updateItem(key) {
  let column1Val = prompt("Введите новое значение для колонки 1:");
  let column2Val = prompt("Введите новое значение для колонки 2:");

  let transaction = db.transaction(["tableName"], "readwrite");
  let objectStore = transaction.objectStore("tableName");

  let request = objectStore.get(key);
  request.onsuccess = function(event) {
    let data = event.target.result;
    if (data) {
      data.column1 = column1Val || data.column1;
      data.column2 = column2Val || data.column2;

      let updateRequest = objectStore.put(data);
      updateRequest.onsuccess = function(event) {
        alert("Запись успешно обновлена");
        updateTable();
      };
    }
  };
}


function deleteItem(key) {
let transaction = db.transaction(["tableName"], "readwrite");
  let objectStore = transaction.objectStore("tableName");

  let request = objectStore.delete(key);
  request.onsuccess = function(event) {
    alert("Запись успешно удалена");
    updateTable();
  };

  request.onerror = function(event) {
    alert("Ошибка при удалении записи");
  };
}


function addEditButton(row, key) {
  let button = document.createElement("button");
  button.innerText = "Изменить";
  button.onclick = function() {
    updateItem(key);
  };
  row.appendChild(button);
}


function addDeleteButton(row, key) {
  let button = document.createElement("button");
  button.innerText = "Удалить";
  button.onclick = function() {
    deleteItem(key);
  };
  row.appendChild(button);
}