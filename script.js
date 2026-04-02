(function() {
    'use strict';

    const AUTO_GENERATE_DELAY = 500;

    let currentQRCode = null;
    let currentQRData = null;
    let autoGenerateTimeout = null;

    const elements = {
        contentInput: document.getElementById('contentInput'),
        clearInput: document.getElementById('clearInput'),
        generateBtn: document.getElementById('generateBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        copyBtn: document.getElementById('copyBtn'),
        shareBtn: document.getElementById('shareBtn'),
        qrDisplay: document.getElementById('qrDisplay'),
        qrPlaceholder: document.getElementById('qrPlaceholder'),
        qrResult: document.getElementById('qrResult'),
        qrWrapper: document.getElementById('qrWrapper'),
        qrInfo: document.getElementById('qrInfo'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        actionsSection: document.getElementById('actionsSection'),
        typeBadge: document.getElementById('typeBadge'),
        errorMessage: document.getElementById('errorMessage'),
        themeToggle: document.getElementById('themeToggle'),
        dragDropOverlay: document.getElementById('dragDropOverlay'),
        qrColor: document.getElementById('qrColor'),
        bgColor: document.getElementById('bgColor'),
        toast: document.getElementById('toast')
    };

    const sizeBtns = document.querySelectorAll('.size-btn');

    function init() {
        loadTheme();
        bindEvents();
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('qrcode_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function bindEvents() {
        elements.generateBtn.addEventListener('click', generateQRCode);
        elements.contentInput.addEventListener('input', handleInput);
        elements.contentInput.addEventListener('dragover', handleDragOver);
        elements.contentInput.addEventListener('dragleave', handleDragLeave);
        elements.contentInput.addEventListener('drop', handleDrop);
        elements.clearInput.addEventListener('click', clearInput);
        elements.downloadBtn.addEventListener('click', downloadQRCode);
        elements.copyBtn.addEventListener('click', copyContent);
        elements.shareBtn.addEventListener('click', shareQRCode);
        elements.themeToggle.addEventListener('click', toggleTheme);
        elements.qrColor.addEventListener('input', debounce(generateQRCode, 300));
        elements.bgColor.addEventListener('input', debounce(generateQRCode, 300));

        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => selectSize(btn));
        });

        window.addEventListener('beforeunload', () => {
            if (autoGenerateTimeout) {
                clearTimeout(autoGenerateTimeout);
            }
        });
    }

    function handleInput(e) {
        const value = e.target.value;
        detectContentType(value);
        showError('');

        if (value.trim()) {
            autoGenerateTimeout = setTimeout(() => {
                generateQRCode();
            }, AUTO_GENERATE_DELAY);
        } else {
            if (autoGenerateTimeout) {
                clearTimeout(autoGenerateTimeout);
            }
            hideQRResult();
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dragDropOverlay.classList.add('active');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dragDropOverlay.classList.remove('active');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dragDropOverlay.classList.remove('active');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('text/') || file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    elements.contentInput.value = event.target.result;
                    elements.contentInput.dispatchEvent(new Event('input'));
                    showToast('Texto carregado com sucesso!');
                };
                reader.readAsText(file);
            }
        }

        const text = e.dataTransfer.getData('text');
        if (text) {
            elements.contentInput.value = text;
            elements.contentInput.dispatchEvent(new Event('input'));
        }
    }

    function detectContentType(content) {
        const badge = elements.typeBadge;
        let type = null;
        let icon = '';
        let label = '';

        if (!content.trim()) {
            badge.classList.remove('visible');
            return;
        }

        const urlPattern = /^https?:\/\/[^\s]+$/i;
        const phonePattern = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (urlPattern.test(content)) {
            type = 'URL';
            icon = '🔗';
            label = 'URL';
        } else if (emailPattern.test(content)) {
            type = 'Email';
            icon = '📧';
            label = 'Email';
        } else if (phonePattern.test(content.replace(/\s/g, ''))) {
            type = 'Telefone';
            icon = '📞';
            label = 'Telefone';
        } else if (content.startsWith('BEGIN:VCARD')) {
            type = 'Contato';
            icon = '👤';
            label = 'Contato';
        } else if (content.startsWith('WIFI:')) {
            type = 'WiFi';
            icon = '📶';
            label = 'WiFi';
        } else {
            type = 'Texto';
            icon = '📝';
            label = 'Texto';
        }

        badge.innerHTML = `<span class="type-icon">${icon}</span><span class="type-text">${label}</span>`;
        badge.classList.add('visible');
    }

    function getSelectedSize() {
        const activeBtn = document.querySelector('.size-btn.active');
        return activeBtn ? parseInt(activeBtn.dataset.size) : 256;
    }

    function selectSize(btn) {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (currentQRData) {
            generateQRCode();
        }
    }

    function showError(message) {
        elements.errorMessage.textContent = message;
    }

    function showLoading() {
        elements.qrPlaceholder.style.display = 'none';
        elements.qrResult.classList.remove('visible');
        elements.loadingSpinner.classList.add('visible');
    }

    function hideLoading() {
        elements.loadingSpinner.classList.remove('visible');
    }

    function showQRResult() {
        hideLoading();
        elements.qrResult.classList.add('visible');
        enableActions();
    }

    function hideQRResult() {
        elements.qrPlaceholder.style.display = 'flex';
        elements.qrResult.classList.remove('visible');
        hideLoading();
        disableActions();
    }

    function enableActions() {
        elements.downloadBtn.disabled = false;
        elements.copyBtn.disabled = false;
        elements.shareBtn.disabled = false;
    }

    function disableActions() {
        elements.downloadBtn.disabled = true;
        elements.copyBtn.disabled = true;
        elements.shareBtn.disabled = true;
    }

    function generateQRCode() {
        const content = elements.contentInput.value.trim();

        if (!content) {
            showError('Por favor, digite algum conteúdo para gerar o QR Code.');
            hideQRResult();
            return;
        }

        showError('');
        showLoading();

        const size = getSelectedSize();
        const qrColor = elements.qrColor.value;
        const bgColor = elements.bgColor.value;

        elements.qrWrapper.innerHTML = '';

        try {
            if (currentQRCode) {
                currentQRCode.clear();
            }

            currentQRCode = new QRCode(elements.qrWrapper, {
                text: content,
                width: size,
                height: size,
                colorDark: qrColor,
                colorLight: bgColor,
                correctLevel: QRCode.CorrectLevel.M
            });

            currentQRData = {
                content: content,
                size: size,
                qrColor: qrColor,
                bgColor: bgColor,
                timestamp: Date.now()
            };

            setTimeout(() => {
                const canvas = elements.qrWrapper.querySelector('canvas');
                if (canvas) {
                    const canvasSize = getCanvasFileSize(canvas);
                    elements.qrInfo.textContent = `Tamanho: ${size}x${size}px | ~${canvasSize}`;
                }
                showQRResult();
            }, 100);

        } catch (error) {
            console.error('Error generating QR Code:', error);
            showError('Erro ao gerar QR Code. Tente um conteúdo menor.');
            hideLoading();
        }
    }

    function getCanvasFileSize(canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        if (!base64) return '0 B';
        const size = (base64.length * 3) / 4;
        if (size < 1024) {
            return Math.round(size) + ' B';
        } else if (size < 1024 * 1024) {
            return Math.round(size / 1024) + ' KB';
        } else {
            return (size / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }

    function createStyledQRImage(sourceCanvas, bgColor) {
        const size = sourceCanvas.width;
        const padding = Math.round(size * 0.08);
        const borderRadius = Math.round(size * 0.1);
        const outputSize = size + padding * 2;

        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = outputSize;
        outputCanvas.height = outputSize;
        const ctx = outputCanvas.getContext('2d');

        ctx.fillStyle = bgColor;
        roundRect(ctx, 0, 0, outputSize, outputSize, borderRadius);
        ctx.fill();

        ctx.drawImage(sourceCanvas, padding, padding, size, size);

        return outputCanvas;
    }

    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function downloadQRCode() {
        if (!currentQRData) return;

        const canvas = elements.qrWrapper.querySelector('canvas');
        if (!canvas) {
            const img = elements.qrWrapper.querySelector('img');
            if (img) {
                const link = document.createElement('a');
                const fileName = `qrcode_${Date.now()}.png`;
                link.download = fileName;
                link.href = img.src;
                link.click();
                showToast('QR Code baixado!', 'success');
                return;
            }
            showToast('QR Code não disponível para download', 'error');
            return;
        }

        const styledCanvas = createStyledQRImage(canvas, currentQRData.bgColor);

        const link = document.createElement('a');
        const fileName = `qrcode_${Date.now()}.png`;
        link.download = fileName;
        link.href = styledCanvas.toDataURL('image/png');
        link.click();

        showToast('QR Code baixado!', 'success');
    }

    async function copyContent() {
        if (!currentQRData) return;

        try {
            await navigator.clipboard.writeText(currentQRData.content);
            showToast('Conteúdo copiado!', 'success');
        } catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = currentQRData.content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Conteúdo copiado!', 'success');
        }
    }

    async function shareQRCode() {
        if (!currentQRData) return;

        const canvas = elements.qrWrapper.querySelector('canvas');
        
        if (canvas) {
            const styledCanvas = createStyledQRImage(canvas, currentQRData.bgColor);
            styledCanvas.toBlob(async (blob) => {
                try {
                    if (navigator.share && navigator.canShare) {
                        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                        const shareData = {
                            files: [file],
                            title: 'QR Code',
                            text: `QR Code: ${currentQRData.content.substring(0, 50)}${currentQRData.content.length > 50 ? '...' : ''}`
                        };
                        
                        if (navigator.canShare(shareData)) {
                            await navigator.share(shareData);
                            return;
                        }
                    }
                    
                    fallbackShare(blob);
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        fallbackShare(blob);
                    }
                }
            });
        } else {
            fallbackShare(null);
        }
    }

    function fallbackShare(blob) {
        if (blob && navigator.clipboard && navigator.clipboard.write) {
            try {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]);
                showToast('Imagem copiada para a área de transferência!', 'success');
            } catch (error) {
                downloadQRCode();
                showToast('Baixando imagem...', 'success');
            }
        } else {
            downloadQRCode();
            showToast('Baixando imagem...', 'success');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('qrcode_theme', newTheme);
    }

    function clearInput() {
        elements.contentInput.value = '';
        elements.contentInput.focus();
        hideQRResult();
        showError('');
        detectContentType('');
    }

    function showToast(message, type = '') {
        const toast = elements.toast;
        toast.querySelector('.toast-message').textContent = message;
        toast.className = 'toast visible';
        if (type) {
            toast.classList.add(type);
        }

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 2500);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    document.addEventListener('DOMContentLoaded', init);
})();
