let fileInput = $('#file');
fileInput.on('change', (e) => {
    let file = e.target.files[0];
    $.ajax({
        url: '/api/signature',
        type: 'POST',
        data: {
            size: file.size,
            type: file.type
        },
        dataType: 'json'
    }).then((response) => {
        let key, formData = new FormData();
        for (key in response.data) {
            if (response.data.hasOwnProperty(key)) {
                formdata.append(key, response.data[key]);
            }
        }
        formdata.append('file', file);

        return $.ajax({
            url: response.url,
            type: 'POST',
            data: formData,
            dataType: 'xml',
            processData: false,
            contentType: false
        }).catch((error) => {
            console.log('署名作成エラー');
            console.log(error);
        });
    }).then((response) => {
        let body = $('body');
        let img = document.createElement('img');
        img.src = $(response).find('Location').first().text();
        body.append(img);
    })
});
