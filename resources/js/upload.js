let fileInput = $('#file');
fileInput.on('change', (e) => {
    let formdata = new FormData();
    let file = e.target.files[0];
    formdata.append('file', file);
    formdata.append('size', file.size);
    formdata.append('type', file.type);

    if (!(/image\/(jpg|jpeg|png)$/i).test(file.type)) {
        $('p').text('invalid type');
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    xhr.onload = () => {
        $('p').text(file.type);
    }
    xhr.send(formdata);
});
