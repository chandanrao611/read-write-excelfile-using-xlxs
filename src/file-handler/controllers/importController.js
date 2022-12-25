const Boom = require('@hapi/boom');
const path = require('path');
const fs = require('fs');
const XLSX = require("xlsx");
const SendResponse = require("../../helpers/responseHandler");
function arrayEquals(a, b) {
    a = a.sort();
    b = b.sort();
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}
const EMPTY_ARR = [null, 'null', undefined, 'undefined', "", " ", "  "];
/** Read excel file
 * Its read the first sheet of the excel file
 */
function readStreamExcel(stream/*:ReadStream*/, cb/*:(wb:Workbook)=>void*/)/*:void*/ {
    var buffers = [];
    stream.on('data', function (data) { buffers.push(data); });
    stream.on('end', function () {
        let buffer = Buffer.concat(buffers);
        const workbook = XLSX.read(buffer, {
            type: "buffer",
            WTF: true
        });
        const sheetNames = workbook.SheetNames;
        const worksheet = workbook.Sheets[sheetNames[0]];
        const result = XLSX.utils.sheet_to_json(worksheet);
        const columnsArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        cb(result, columnsArray);
    });
}
module.exports = {
    importFile: (req, res, next) => {
        try {
            let file = req.files.file;
            let fileExt = path.extname(file.name).slice(1);
            if (!ALLOWED_IMPORT_FILE_TYPES.includes(fileExt.toLowerCase())) {
                return SendResponse(res, Boom.badData('Only excel file allow'));
            }
            /** Uploads file in uploads folder
             * Please make sure uploads folder have read, write permission
             */
            const impFilePath = `${BASE_DIR}/src/${file.name}`;
            file.mv(impFilePath, async (err) => {
                if (err) {
                    /** Delete file if getting any error duering upload file */
                    fs.unlinkSync(impFilePath);
                    return SendResponse(res, Boom.badData('Somethings wents wrong to upload file'));
                }
                const readable = fs.createReadStream(impFilePath);
                let allowColumnsArray = ['question', 'answer'];
                readStreamExcel(readable, async (result, columnsArray) => {
                    /** Check header matched or not */
                    let missmatchHeader = arrayEquals(columnsArray, allowColumnsArray);
                    if (!missmatchHeader) {
                        return SendResponse(res, Boom.badRequest('Header key not matched'));
                    }
                    else {
                        var errors = [];
                        var existingData = [];
                        let data = result.reduce((accObj, obj) => {
                            if (obj.question && existingData.includes(obj.question.toLowerCase())) { errors.push('Question already exist') }
                            if (errors && errors.length) {
                                obj['resion'] = (errors.join(" / ")); errors = [];
                                accObj.invalid_data.push(obj);
                            }
                            else {
                                existingData.push(obj.question.toLowerCase());
                                accObj.valid_data.push(obj);
                            }
                            return accObj;
                        }, { valid_data: [], invalid_data: [] });
                        fs.unlinkSync(impFilePath);
                        return SendResponse(res, data, 'Import successfully');
                    }
                });
            });
        } catch (error) {
            console.log(error);
            return SendResponse(res, Boom.badData(error));
        }
    }
}