
exports.successResponse = (statusCode, message, data, res) => {
    let response = {
        message: message,
        status: true,
        data: data
    }
    if (data.length) {
        response.totalCount = data.length;
    }
    res.status(statusCode).json(response)
}

exports.errorResponse = (statuscode, message, res) => {
    res.status(statuscode).json({
        message: message,
        status: false
    })
}
