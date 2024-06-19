import { error } from "highcharts";
import xlsx from "xlsx";

const headers = ['givenName', 'surName', 'userId ', 'positionName', 'organizationName', 'electronicMailAddress', 'phone', 'deliveryPoint', 'city', 'administrativeArea', 'country', 'onlineUrl']
const parse = file => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend =  () => {
        const buffer = reader.result
        const workbook = xlsx.read(buffer, {type: "array", dense: true, cellDates: true });
        const data = workbook.SheetNames.map((n) => ({
            name: n,
            data: xlsx.utils.sheet_to_json(workbook.Sheets[n], { header: 1 }),
          }));
         // const headers = data[0].data[0]
          const agents = data[0].data.slice(1).map(e => e.reduce((acc, cur, idx) => {acc[headers[idx].trim()] = cur; return acc},{}))
          resolve(agents)
    }
    reader.addEventListener('error', reject)
    /* reader.onerror(()=> {
        reject(error)
    }) */

    reader.readAsArrayBuffer(file)

    })
    

}

export default parse;