document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('history-table-body');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const refreshBtn = document.getElementById('refresh-btn');

    // Modal Elements
    const modal = document.getElementById('details-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');

    async function fetchHistory() {
        loadingState.classList.remove('hidden');
        tableBody.innerHTML = '';
        emptyState.classList.add('hidden');

        try {
            const response = await fetch('http://127.0.0.1:5000/history');
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                renderHistory(data.data);
            } else {
                emptyState.classList.remove('hidden');
            }
        } catch (error) {
            console.error(error);
            emptyState.innerHTML = '<p style="color: var(--error)">Failed to fetch history from server.</p>';
            emptyState.classList.remove('hidden');
        } finally {
            loadingState.classList.add('hidden');
        }
    }

    function renderHistory(history) {
        history.forEach(item => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--glass-border)';
            row.style.transition = 'background 0.3s';
            row.onmouseover = () => row.style.background = 'rgba(255,255,255,0.02)';
            row.onmouseout = () => row.style.background = 'transparent';

            const date = new Date(item.timestamp).toLocaleString();
            const riskClass = item.risk === 'High' ? 'badge-error' : (item.risk === 'Medium' ? 'badge-warning' : 'badge-safe');

            row.innerHTML = `
                <td style="padding: 1.25rem 1.5rem; font-size: 0.9rem;">${date}</td>
                <td style="padding: 1.25rem 1.5rem; font-weight: 600;">${item.type}</td>
                <td style="padding: 1.25rem 1.5rem;"><span style="font-size: 0.85rem; font-weight: 500;">${item.verdict}</span></td>
                <td style="padding: 1.25rem 1.5rem;"><span class="badge ${riskClass}">${item.risk}</span></td>
                <td style="padding: 1.25rem 1.5rem; font-family: monospace;">${item.score}%</td>
                <td style="padding: 1.25rem 1.5rem;">
                    <button class="view-btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" data-id="${item.id}">View Payload</button>
                </td>
            `;

            row.querySelector('.view-btn').addEventListener('click', () => showDetails(item));
            tableBody.appendChild(row);
        });
    }

    function showDetails(item) {
        modalTitle.textContent = `${item.type} Detailed Log`;
        modalContent.textContent = JSON.stringify(item.details, null, 4);
        modal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    refreshBtn.addEventListener('click', fetchHistory);

    // Initial Fetch
    fetchHistory();
});
