let fileInput = $('#file');
fileInput.on('change', (e) => {
    let file = e.target.files[0];
    $.ajax({
        url: '/api/signature',
        type: 'POST',
        data: {
            name: file.name,
            size: file.size,
            type: file.type
        },
        dataType: 'json'
    }).then((response) => {
        let key;
        let formData = new FormData();
        for (key in response.data) {
            if (response.data.hasOwnProperty(key)) {
                formData.append(key, response.data[key]);
            }
        }
        // リサイズ
        const reader = new FileReader();
        var blob;
        reader.onload = (e) => {
            let image = new Image();
            image.onload = () => {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                [canvas.width, canvas.height] = [image.width, image.height];
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * 0.5, image.height * 0.5);
                let base64 = canvas.toDataURL(file.type);
                let binary = atob(base64.replace(/^.*,/, ''));
                const buffer = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    buffer[i] = binary.charCodeAt(i);
                }
                blob = new Blob([buffer.buffer], { type: file.type });
                // console.log(blob)
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
        formData.append('file', blob);
        console.log(blob)
        return $.ajax({
            url: response.url,
            type: 'POST',
            data: formData,
            dataType: 'xml',
            processData: false,
            contentType: false,
        }).catch((error) => {
            console.log('署名作成エラー');
            console.log(error);
        });
    }).then((response) => {
        let body = $('body');
        let img = document.createElement('img');
        img.src = $(response).find('Location').first().text();
        body.append(img);
    }).catch((error) => {
        console.log('アップロードエラー');
        console.log(error);
    })
});
