# calculator.py

def divide_numbers(a, b):
    # BUG 1: Tidak ada pengecekan jika b = 0. Akan menyebabkan program crash (ZeroDivisionError)
    result = a / b
    return result

def get_user_data(user_id):
    # BUG 2: Celah keamanan SQL Injection yang sangat fatal!
    query = f"SELECT * FROM users WHERE id = {user_id}"
    print("Menjalankan query:", query)
    # db.execute(query)
    return True
