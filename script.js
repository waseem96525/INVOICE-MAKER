// State
let items = [
    { id: 1, description: 'Website Design', quantity: 1, price: 1500 },
    { id: 2, description: 'Brand Identity', quantity: 1, price: 800 }
];

// Selectors
const itemList = document.getElementById('itemList');
const prevItems = document.getElementById('prev-items');
const addItemBtn = document.getElementById('addItemBtn');
const printBtn = document.getElementById('printBtn');
const resetBtn = document.getElementById('resetBtn');

// Inputs maps
const inputMap = {
    'senderName': 'prev-senderName',
    'senderEmail': 'prev-senderEmail',
    'senderAddress': 'prev-senderAddress',
    'senderGst': 'prev-senderGst',
    'clientName': 'prev-clientName',
    'clientEmail': 'prev-clientEmail',
    'clientAddress': 'prev-clientAddress',
    'clientGst': 'prev-clientGst',
    'invoiceNumber': 'prev-invoiceNumber',
    'invoiceDate': 'prev-invoiceDate',
    'dueDate': 'prev-dueDate',
    'taxRate': 'prev-taxRateDisplay',
    'discountRate': 'prev-discountRateDisplay'
};

// Initialization
function init() {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueDate = nextMonth.toISOString().split('T')[0];

    document.getElementById('invoiceDate').value = today;
    document.getElementById('dueDate').value = dueDate;

    renderItems();
    attachListeners();
    updateAllPreviews();
}

function attachListeners() {
    // Dynamic text inputs
    Object.keys(inputMap).forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            inputEl.oninput = (e) => {
                const val = e.target.value;
                const prevEl = document.getElementById(inputMap[id]);
                if (prevEl) prevEl.innerText = val;

                // Toggle GSTIN visibility in preview if typing
                if ((id === 'senderGst' || id === 'clientGst') && val) {
                    document.getElementById(`prev-${id}Display`).style.display = 'block';
                } else if ((id === 'senderGst' || id === 'clientGst') && !val) {
                    document.getElementById(`prev-${id}Display`).style.display = 'none';
                }

                if (id === 'taxRate' || id === 'discountRate' || id === 'senderName') {
                    if (id === 'senderName') {
                        const notesName = document.getElementById('prev-notes-name');
                        if (notesName) notesName.innerText = val;
                    }
                    calculateTotals();
                }
            };
        }
    });

    document.getElementById('taxSystem').onchange = (e) => {
        const system = e.target.value;
        const gstFields = document.getElementById('gstFields');
        const simpleTaxRow = document.getElementById('simpleTaxRow');
        const gstTaxRows = document.getElementById('gstTaxRows');
        const taxRateLabel = document.querySelector('label[for="taxRate"]') || document.querySelector('.form-group label:contains("Tax")');

        if (system === 'gst') {
            gstFields.style.display = 'block';
            simpleTaxRow.style.display = 'none';
            gstTaxRows.style.display = 'block';
            // Also update input label for clarity
            document.querySelector('#taxRate').previousElementSibling.innerText = 'GST Rate (%)';
        } else {
            gstFields.style.display = 'none';
            simpleTaxRow.style.display = 'flex';
            gstTaxRows.style.display = 'none';
            document.querySelector('#taxRate').previousElementSibling.innerText = 'Tax (%)';
            // Hide preview GSTINs
            document.getElementById('prev-senderGstDisplay').style.display = 'none';
            document.getElementById('prev-clientGstDisplay').style.display = 'none';
        }
        calculateTotals();
    };

    document.getElementById('currency').onchange = () => {
        calculateTotals();
        renderItems();
    };

    addItemBtn.onclick = () => {
        const newItem = {
            id: Date.now(),
            description: '',
            quantity: 1,
            price: 0
        };
        items.push(newItem);
        renderItems();
        calculateTotals();
    };

    printBtn.onclick = () => window.print();

    const toggleModeBtn = document.getElementById('toggleModeBtn');
    const invoiceSheet = document.getElementById('invoiceSheet');
    const modeStatus = document.getElementById('modeStatus');

    toggleModeBtn.onclick = () => {
        const isCompact = invoiceSheet.classList.toggle('compact');
        modeStatus.innerText = isCompact ? 'ON' : 'OFF';
        toggleModeBtn.classList.toggle('btn-primary');
        toggleModeBtn.classList.toggle('btn-outline');
    };

    resetBtn.onclick = () => {
        if (confirm('Are you sure you want to reset everything?')) {
            location.reload();
        }
    };
}

