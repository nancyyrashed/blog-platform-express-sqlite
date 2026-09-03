function copyToClipboard(id) {
    var copyText = location.origin + "/reader/article?id=" + id;
    navigator.clipboard.writeText(copyText);
    alert(`Copied link to Clipboard: \n ${copyText}.`);
}
