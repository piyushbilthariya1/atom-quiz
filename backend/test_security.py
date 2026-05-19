from app.core.security import get_password_hash
import traceback

try:
    print(get_password_hash("Afg@2005"))
except Exception as e:
    traceback.print_exc()
