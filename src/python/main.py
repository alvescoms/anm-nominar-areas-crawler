from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
import pandas

HEADLESS_MODE = False
URL_ANM = "https://sople.anm.gov.br/portalpublico/areas-nominadas/nova"
FILE_PATH = "../data.csv"


def execute_crawler(process: str) -> bool:
    try:
        options = webdriver.ChromeOptions()

        if HEADLESS_MODE:
            options.add_argument('--headless')

        driver = webdriver.Chrome(options=options)
        driver.get(URL_ANM)
        wait = WebDriverWait(driver, 30)

        input_processos = wait.until(
            EC.presence_of_element_located((By.ID, 'mat-input-2')))

        for letter in process:
            input_processos.send_keys(letter)

        button_send = wait.until(EC.element_to_be_clickable(
            (By.XPATH, '//button[@class="mat-accent mat-raised-button mat-button-base"]')))

        button_send.click()

        wait.until(EC.presence_of_element_located(
            (By.XPATH, '//div[@class="mat-dialog-content ng-star-inserted"]')))

        driver.close()

        print("Process send with success: " + process)

        return True
    except:
        print("Error to send process: " + process)
        return False


def read_csv():
    data = pandas.read_csv(FILE_PATH, delimiter=';')

    for i, item in data.iterrows():
        execute_crawler(str(item['number']))


read_csv()
