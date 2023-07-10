
import fs from 'fs'


export const save_next_docindex = (path, docid) => {
    fs.writeFileSync(path, JSON.stringify({
        '#': docid
    }));
}

export const read_next_docindex = (path) => {
    if (!fs.existsSync(path))
        return {};
    
    const objeto = fs.readFileSync(path, {encoding: "utf-8"}); 

    return (objeto === '')
        ? 1
        : JSON.parse(objeto)['#'];
}