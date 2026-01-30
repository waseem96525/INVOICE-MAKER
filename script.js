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
    'discountRate': 'prev-discountRateDisplay',
    'accentColor': null,
    'upiId': null,
    'bankName': 'prev-bankName',
    'accNo': 'prev-accNo',
    'ifscCode': 'prev-ifscCode'
};

// Initialization
function init() {
    loadFromLocalStorage();

    // Set default dates if empty
    if (!document.getElementById('invoiceDate').value) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = today;
    }
    if (!document.getElementById('dueDate').value) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        document.getElementById('dueDate').value = nextMonth.toISOString().split('T')[0];
    }

    renderItems();
    attachListeners();
    updateAllPreviews();
}

function saveToLocalStorage() {
    const data = {
        items: items,
        inputs: {}
    };
    Object.keys(inputMap).forEach(id => {
        data.inputs[id] = document.getElementById(id).value;
    });
    data.inputs.taxSystem = document.getElementById('taxSystem').value;
    data.darkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('invoicely_draft', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('invoicely_draft');
    if (saved) {
        const data = JSON.parse(saved);
        items = data.items;
        Object.keys(data.inputs).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = data.inputs[id];
        });

        // Restore dark mode
        if (data.darkMode) {
            document.body.classList.add('dark-mode');
            setTimeout(() => {
                const icon = document.querySelector('#darkModeBtn i');
                if (icon) icon.setAttribute('data-lucide', 'sun');
                lucide.createIcons();
            }, 100);
        }

        // Restore accent color
        if (data.inputs.accentColor) {
            document.documentElement.style.setProperty('--primary', data.inputs.accentColor);
        }

        // Trigger tax system toggle visibility
        document.getElementById('taxSystem').dispatchEvent(new Event('change'));
    }
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

                if (id === 'senderGst' || id === 'clientGst') {
                    const displayEl = document.getElementById(`prev-${id}Display`);
                    if (displayEl) displayEl.style.display = val ? 'block' : 'none';
                }

                if (id === 'upiId' || id === 'bankName' || id === 'accNo' || id === 'ifscCode') {
                    updatePaymentDisplay();
                }

                if (id === 'taxRate' || id === 'discountRate' || id === 'senderName') {
                    if (id === 'senderName') {
                        const notesName = document.getElementById('prev-notes-name');
                        if (notesName) notesName.innerText = val;
                    }
                    calculateTotals();
                }
                saveToLocalStorage();
            };
        }
    });

    document.getElementById('taxSystem').onchange = (e) => {
        const system = e.target.value;
        const gstFields = document.getElementById('gstFields');
        const simpleTaxRow = document.getElementById('simpleTaxRow');
        const gstTaxRows = document.getElementById('gstTaxRows');

        if (system === 'gst') {
            gstFields.style.display = 'block';
            simpleTaxRow.style.display = 'none';
            gstTaxRows.style.display = 'block';
            document.querySelector('#taxRate').previousElementSibling.innerText = 'GST Rate (%)';
        } else {
            gstFields.style.display = 'none';
            simpleTaxRow.style.display = 'flex';
            gstTaxRows.style.display = 'none';
            document.querySelector('#taxRate').previousElementSibling.innerText = 'Tax (%)';
            document.getElementById('prev-senderGstDisplay').style.display = 'none';
            document.getElementById('prev-clientGstDisplay').style.display = 'none';
        }
        calculateTotals();
        saveToLocalStorage();
    };

    document.getElementById('gstType').onchange = () => {
        calculateTotals();
        saveToLocalStorage();
    };

    document.getElementById('currency').onchange = () => {
        calculateTotals();
        renderItems();
    };

    // Branding Listeners
    document.getElementById('accentColor').oninput = (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary-hover', color + 'ee');
        calculateTotals();
    };

    document.getElementById('logoInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.getElementById('prev-logo');
                img.src = event.target.result;
                document.getElementById('logoContainer').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('sigInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.getElementById('prev-sig');
                img.src = event.target.result;
                document.getElementById('sigContainer').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
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
        saveToLocalStorage();
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

    document.getElementById('exportCsvBtn').onclick = () => {
        let csv = 'Description,Quantity,Price,Total\n';
        items.forEach(item => {
            csv += `"${item.description}",${item.quantity},${item.price},${item.quantity * item.price}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `invoice_${document.getElementById('invoiceNumber').value}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    document.getElementById('darkModeBtn').onclick = () => {
        document.body.classList.toggle('dark-mode');
        const icon = document.querySelector('#darkModeBtn i');
        if (document.body.classList.contains('dark-mode')) {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
        saveToLocalStorage();
    };

    document.getElementById('downloadPdfBtn').onclick = () => {
        const element = document.getElementById('invoiceSheet');
        const opt = {
            margin: 0,
            filename: `invoice_${document.getElementById('invoiceNumber').value}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Temporarily reset transform for clean capture
        const originalTransform = element.style.transform;
        element.style.transform = 'scale(1)';

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.transform = originalTransform;
        });
    };

    document.getElementById('saveInvoiceBtn').onclick = () => {
        const history = JSON.parse(localStorage.getItem('invoicely_history') || '[]');
        const invoiceData = {
            id: Date.now(),
            number: document.getElementById('invoiceNumber').value,
            client: document.getElementById('clientName').value,
            total: document.getElementById('prev-total').innerText,
            date: document.getElementById('invoiceDate').value,
            fullData: {
                items: items,
                inputs: {}
            }
        };

        Object.keys(inputMap).forEach(key => {
            invoiceData.fullData.inputs[key] = document.getElementById(key).value;
        });
        invoiceData.fullData.inputs.taxSystem = document.getElementById('taxSystem').value;
        invoiceData.fullData.inputs.gstType = document.getElementById('gstType').value;

        history.unshift(invoiceData);
        localStorage.setItem('invoicely_history', JSON.stringify(history.slice(0, 10))); // Keep last 10
        renderHistory();
        alert('Invoice saved to history!');
    };

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('invoicely_history') || '[]');
        const list = document.getElementById('historyList');
        const section = document.getElementById('historySection');

        if (history.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        list.innerHTML = '';

        history.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 10px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;';
            div.innerHTML = `
                <div style="cursor: pointer; flex: 1;" onclick="loadFromHistory(${item.id})">
                    <p style="font-weight: 600; margin: 0;">${item.number}</p>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">${item.client} | ${item.total}</p>
                </div>
                <button class="btn btn-danger" style="padding: 5px; height: 30px; width: 30px;" onclick="deleteFromHistory(${item.id})">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
            `;
            list.appendChild(div);
        });
        lucide.createIcons();
    }

    window.loadFromHistory = (id) => {
        const history = JSON.parse(localStorage.getItem('invoicely_history') || '[]');
        const record = history.find(r => r.id === id);
        if (record && confirm(`Load Invoice ${record.number}? current draft will be overwritten.`)) {
            items = record.fullData.items;
            Object.keys(record.fullData.inputs).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.value = record.fullData.inputs[key];
            });
            renderItems();
            updateAllPreviews();
            saveToLocalStorage();
        }
    };

    window.deleteFromHistory = (id) => {
        if (confirm('Delete this invoice from history?')) {
            let history = JSON.parse(localStorage.getItem('invoicely_history') || '[]');
            history = history.filter(r => r.id !== id);
            localStorage.setItem('invoicely_history', JSON.stringify(history));
            renderHistory();
        }
    };

    // Initial history render
    renderHistory();

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
    saveToLocalStorage();
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
    saveToLocalStorage();
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
        const gstType = document.getElementById('gstType').value;
        const gstTaxRows = document.getElementById('gstTaxRows');
        const igstTaxRow = document.getElementById('igstTaxRow');

        if (gstType === 'inter') {
            taxAmount = subtotal * (taxRate / 100);
            gstTaxRows.style.display = 'none';
            igstTaxRow.style.display = 'flex';
            document.getElementById('prev-igstRate').innerText = taxRate;
            document.getElementById('prev-igstAmount').innerText = `${currency}${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        } else {
            const gstHalf = taxRate / 2;
            const cgstAmount = subtotal * (gstHalf / 100);
            const sgstAmount = subtotal * (gstHalf / 100);
            taxAmount = cgstAmount + sgstAmount;

            gstTaxRows.style.display = 'block';
            igstTaxRow.style.display = 'none';
            document.getElementById('prev-cgstRate').innerText = gstHalf.toFixed(1);
            document.getElementById('prev-sgstRate').innerText = gstHalf.toFixed(1);
            document.getElementById('prev-cgstAmount').innerText = `${currency}${cgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            document.getElementById('prev-sgstAmount').innerText = `${currency}${sgstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }
    } else {
        taxAmount = subtotal * (taxRate / 100);
        document.getElementById('prev-taxAmount').innerText = `${currency}${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        document.getElementById('igstTaxRow').style.display = 'none';
    }

    const discountAmount = subtotal * (discountRate / 100);
    const total = subtotal + taxAmount - discountAmount;

    document.getElementById('prev-subtotal').innerText = `${currency}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('prev-discountAmount').innerText = `-${currency}${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('prev-total').innerText = `${currency}${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    updatePaymentDisplay(); // Refresh QR amount
}

function updatePaymentDisplay() {
    const upiId = document.getElementById('upiId').value;
    const bankName = document.getElementById('bankName').value;
    const accNo = document.getElementById('accNo').value;
    const ifscCode = document.getElementById('ifscCode').value;
    const totalText = document.getElementById('prev-total').innerText;
    const amount = totalText.replace(/[^0-9.]/g, '');

    // Bank Info Visibility
    const hasBank = bankName || accNo || ifscCode;
    document.getElementById('prev-paymentInfo').style.display = hasBank ? 'inline' : 'none';

    // QR Code Generation
    const qrContainer = document.getElementById('qrContainer');
    if (upiId && amount > 0) {
        qrContainer.style.display = 'block';
        const senderName = document.getElementById('senderName').value || 'Business';
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(senderName)}&am=${amount}&cu=INR`;
        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
        document.getElementById('prev-qr').src = qrApi;
    } else {
        qrContainer.style.display = 'none';
    }
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
