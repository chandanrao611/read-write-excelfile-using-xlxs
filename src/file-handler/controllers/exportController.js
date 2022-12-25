const Boom = require('@hapi/boom');
const XLSX = require("xlsx");
const fs = require('fs');
const SendResponse = require("../../helpers/responseHandler");
const sampleData = fs.readFileSync("sampleData.json", 'utf8');
module.exports = {
    exportFile: (req, res, next) => {
        let json = JSON.parse(sampleData);

        const N_A = null;
        const headerGroups = [{ name: 'Users list', origin: 'A1' }];
        const colWidths = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

        const rawToHeaders = ({ name, email, mobile, state, country }) => {
            return {
                'Candidate Name': name,
                'Email': email,
                'Mobile': mobile,
                'State': state,
                'Country': country
            };
        };

        let workBook = XLSX.utils.book_new();
        const workSheet = XLSX.utils.json_to_sheet(json.map(rawToHeaders), { origin: 'A2' });
        /** Merge the heading from A1 to E1 */
        workSheet['!merges'] = [
            XLSX.utils.decode_range('A1:E1')
        ];
        /** Add the top header */
        headerGroups.forEach(({ name, origin }) => {
            XLSX.utils.sheet_add_aoa(workSheet, [[name]], { origin });
        });
        /** Add each column width */
        workSheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workBook, workSheet, `User`);
        let exportFileName = `response.xls`;
        XLSX.writeFile(workBook, exportFileName);

        /** Download file and delete */
        setTimeout(() => {
            res.download(exportFileName);
            fs.access(exportFileName, error => {
                if (!error) {
                    fs.unlinkSync(exportFileName, function (error) {
                        console.log(error);
                    });
                } else {
                    console.log(error, 'not error');
                }
            });
        }, 1000);
    }
}