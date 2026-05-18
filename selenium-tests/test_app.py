import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = "http://localhost:3000"   # change to AKS IP for final run

def create_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    return webdriver.Chrome(options=options)

def register_user(driver, username, email, password):
    driver.get(f"{URL}/register")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username"))).send_keys(username)
    driver.find_element(By.NAME, "email").send_keys(email)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.XPATH, "//button[@type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//h5[contains(text(),'Add New Item')]")))

def login_user(driver, email, password):
    driver.get(f"{URL}/login")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(email)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.XPATH, "//button[@type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//h5[contains(text(),'Add New Item')]")))

def test_register_and_login():
    driver = create_driver()
    try:
        register_user(driver, "testuser", "test@example.com", "Test1234")
        # logout
        driver.find_element(By.XPATH, "//button[contains(text(),'Logout')]").click()
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.XPATH, "//h3[contains(text(),'Login')]")))
        # login
        login_user(driver, "test@example.com", "Test1234")
        print("✅ Register and login work.")
    finally:
        driver.quit()

def test_add_and_toggle_item():
    driver = create_driver()
    try:
        login_user(driver, "test@example.com", "Test1234")
        # Add item with category and due date
        name_input = driver.find_element(By.XPATH, "//input[@placeholder='Item name']")
        name_input.send_keys("Test Item")
        # select category
        driver.find_element(By.XPATH, "//select").send_keys("Work")
        # set due date
        driver.find_element(By.XPATH, "//input[@type='date']").send_keys("2026-12-31")
        driver.find_element(By.XPATH, "//button[contains(text(),'Add')]").click()
        # Wait for card with "Test Item"
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//h5[contains(text(),'Test Item')]")))
        # Toggle checkbox
        checkbox = driver.find_element(By.XPATH, "//h5[contains(text(),'Test Item')]/ancestor::div[contains(@class,'card-body')]//input[@type='checkbox']")
        checkbox.click()
        time.sleep(1)
        # Verify line-through style applied (optional check)
        card_title = driver.find_element(By.XPATH, "//h5[contains(text(),'Test Item')]")
        assert "text-decoration-line-through" in card_title.get_attribute("class")
        print("✅ Add item and toggle complete work.")
    finally:
        driver.quit()

def test_delete_item():
    driver = create_driver()
    try:
        login_user(driver, "test@example.com", "Test1234")
        # Delete the item we just created
        delete_btn = driver.find_element(By.XPATH, "//h5[contains(text(),'Test Item')]/ancestor::div[contains(@class,'card-body')]//button[contains(text(),'🗑️')]")
        delete_btn.click()
        time.sleep(1)
        # Confirm item is gone
        items = driver.find_elements(By.XPATH, "//h5[contains(text(),'Test Item')]")
        assert len(items) == 0
        print("✅ Delete item works.")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("Running enhanced auth-based tests...")
    test_register_and_login()
    test_add_and_toggle_item()
    test_delete_item()
    print("✅ All tests passed.")