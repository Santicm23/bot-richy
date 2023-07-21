
import { By, Key } from 'selenium-webdriver';

import { pause, print_msg } from './msgs_inquirer.js';


export async function installExtension(driver) {

  const extensionPath = 'https://chrome.google.com/webstore/category/extensions?hl=es';

  await driver.get(extensionPath);

  const searchInput = await driver.findElement(By.id('searchbox-input'));
  await searchInput.sendKeys('Buster');

  await driver.actions().keyDown(Key.ENTER).perform();
  
  await driver.sleep(5000);
  
  const firstExtension = await driver.findElement(By.xpath('//a[@class="h-Ja-d-Ac a-u"]'));
  await firstExtension.click();
  
  await driver.sleep(1000);
  
  const addExtension = await driver.findElement(By.xpath('//div[@aria-label="Añadir a Chrome"]'));
  await addExtension.click();

  print_msg('Un mensaje aparecerá para confirmar la instalación de la extensión. Oprima "Añadir extensión"');
  await pause();
}