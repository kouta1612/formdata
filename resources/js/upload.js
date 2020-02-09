let fileInput = $('#file');
fileInput.on('change', (e) => {
    let formdata = new FormData();
    formdata.append('file', e.target.files[0]);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    xhr.send(formdata);
    xhr.onload = () => {
        console.log(JSON.parse(xhr.response).url);
        let body = $('body');
        let img = document.createElement('img');
        img.src = JSON.parse(xhr.response).url;
        body.append(img);
    }
});
