
import fs from 'fs';

import 'dotenv/config';
import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

import { print_msg, pause } from './helpers/msgs_inquirer.js';


const download_folder = 'C:\\Users\\maval\\OneDrive\\Documentos\\mis_proyectos\\Javascript\\bot-richy\\downloads';

const move_to_download_page = async(driver) => {
    await driver.get(process.env.URL); //? Ingresar a la página

    print_msg('Ingresando a la página', process.env.URL);

    //? ---- Ingresa los datos para iniciar sesión ---- ?//
    const user_input = await driver.findElement(webdriver.By.id('usuario'));
    const ci_input = await driver.findElement(webdriver.By.id('ciAdicional'));
    const password_input = await driver.findElement(webdriver.By.id('password'));
    
    await user_input.sendKeys(process.env.USUARIO);
    await ci_input.sendKeys(process.env.CI_ADICIONAL);
    await password_input.sendKeys(process.env.CONTRASENA);

    //? ---- Le da click al botón de iniciar sesión ---- ?//
    const login_button = await driver.findElement(webdriver.By.id('kc-login'));
    await login_button.click();

    await driver.sleep(5000);

    //? ---- Ingresa a la sección de facturación electrónica ---- ?//
    const btn_facuras = await driver.findElement(
        webdriver.By.xpath('//span[@class="sri-menu-icon-facturacion-electronica"]//parent::button')
    );
    
    await btn_facuras.click();
    
    //? ---- Ingresa a la sección de consultas ---- ?//
    const btn_consultas = await driver.findElement(
        webdriver.By.xpath('//span[text()="Consultas"]//parent::a')
    );
    await btn_consultas.click();

    await driver.sleep(4000);

    //? ---- Ingresa a la sección de comprobantes electrónicos recibidos ---- ?//
    const a_recibos = await driver.findElement(
        webdriver.By.xpath('//a[text()="Comprobantes electrónicos recibidos"]')
    );

    await a_recibos.click();

    print_msg('\nIngresando a la sección de comprobantes electrónicos recibidos para descargar los documentos\n');

    await driver.sleep(1000);
}

const download_file = async(driver, nro_autorizacion, folder) => {
    //? ---- Ingresa el número de autorización ---- ?//
    await driver.executeScript(`document.getElementById('frmPrincipal:txtParametro').value = '${nro_autorizacion}'`);

    await driver.sleep(1000);

    //? ---- Le da click al botón de consultar ---- ?//
    const btn_consultar = await driver.findElement(webdriver.By.id('btnRecaptcha'));

    await btn_consultar.click();
    
    print_msg('Un captcha ha sido detectado, por favor resuelvalo manualmente');
    await pause();
    
    await driver.sleep(1000);

    //? ---- Descargar el documento ---- ?//
    const btn_descargar = await driver.findElement(webdriver.By.id('frmPrincipal:tablaCompRecibidos:0:lnkXml'));
    
    await btn_descargar.click();

    await driver.sleep(10000);

    const files = fs.readdirSync(folder);
    const fileName = files[0];

    fs.renameSync(`${folder}\\${fileName}`, `./documents\\${nro_autorizacion}.xml`);
}

const download_files = async(folder) => {
    if (!process.env.URL)
        throw new Error('El "url" no ha sido definido en el archivo .env');
    if (!process.env.USUARIO)
        throw new Error('El "usuario" no ha sido definido en el archivo .env');
    if (!process.env.CI_ADICIONAL)
        throw new Error('El "CI adicional" no ha sido definido en el archivo .env');
    if (!process.env.CONTRASENA)
        throw new Error('La "contraseña" no ha sido definida en el archivo .env');

    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().setUserPreferences({
            'download.default_directory': folder,
            'download.prompt_for_download': false,
            'download.directory_upgrade': true,
            'safebrowsing.enabled': true
        }))
        .build();

    await move_to_download_page(driver);

    //? ---- Selecciona la opción de número de autorización ---- ?//
    const btn_nro_autorizacion = await driver.findElement(webdriver.By.id('frmPrincipal:opciones:2'));

    await btn_nro_autorizacion.click();

    await driver.sleep(1000);

    let nro_autorizacion = '3105202201099252674200120370050008332564126153313';

    await download_file(driver, nro_autorizacion, folder);

    nro_autorizacion = '3105202201099252674200120480020010657524126153318'

    await download_file(driver, nro_autorizacion, folder);
    
    await driver.quit();
}

download_files(download_folder);
