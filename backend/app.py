from flask import Flask, request, jsonify, render_template
from models import preprocess_syllabus, extract_topics
from scheduler import estimate_complexity, generate_schedule
from models_db import db, User, StudyPlan
from flask_login import LoginManager
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///studyplanner.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecretkey'

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))



@app.route("/")
def home():
    return render_template("index.html")

@app.route("/history")
@login_required
def history():
    plans = StudyPlan.query.order_by(StudyPlan.created_at.desc()).all()

    result = []
    for p in plans:
        result.append({
            "id": p.id,
            "syllabus": p.syllabus,
            "plan": p.generated_plan,
            "created_at": p.created_at
        })

    return jsonify(result)

@app.route("/generate-plan", methods=["POST"])
def generate_plan():
    data = request.json

    syllabus_text = data["syllabus"]
    days = int(data["days"])
    hours = int(data["hours"])

    lines = preprocess_syllabus(syllabus_text)
    topics = extract_topics(lines)
    weighted = estimate_complexity(topics)
    plan = generate_schedule(weighted, days, hours)

    # 🔹 Save plan to database
    new_plan = StudyPlan(
        user_id=None, # type: ignore
        syllabus=syllabus_text,   # type: ignore
        generated_plan=str(plan) # type: ignore
    )

    db.session.add(new_plan)
    db.session.commit()

    return jsonify(plan)

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data["name"]
    email = data["email"]
    password = generate_password_hash(data["password"])

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    new_user = User(name=name, email=email, password=password)  # type: ignore
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if user and check_password_hash(user.password, data["password"]):
        login_user(user)
        return jsonify({"message": "Login successful"})

    return jsonify({"message": "Invalid credentials"}), 401


if __name__ == "__main__":
    app.run(debug=True)
