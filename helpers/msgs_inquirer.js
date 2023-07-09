
import inquirer from 'inquirer';
import 'colors';


export const print_msg = (msg, info = '') => {
    info = info
        ? `"${info.blue}"`
        : '';
    console.log(`${msg.bold} ${info}`);
}

export const pause = async() =>{
    console.log();
    await inquirer.prompt([{
            type: 'input',
            name: 'continuar',
            message: 'Presione'+' ENTER '.green + 'para continuar'
        }
    ]);
    console.log();
}