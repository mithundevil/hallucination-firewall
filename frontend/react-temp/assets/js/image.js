document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const imageInput = document.getElementById('image-upload');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('loader');
    const resultsCard = document.getElementById('results-card');

    // Result UI Elements
    const verdictLabel = document.getElementById('verdict-label');
    const riskBadge = document.getElementById('risk-badge');
    const confidenceVal = document.getElementById('confidence-val');
    const confidenceBar = document.getElementById('confidence-bar');
    const explanationText = document.getElementById('explanation-text');

    let selectedFile = null;

    // File selection
    dropZone.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--glass-border)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--glass-border)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleFile(file);
    });

    function handleFile(file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
            dropZone.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = null;
        imageInput.value = '';
        previewContainer.classList.add('hidden');
        dropZone.classList.remove('hidden');
    });

    // Analysis
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Please upload an image first.');
            return;
        }

        // Loading state
        analyzeBtn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        resultsCard.style.opacity = '1';

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('http://127.0.0.1:5000/analyze/image', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                updateUI(data.data);
            } else {
                alert('Backend Error: ' + data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Could not connect to the backend server. Make sure Flask is running on port 5000.');
        } finally {
            analyzeBtn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });

    function updateUI(data) {
        verdictLabel.textContent = data.result;
        verdictLabel.style.color = data.result === "AI Generated" ? 'var(--error)' : 'var(--success)';

        riskBadge.textContent = data.risk_level + " Risk";
        riskBadge.classList.remove('hidden', 'badge-safe', 'badge-warning', 'badge-error');

        const riskClass = data.risk_level === "High" ? 'badge-error' : (data.risk_level === "Medium" ? 'badge-warning' : 'badge-safe');
        riskBadge.classList.add(riskClass);

        confidenceVal.textContent = data.confidence + "%";
        confidenceBar.style.width = data.confidence + "%";

        explanationText.innerHTML = data.explanation.replace(/\|/g, '<br>• ');

        resultsCard.style.animation = 'fadeIn 0.5s ease-out';
    }
});
