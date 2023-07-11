
import fs from 'fs';
import url from 'url';

import 'dotenv/config';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

import { print_msg, pause } from './helpers/msgs_inquirer.js';
import { read_next_docindex, save_next_docindex } from './helpers/json_controls.js';
import { read_xlsx } from './helpers/read_xlsx.js';


const download_folder = url.fileURLToPath(new URL('./downloads', import.meta.url));

const move_to_download_page = async (driver) => {
    await driver.get(process.env.URL); //? Ingresar a la página

    print_msg('\nIngresando a la página', process.env.URL);

    await driver.sleep(2000);

    //? ---- Ingresa los datos para iniciar sesión ---- ?//
    const user_input = await driver.findElement(By.id('usuario'));
    const ci_input = await driver.findElement(By.id('ciAdicional'));
    const password_input = await driver.findElement(By.id('password'));
    
    await user_input.sendKeys(process.env.USUARIO);
    await ci_input.sendKeys(process.env.CI_ADICIONAL);
    await password_input.sendKeys(process.env.CONTRASENA);

    await driver.sleep(2000);

    //? ---- Le da click al botón de iniciar sesión ---- ?//
    const login_button = await driver.findElement(By.id('kc-login'));
    await login_button.click();

    //? ---- Ingresa a la sección de facturación electrónica ---- ?//
    const btn_facuras = await driver.wait(
        until.elementLocated(
            By.xpath('//span[@class="sri-menu-icon-facturacion-electronica"]//parent::button')
        )
    );

    await driver.sleep(2000);
    
    await btn_facuras.click();
    
    //? ---- Ingresa a la sección de consultas ---- ?//
    const btn_consultas = await driver.findElement(
        By.xpath('//span[text()="Consultas"]//parent::a')
    );
    await btn_consultas.click();

    await driver.sleep(2000);

    //? ---- Ingresa a la sección de comprobantes electrónicos recibidos ---- ?//
    const a_recibos = await driver.findElement(
        By.xpath('//a[text()="Comprobantes electrónicos recibidos"]')
    );

    await a_recibos.click();

    print_msg('\nIngresando a la sección de comprobantes electrónicos recibidos para descargar los documentos\n');

    await driver.sleep(1000);
}

const download_file = async (driver, nro_autorizacion, folder, new_folder) => {
    //? ---- Ingresa el número de autorización ---- ?//
    await driver.executeScript(`document.getElementById('frmPrincipal:txtParametro').value = '${nro_autorizacion}'`);

    await driver.sleep(1000);

    //? ---- Le da click al botón de consultar ---- ?//
    const btn_consultar = await driver.findElement(By.id('btnRecaptcha'));

    await btn_consultar.click();

    //? ---- Resuelve el captcha ---- ?//
    const timeoutMilliseconds = 5000; // Tiempo límite de espera en milisegundos
    
    const captchaElement = await driver.wait(
        until.elementLocated(By.xpath('//iframe[@title="El reCAPTCHA caduca dentro de dos minutos"]')), timeoutMilliseconds
    ).catch((e) => {
        console.error(e);
        return null;
    });

    if (captchaElement) {
        await driver.sleep(1500);
        try {
            const isCaptchaVisible = await captchaElement.isDisplayed();
            if (isCaptchaVisible) {
                print_msg('Un captcha ha sido detectado, por favor resuelvalo manualmente');
                await pause();
            }
            
        } catch (error) {}
    }
    
    await driver.sleep(1000);

    //? ---- Descargar el documento ---- ?//
    const btn_descargar = await driver.findElement(By.id('frmPrincipal:tablaCompRecibidos:0:lnkXml'));
    
    await btn_descargar.click();

    await driver.sleep(1000);

    const files = fs.readdirSync(folder);
    const fileName = files[0];

    fs.renameSync(`${folder}\\${fileName}`, `${new_folder}\\${nro_autorizacion}.xml`);
}

const get_next_doc = () => {
    const next_docindex = read_next_docindex('./data/next_docindex.json');

    const data = read_xlsx('./data/excel.xlsx');

    const next_doc = data[next_docindex - 1];

    return next_doc;
}

const sum_next_docindex = () => {
    const next_docindex = read_next_docindex('./data/next_docindex.json');

    save_next_docindex('./data/next_docindex.json', next_docindex + 1);
}

const download_files = async(folder, new_folder) => {
    if (!process.env.URL)
        throw new Error('El "url" no ha sido definido en el archivo .env');
    if (!process.env.USUARIO)
        throw new Error('El "usuario" no ha sido definido en el archivo .env');
    if (!process.env.CI_ADICIONAL)
        throw new Error('El "CI adicional" no ha sido definido en el archivo .env');
    if (!process.env.CONTRASENA)
        throw new Error('La "contraseña" no ha sido definida en el archivo .env');
    if (!process.env.DOCUMENTS_FOLDER)
        throw new Error('El folder de documentos no ha sido definido en el archivo .env');

    const driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().setUserPreferences({
            'download.default_directory': folder
        }))
        .build();

    await move_to_download_page(driver);

    //? ---- Selecciona la opción de número de autorización ---- ?//
    const btn_nro_autorizacion = await driver.findElement(By.id('frmPrincipal:opciones:2'));

    await btn_nro_autorizacion.click();

    await driver.sleep(10000);

    //? ---- Descarga los documentos (bucle largo) ---- ?//
    let next_doc = get_next_doc();
    
    while (next_doc) {

        print_msg(`Descargando el documento ${next_doc['#']}\n`);

        const nro_autorizacion = next_doc['Clave de Acceso'];

        await download_file(driver, nro_autorizacion, folder, new_folder);

        sum_next_docindex();

        next_doc = get_next_doc();
    }
    
    await driver.quit();
}

download_files(download_folder, process.env.DOCUMENTS_FOLDER);
