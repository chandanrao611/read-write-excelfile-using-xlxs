var path = require('path');
global.BASE_DIR = path.resolve(__dirname) + '/';
global.ALLOWED_IMPORT_FILE_TYPES = ['xlsx', 'ods', 'csv', 'xls', 'xlsm', 'xlsb', 'xlam'];