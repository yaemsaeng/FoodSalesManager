const API_BASE_URL = "http://127.0.0.1:8000/api";

let salesData = [];
let currentSortField = '';
let currentSortAsc = true;


document.addEventListener("DOMContentLoaded", () => {
  fetchSalesData();
});

function fetchSalesData() {
  fetch(`${API_BASE_URL}/sales`)
    .then(res => {
      if (!res.ok) throw new Error("โหลดข้อมูลล้มเหลว");
      return res.json();
    })
    .then(data => {
      salesData = data;         
      renderTable(salesData);   
    })
    .catch(err => console.error("Error:", err));
}

function renderTable(sales) {
  const tbody = document.getElementById("salesTableBody");
  tbody.innerHTML = ""; 

  sales.forEach(sale => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${sale.OrderDate}</td>
      <td>${sale.Region}</td>
      <td>${sale.City}</td>
      <td>${sale.Category}</td>
      <td>${sale.Product}</td>
      <td>${sale.Quantity}</td>
      <td>${parseFloat(sale.UnitPrice).toFixed(2)}</td>
      <td>${parseFloat(sale.TotalPrice).toFixed(2)}</td>
      <td class="actions">
        <a href="#" class="edit-link" data-rowid="${sale.id}">✏️</a>
      </td>
      <td class="actions">
        <a href="#" class="delete-link" data-rowid="${sale.id}">🗑️</a>
      </td>
    `;

    tbody.appendChild(tr);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  fetchSalesData();
  document.querySelectorAll("thead th").forEach(th => {
    const field = th.dataset.field;
    if (!field) return;

    th.style.cursor = "pointer";

    th.addEventListener("click", () => {
      if (currentSortField === field) {
        currentSortAsc = !currentSortAsc;
      } else {
        currentSortField = field;
        currentSortAsc = true;
      }

      salesData.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
        } else if (Date.parse(valA) && Date.parse(valB)) {
          valA = new Date(valA);
          valB = new Date(valB);
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) return currentSortAsc ? -1 : 1;
        if (valA > valB) return currentSortAsc ? 1 : -1;
        return 0;
      });
      renderTable(salesData);
    });
  });
});

document.getElementById('filterBtn').addEventListener('click', () => {
  const search = document.getElementById('searchInput').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if ((startDate && !endDate) || (!startDate && endDate)) {
    alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุดให้ครบถ้วน');
    return;
  }

  let url = `${API_BASE_URL}/sales/search?`;

  if (search) {
    url += `search=${encodeURIComponent(search)}&`;
  }
  if (startDate && endDate) {
    url += `startDate=${startDate}&endDate=${endDate}&`;
  }

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('โหลดข้อมูลล้มเหลว');
      return res.json();
    })
    .then(data => {
      salesData = data;           // ⬅ บันทึกผลลัพธ์การค้นหา
      renderTable(salesData);
    })
    .catch(err => console.error(err));
});

// Delete
const tbody = document.getElementById('salesTableBody');
tbody.addEventListener('click', (event) => {
  const deleteLink = event.target.closest('a.delete-link');
  if (deleteLink) {
    const rowid = deleteLink.dataset.rowid;
    
    fetch(`${API_BASE_URL}/sales/delete/${rowid}`, {
      method: "DELETE",
    })
      .then(res => {
        if (!res.ok) throw new Error("ลบข้อมูลไม่สำเร็จ");
        return res.json();
      })
      .then(data => {
        fetchSalesData();
      })
      .catch(err => {
        console.error("เกิดข้อผิดพลาดตอนลบ:", err);
      });
  }
})

// Put 
const editFormContainer = document.querySelector('.form-container');
const editForm = document.getElementById('editForm');
const statusMsg = document.getElementById('statusMsg');
const cancelBtn = document.getElementById('cancelBtn');

let editingId = null;
editFormContainer.style.display = 'none';

function openEditForm(sale) {
  editingId = sale.id;
  editFormContainer.style.display = 'block';

  document.getElementById('orderDateEdit').value = sale.OrderDate;
  document.getElementById('regionEdit').value = sale.Region;
  document.getElementById('cityEdit').value = sale.City;
  document.getElementById('categoryEdit').value = sale.Category;
  document.getElementById('productEdit').value = sale.Product;
  document.getElementById('quantityEdit').value = sale.Quantity;
  document.getElementById('unitPriceEdit').value = sale.UnitPrice;
  document.getElementById('totalPriceEdit').value = sale.TotalPrice;

  statusMsg.textContent = '';
}

cancelBtn.addEventListener('click', () => {
  editFormContainer.style.display = 'none'; 
  editForm.reset();                         
  statusMsg.textContent = '';               
  editingId = null;                         
});

tbody.addEventListener('click', (event) => {
  const editLink = event.target.closest('a.edit-link');
  if (editLink) {
    const rowid = editLink.dataset.rowid;
    fetch(`${API_BASE_URL}/sales`)
      .then(res => res.json())
      .then(sales => {
        const sale = sales.find(s => s.id == rowid);
        if (sale) openEditForm(sale);
      })
      .catch(err => console.error(err));
  }
});

editForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const updatedSale = {
    OrderDate: document.getElementById('orderDateEdit').value,
    Region: document.getElementById('regionEdit').value,
    City: document.getElementById('cityEdit').value,
    Category: document.getElementById('categoryEdit').value,
    Product: document.getElementById('productEdit').value,
    Quantity: parseInt(document.getElementById('quantityEdit').value),
    UnitPrice: parseFloat(document.getElementById('unitPriceEdit').value),
    TotalPrice: parseFloat(document.getElementById('totalPriceEdit').value),
  };

  fetch(`${API_BASE_URL}/sales/insert/${editingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedSale),
  })
    .then(res => {
      if (!res.ok) throw new Error('อัปเดตข้อมูลล้มเหลว');
      return res.json();
    })
    .then(data => {
      statusMsg.textContent = data.message;
      fetchSalesData();       
      setTimeout(() => {
        editFormContainer.style.display = 'none';
      }, 1500);
    })
    .catch(err => {
      statusMsg.textContent = err.message;
    });
});



