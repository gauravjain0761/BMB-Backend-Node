

exports.success = (statusCode, message, data, res) => {
    res.status(statusCode).json({
        message: message,
        status: true,
        data: data
})
}

exports.errorResponse = (statuscode, message, res) => {
    res.status(statuscode).json({
        message: message,
        status: false
    })
}
