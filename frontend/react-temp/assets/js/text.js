document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('loader');
    const resultsCard = document.getElementById('results-card');

    // UI Elements
    const verdictLabel = document.getElementById('verdict-label');
    const riskBadge = document.getElementById('risk-badge');
    const scoreVal = document.getElementById('score-val');
    const explanationText = document.getElementById('explanation-text');
    const categoryList = document.getElementById('category-list');

    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }

        // State update
        analyzeBtn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        resultsCard.style.opacity = '1';

        try {
            const response = await fetch('http://127.0.0.1:5000/analyze/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (data.success) {
                updateUI(data.data);
            } else {
                alert('Analysis failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to the backend server.');
        } finally {
            analyzeBtn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        resultsCard.style.opacity = '0.5';
        verdictLabel.textContent = 'Waiting for analysis...';
        riskBadge.classList.add('hidden');
        scoreVal.textContent = '0/100';
        explanationText.textContent = 'Detailed linguistic breakdown will appear here after scanning.';
        categoryList.innerHTML = '';
    });

    function updateUI(data) {
        scoreVal.textContent = `${data.score}/100`;
        verdictLabel.textContent = data.risk_level === "Low" ? "Low Risk Content" : (data.risk_level === "High" ? "High Risk Detected" : "Suspicious Content");

        riskBadge.textContent = data.risk_level + " Risk";
        riskBadge.classList.remove('hidden', 'badge-safe', 'badge-warning', 'badge-error');
        const badgeClass = data.risk_level === "High" ? 'badge-error' : (data.risk_level === "Medium" ? 'badge-warning' : 'badge-safe');
        riskBadge.classList.add(badgeClass);

        explanationText.textContent = data.explanation;

        // Categories simulation based on score for visual impact
        categoryList.innerHTML = '';
        const categories = [
            { name: "Over-confidence Markers", status: data.score > 40 ? "Critical" : "Clear" },
            { name: "Speculative Gaps", status: data.score > 20 ? "Detected" : "Clear" },
            { name: "Repetition Index", status: data.score > 60 ? "High" : "Optimal" }
        ];

        categories.forEach(cat => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.fontSize = '0.85rem';
            div.innerHTML = `<span>${cat.name}</span> <span style="font-weight: 700; color: ${cat.status === 'Clear' || cat.status === 'Optimal' ? 'var(--success)' : 'var(--error)'}">${cat.status}</span>`;
            categoryList.appendChild(div);
        });

        resultsCard.style.animation = 'fadeIn 0.5s ease-out';
    }
});
