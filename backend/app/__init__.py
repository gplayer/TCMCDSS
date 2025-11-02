from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['DATABASE'] = os.path.join(os.path.dirname(__file__), '..', 'tcm_cdss.db')
    
    # Initialize database
    from .models import database
    database.init_db(app.config['DATABASE'])
    
    # Register blueprints
    from .routes import patients, observations, patterns
    app.register_blueprint(patients.bp)
    app.register_blueprint(observations.bp)
    app.register_blueprint(patterns.bp)
    
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'service': 'TCM CDSS API'}
    
    return app
