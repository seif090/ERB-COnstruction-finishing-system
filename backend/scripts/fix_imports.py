from pathlib import Path
root = Path('backend/src/controllers')
replacements = {
    "from '..//database'": "from '../config/database'",
    'from "..//database"': 'from "../config/database"',
    "from '..//errorHandler'": "from '../middleware/errorHandler'",
    'from "..//errorHandler"': 'from "../middleware/errorHandler"',
    "from '..//auth'": "from '../middleware/auth'",
    'from "..//auth"': 'from "../middleware/auth"',
    "from '..//pagination'": "from '../utils/pagination'",
    'from "..//pagination"': 'from "../utils/pagination"',
    "from '..//socket'": "from '../utils/socket'",
    'from "..//socket"': 'from "../utils/socket"',
    "from '..//jwt'": "from '../utils/jwt'",
    'from "..//jwt"': 'from "../utils/jwt"',
}
for path in root.rglob('*.ts'):
    text = path.read_text(encoding='utf-8')
    for old, new in replacements.items():
        text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
print('fixed imports')
