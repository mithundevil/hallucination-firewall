import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from image_detector import analyze_image
from text_verifier import verify_text
from firewall_engine import process_firewall_request
from history_manager import save_to_history, get_history
from utils import format_response

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

@app.route('/analyze/image', methods=['POST'])
def analyze_image_endpoint():
    try:
        image_file = request.files.get('image')
        if not image_file:
            return jsonify(format_response(False, "No image provided")), 400
        
        filename = secure_filename(image_file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(filepath)
        
        result = analyze_image(filepath)
        save_to_history("Image Check", result)
        
        return jsonify(format_response(True, "Image analysis completed", result))
    except Exception as e:
        return jsonify(format_response(False, str(e))), 500

@app.route('/analyze/text', methods=['POST'])
def analyze_text_endpoint():
    try:
        data = request.json
        text = data.get('text', '')
        if not text:
            return jsonify(format_response(False, "No text provided")), 400
            
        result = verify_text(text)
        save_to_history("Text Check", result)
        
        return jsonify(format_response(True, "Text analysis completed", result))
    except Exception as e:
        return jsonify(format_response(False, str(e))), 500

@app.route('/analyze/firewall', methods=['POST'])
def analyze_firewall_endpoint():
    try:
        text = request.form.get('text', '')
        image_file = request.files.get('image')
        
        filepath = None
        if image_file:
            filename = secure_filename(image_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_file.save(filepath)
            
        result = process_firewall_request(text, filepath)
        save_to_history("Multimodal Firewall", result)
        
        return jsonify(format_response(True, "Firewall analysis completed", result))
    except Exception as e:
        return jsonify(format_response(False, str(e))), 500

@app.route('/history', methods=['GET'])
def history_endpoint():
    try:
        history = get_history()
        return jsonify(format_response(True, "History retrieved", history))
    except Exception as e:
        return jsonify(format_response(False, str(e))), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "active", "version": "2.0.0"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