//Search
document.getElementById('filterBtn').addEventListener('click', () => {
  const search = document.getElementById('searchInput').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if ((startDate && !endDate) || (!startDate && endDate)) {
    alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุดให้ครบถ้วน');
    return;
  }

  let url = `${API_BASE_URL}/sales/search?`;

  if (search) {
    url += `search=${encodeURIComponent(search)}&`;
  }
  if (startDate && endDate) {
    url += `startDate=${startDate}&endDate=${endDate}&`;
  }

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('โหลดข้อมูลล้มเหลว');
      return res.json();
    })
    .then(data => renderTable(data))
    .catch(err => console.error(err));
});



// Insert 
const addSaleBtn = document.getElementById('addSaleBtn');
const popupForm = document.getElementById('popupForm');
const addSaleForm = document.getElementById('addSaleForm');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addStatusMsg = document.getElementById('addStatusMsg');

addSaleBtn.addEventListener('click', () => {
  popupForm.style.display = 'block';
  addStatusMsg.textContent = '';
  addSaleForm.reset();
});

cancelAddBtn.addEventListener('click', () => {
  popupForm.style.display = 'none';
  addStatusMsg.textContent = '';
  addSaleForm.reset();
});

addSaleForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newSale = {
    OrderDate: document.getElementById('orderDateAdd').value,
    Region: document.getElementById('regionAdd').value,
    City: document.getElementById('cityAdd').value,
    Category: document.getElementById('categoryAdd').value,
    Product: document.getElementById('productAdd').value,
    Quantity: parseInt(document.getElementById('quantityAdd').value),
    UnitPrice: parseFloat(document.getElementById('unitPriceAdd').value),
    TotalPrice: parseFloat(document.getElementById('totalPriceAdd').value),
  };

  fetch(`${API_BASE_URL}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newSale),
  })
    .then(res => {
      if (!res.ok) throw new Error('เพิ่มรายการขายล้มเหลว');
      return res.json();
    })
    .then(data => {
      addStatusMsg.textContent = data.message;
      addStatusMsg.classList.remove('error');
      fetchSalesData(); 
      setTimeout(() => {
        popupForm.style.display = 'none';
        addSaleForm.reset();
        addStatusMsg.textContent = '';
      }, 1500);
    })
    .catch(err => {
      addStatusMsg.textContent = err.message;
      addStatusMsg.classList.add('error');
    });
});



