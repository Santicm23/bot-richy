
import { By } from 'selenium-webdriver';


export async function solveRecaptcha(driver) {
  await driver.switchTo().defaultContent();

  await driver.sleep(3000);

  const solverButton = await driver.findElement(By.id('solver-button'));

  console.log('solverButton', solverButton)

  await driver.sleep(3000);

  await solverButton.click();

  await driver.sleep(3000);
}