function renderItems() {
    itemList.innerHTML = '';

    items.forEach((item, index) => {
        // Editor Row
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="text" placeholder="Description" value="${item.description}" 
                oninput="updateItem(${item.id}, 'description', this.value)">
            <input type="number" placeholder="Qty" value="${item.quantity}" 
                oninput="updateItem(${item.id}, 'quantity', this.value)">
            <input type="number" placeholder="Price" value="${item.price}" 
                oninput="updateItem(${item.id}, 'price', this.value)">
            <button class="btn btn-danger" onclick="removeItem(${item.id})">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
        `;
        itemList.appendChild(row);
    });

    lucide.createIcons();
    renderPreviewItems();
    calculateTotals();
}

function updateItem(id, field, value) {
    const item = items.find(i => i.id === id);
    if (item) {
        if (field === 'quantity' || field === 'price') {
            item[field] = parseFloat(value) || 0;
        } else {
            item[field] = value;
        }
    }
    // Update live preview only, don't re-render editor list to keep focus
    calculateTotals();
    renderPreviewItems();
}

function renderPreviewItems() {
    prevItems.innerHTML = '';
    const currency = document.getElementById('currency').value;

    items.forEach(item => {
        const prevRow = document.createElement('tr');
        prevRow.style.borderBottom = '1px solid #f1f5f9';
        prevRow.innerHTML = `
            <td style="padding: 15px 0;">${item.description || 'New Item'}</td>
            <td style="padding: 15px 0; text-align: center;">${item.quantity}</td>
            <td style="padding: 15px 0; text-align: right;">${currency}${item.price.toLocaleString()}</td>
            <td style="padding: 15px 0; text-align: right; font-weight: 600;">${currency}${(item.quantity * item.price).toLocaleString()}</td>
        `;
        prevItems.appendChild(prevRow);
    });
}

function removeItem(id) {
    items = items.filter(i => i.id !== id);
    renderItems(); // Re-render editor list because a row was removed
}

function calculateTotals() {
    const currency = document.getElementById('currency').value;
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;
    const taxSystem = document.getElementById('taxSystem').value;

    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.quantity * item.price;
    });

    let taxAmount = 0;
    if (taxSystem === 'gst') {
        const gstHalf = taxRate / 2;
        const cgstAmount = subtotal * (gstHalf / 100);
        const sgstAmount = subtotal * (gstHalf / 100);
        taxAmount = cgstAmount + sgstAmount;

        document.getElementById('prev-cgstRate').innerText = gstHalf.toFixed(1);
        document.getElementById('prev-sgstRate').innerText = gstHalf.toFixed(1);
        document.getElementById('prev-cgstAmount').innerText = `${currency}${cgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        document.getElementById('prev-sgstAmount').innerText = `${currency}${sgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    } else {
        taxAmount = subtotal * (taxRate / 100);
        document.getElementById('prev-taxAmount').innerText = `${currency}${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    const discountAmount = subtotal * (discountRate / 100);
    const total = subtotal + taxAmount - discountAmount;

    document.getElementById('prev-subtotal').innerText = `${currency}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('prev-discountAmount').innerText = `-${currency}${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('prev-total').innerText = `${currency}${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function updateAllPreviews() {
    Object.keys(inputMap).forEach(id => {
        const input = document.getElementById(id);
        const prev = document.getElementById(inputMap[id]);
        if (input && prev) prev.innerText = input.value;
    });
    const notesName = document.getElementById('prev-notes-name');
    if (notesName) notesName.innerText = document.getElementById('senderName').value;
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Error', err));
    });
}

// PWA Install Logic
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-flex';
});

installBtn.onclick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.style.display = 'none';
        }
        deferredPrompt = null;
    }
};

// Start
init();
