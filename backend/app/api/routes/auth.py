from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.category import Category
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

DEFAULT_CATEGORIES = [
    {"name": "Salário", "type": "revenue", "color": "#22c55e", "icon": "💰"},
    {"name": "Freelance", "type": "revenue", "color": "#3b82f6", "icon": "💻"},
    {"name": "Comissões", "type": "revenue", "color": "#f59e0b", "icon": "🤝"},
    {"name": "Rendimentos", "type": "revenue", "color": "#8b5cf6", "icon": "📈"},
    {"name": "Investimentos", "type": "revenue", "color": "#06b6d4", "icon": "💎"},
    {"name": "Outros Ganhos", "type": "revenue", "color": "#6b7280", "icon": "➕"},
    {"name": "Moradia", "type": "expense", "color": "#ef4444", "icon": "🏠"},
    {"name": "Alimentação", "type": "expense", "color": "#f97316", "icon": "🍽️"},
    {"name": "Transporte", "type": "expense", "color": "#eab308", "icon": "🚗"},
    {"name": "Saúde", "type": "expense", "color": "#22c55e", "icon": "💊"},
    {"name": "Educação", "type": "expense", "color": "#3b82f6", "icon": "📚"},
    {"name": "Lazer", "type": "expense", "color": "#8b5cf6", "icon": "🎮"},
    {"name": "Assinaturas", "type": "expense", "color": "#ec4899", "icon": "📱"},
    {"name": "Impostos", "type": "expense", "color": "#dc2626", "icon": "📋"},
    {"name": "Investimentos", "type": "expense", "color": "#06b6d4", "icon": "💎"},
    {"name": "Outros", "type": "expense", "color": "#6b7280", "icon": "➕"},
]


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    for cat in DEFAULT_CATEGORIES:
        db.add(Category(user_id=user.id, **cat))
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
