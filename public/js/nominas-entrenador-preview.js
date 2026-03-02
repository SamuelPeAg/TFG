function abrirModalPreview(previewUrl, downloadUrl) {
    const modal = document.getElementById('modalPDFPreview');
    const iframe = document.getElementById('pdfPreviewIframe');
    const downloadBtn = document.getElementById('btnDownloadPDFModal');
    const spinner = document.getElementById('pdfLoadingSpinner');

    spinner.classList.remove('hidden');
    downloadBtn.href = downloadUrl;
    iframe.src = previewUrl;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function cerrarModalPreview() {
    const modal = document.getElementById('modalPDFPreview');
    const iframe = document.getElementById('pdfPreviewIframe');
    
    iframe.src = '';
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}
