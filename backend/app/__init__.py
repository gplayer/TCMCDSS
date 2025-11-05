from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app, origins=['https://tcmcdss.pages.dev', 'https://ca255ee2.tcmcdss.pages.dev', 'https://gplayer.pythonanywhere.com'])

    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['DATABASE'] = os.path.join(os.path.dirname(__file__), '..', 'tcm_cdss.db')
    
    # Initialize database
    from .models import database
    database.init_db(app.config['DATABASE'])
    
    # Register blueprints
    from .routes import patients, observations, interrogations, patterns, reasoning
    from .routes.chief_complaints import chief_complaints_bp
    app.register_blueprint(patients.bp)
    app.register_blueprint(observations.bp)
    app.register_blueprint(interrogations.interrogations_bp)
    app.register_blueprint(patterns.bp)
    app.register_blueprint(chief_complaints_bp)
    app.register_blueprint(reasoning.reasoning_bp)
    
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'service': 'TCM CDSS API'}
    
    return app
