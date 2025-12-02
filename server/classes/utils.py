import string
import random

def generate_invite_code() -> str:
    return ''.join(random.choices(string.ascii_letters + string.digits, k=7))
