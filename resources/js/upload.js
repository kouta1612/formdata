export function signature(image) {
    return $.ajax({
        url: '/api/signature',
        type: 'POST',
        data: {
            size: image.size,
            type: image.type
        },
        dataType: 'json',
    }).catch((error) => {
        const errors = error.responseJSON.errors;
        const message = errors[Object.keys(errors)][0];
        $('.upload__error-text').text(message);
    });
}

export function upload(signature, image) {
    const formData = setFormData(signature, image);
    return $.ajax({
        url: signature.url,
        type: 'POST',
        data: formData,
        dataType: 'xml',
        processData: false,
        contentType: false,
    });
}

function setFormData(signature, image) {
    const formData = new FormData();
    for (const key in signature.data) {
        if (signature.data.hasOwnProperty(key)) {
            formData.append(key, signature.data[key]);
        }
    }
    formData.append('file', image);
    return formData;
}

export default { signature, upload };
