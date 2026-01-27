document.addEventListener('DOMContentLoaded', () => {
    // Stage Containers
    const step1Card = document.getElementById('step-1-card');
    const step2Card = document.getElementById('step-2-card');
    const step3Card = document.getElementById('step-3-card');

    // Indicators
    const indicators = [
        document.getElementById('step-1-indicator'),
        document.getElementById('step-2-indicator'),
        document.getElementById('step-3-indicator')
    ];

    // Inputs
    const textInput = document.getElementById('text-input');
    const imageInput = document.getElementById('image-upload');
    const dropZone = document.getElementById('drop-zone');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('image-preview');

    // Buttons
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');

    // UI Results
    const verdictLabel = document.getElementById('verdict-label');
    const riskBadge = document.getElementById('risk-badge');
    const decisionText = document.getElementById('decision-text');
    const scoreVal = document.getElementById('score-val');
    const scoreBar = document.getElementById('score-bar');
    const verdictIcon = document.getElementById('verdict-icon');

    let selectedFile = null;

    // File handling
    dropZone.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
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

    // Step Transition Logic
    nextBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text && !selectedFile) {
            alert('Please provide at least text or an image payload.');
            return;
        }

        // Move to Step 2
        goToStep(2);

        const formData = new FormData();
        formData.append('text', text);
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            // Artificial delay for "Verification" feel
            await new Promise(r => setTimeout(r, 1500));

            const response = await fetch('http://127.0.0.1:5000/analyze/firewall', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                updateResults(data.data.firewall_verdict);
                goToStep(3);
            } else {
                alert('Firewall Error: ' + data.message);
                goToStep(1);
            }
        } catch (error) {
            console.error(error);
            alert('Connection to Firewall API failed.');
            goToStep(1);
        }
    });

    resetBtn.addEventListener('click', () => {
        selectedFile = null;
        textInput.value = '';
        imageInput.value = '';
        previewContainer.classList.add('hidden');
        dropZone.classList.remove('hidden');
        goToStep(1);
    });

    function goToStep(stepNum) {
        // Update Cards
        [step1Card, step2Card, step3Card].forEach((card, idx) => {
            if (idx + 1 === stepNum) card.classList.remove('hidden');
            else card.classList.add('hidden');
        });

        // Update Indicators
        indicators.forEach((ind, idx) => {
            if (idx + 1 === stepNum) {
                ind.style.color = 'var(--primary)';
                ind.querySelector('div').style.borderColor = 'var(--primary)';
            } else if (idx + 1 < stepNum) {
                ind.style.color = 'var(--success)';
                ind.querySelector('div').style.borderColor = 'var(--success)';
            } else {
                ind.style.color = 'var(--text-dim)';
                ind.querySelector('div').style.borderColor = 'var(--glass-border)';
            }
        });
    }

    function updateResults(firewall) {
        verdictLabel.textContent = firewall.verdict;
        decisionText.textContent = firewall.decision;
        scoreVal.textContent = firewall.score + "%";
        scoreBar.style.width = firewall.score + "%";

        riskBadge.textContent = firewall.risk_level + " RISK";
        riskBadge.classList.remove('badge-safe', 'badge-warning', 'badge-error');

        const badgeClass = firewall.verdict === "BLOCKED" ? 'badge-error' : (firewall.verdict === "WARNING" ? 'badge-warning' : 'badge-safe');
        riskBadge.classList.add(badgeClass);

        // Icon Logic
        let iconHtml = '';
        if (firewall.verdict === "SAFE") {
            iconHtml = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
            verdictLabel.style.color = 'var(--success)';
        } else if (firewall.verdict === "WARNING") {
            iconHtml = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            verdictLabel.style.color = 'var(--warning)';
        } else {
            iconHtml = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            verdictLabel.style.color = 'var(--error)';
        }
        verdictIcon.innerHTML = iconHtml;
    }
});
