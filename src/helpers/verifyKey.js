exports.verifyKey = async (data) => {
    let obj = {}
    for (const [key] of Object.entries(data)) {
        if (data[`${key}`] != "") {
            obj[`${key}`] = data[key];
        }
    }
    // if(data.isActive != null){
    //    obj.isActive = data.isActive;
    // }
    // if(data.home_visibilty != null){
    //     obj.home_visibilty = data.home_visibilty;
    //  }
    return obj;
}