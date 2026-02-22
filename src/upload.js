let uploadedEdges = [];

/**
 * Called by the file <input> onChange event.
 * Reads the selected file and parses it into an edge list.
 */
function handleFile(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            uploadedEdges = [];
            for (const row of rows) {
                if (!row || row.length < 2) continue;
                const u = parseInt(row[0]);
                const v = parseInt(row[1]);
                if (!isNaN(u) && !isNaN(v)) uploadedEdges.push([u, v]);
            }

            document.getElementById('uploadStatus').textContent =
                `✓ Loaded ${uploadedEdges.length} edges from "${file.name}"`;
            notify(`${uploadedEdges.length} edges loaded`);
        } catch (err) {
            document.getElementById('uploadStatus').textContent =
                '✗ Error reading file — make sure it is a valid .xlsx, .xls or .csv';
        }
    };

    reader.readAsArrayBuffer(file);
}

const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag');
});

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag');

    const file = e.dataTransfer.files[0];
    if (!file) return;
    const fileInput = document.getElementById('fileInput');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    handleFile(fileInput);
});