
import xlsx from 'xlsx';


export const read_xlsx = (path) => {

    const workbook = xlsx.readFile(path);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = xlsx.utils.sheet_to_json(sheet);

    return data;
}