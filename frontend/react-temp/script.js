document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = imagePreview.querySelector('img');
    const removeImgBtn = document.getElementById('remove-img');
    const analyzeBtn = document.getElementById('analyze-btn');
    const textInput = document.getElementById('text-input');
    const resultsDisplay = document.getElementById('results-display');
    const loader = analyzeBtn.querySelector('.loader');
    const btnText = analyzeBtn.querySelector('.btn-text');

    // UI Result Elements
    const statusBadge = document.getElementById('status-badge');
    const imgAuthVal = document.getElementById('img-auth-val');
    const riskVal = document.getElementById('risk-val');
    const confidencePercent = document.getElementById('confidence-percent');
    const progressFill = document.getElementById('progress-fill');
    const explanationText = document.getElementById('explanation-text');
    const textScoreVal = document.getElementById('text-score');

    let selectedFile = null;

    // Handle Drop Zone Click
    dropZone.addEventListener('click', () => imageUpload.click());

    // Handle File Selection
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    function handleFileSelect(file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
            dropZone.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Remove Image
    removeImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = null;
        imageUpload.value = '';
        imagePreview.classList.add('hidden');
        dropZone.classList.remove('hidden');
    });

    // Drag and Drop Logic
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
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    });

    // Analyze Button logic
    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();

        if (!text && !selectedFile) {
            alert('Please provide some text or an image to analyze.');
            return;
        }

        // UI Loading State
        analyzeBtn.disabled = true;
        loader.classList.remove('hidden');
        btnText.textContent = 'Analyzing System...';
        resultsDisplay.classList.add('hidden');

        const formData = new FormData();
        formData.append('text', text);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/analyze', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                updateUI(result.data);
            } else {
                alert('Analysis failed: ' + result.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to the backend. Is the Flask server running?');
        } finally {
            analyzeBtn.disabled = false;
            loader.classList.add('hidden');
            btnText.textContent = 'Run Security Scan';
        }
    });

    function updateUI(data) {
        resultsDisplay.classList.remove('hidden');

        const firewall = data.firewall_system;
        const imgAnalysis = data.image_analysis;
        const textAnalysis = data.text_analysis;

        // Set Risk Badge
        statusBadge.textContent = firewall.overall_risk + " Risk";
        statusBadge.className = 'badge badge-' + firewall.overall_risk.toLowerCase();

        // Details
        imgAuthVal.textContent = imgAnalysis ? imgAnalysis.result : 'N/A';
        riskVal.textContent = firewall.overall_risk;

        // Progress Bar
        const score = firewall.overall_score;
        confidencePercent.textContent = score + "%";
        progressFill.style.width = score + "%";

        // Explanation
        let fullExplanation = `<strong>Firewall Decision:</strong> ${firewall.decision}<br><br>`;

        if (imgAnalysis) {
            fullExplanation += `<strong>Image Analysis:</strong> ${imgAnalysis.explanation}<br>`;
        }

        fullExplanation += `<strong>Text Analysis:</strong> ${textAnalysis.explanation}`;

        explanationText.innerHTML = fullExplanation;
        textScoreVal.textContent = textAnalysis.score;

        // Scroll to results
        resultsDisplay.scrollIntoView({ behavior: 'smooth' });
    }
});
