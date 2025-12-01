from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

@app.route('/clean', methods=['POST'])
def clean_chat():
    try:
        data = request.get_json()
        chat_text = data.get('chat_text', '')
        
        if not chat_text:
            return jsonify({'error': 'No chat text provided'}), 400
        
        # Split by lines
        lines = chat_text.strip().split('\n')
        cleaned_messages = []
        
        # Regex pattern to match WhatsApp timestamp formats
        # Matches: [12/01/24, 3:45:23 PM] or [01/12/2024, 15:45:23] etc.
        timestamp_pattern = r'^\[?\d{1,2}[/-]\d{1,2}[/-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\]?\s*'
        
        for line in lines:
            # Skip empty lines
            if not line.strip():
                continue
            
            # Skip system messages
            system_keywords = [
                'Messages and calls are end-to-end encrypted',
                'created group',
                'added',
                'left',
                'changed the subject',
                'changed this group',
                'security code changed',
                'missed voice call',
                'missed video call'
            ]
            
            if any(keyword in line.lower() for keyword in system_keywords):
                continue
            
            # Remove timestamp and sender name
            # Pattern: [timestamp] Sender: Message
            message = re.sub(timestamp_pattern, '', line)
            
            # Remove sender name (everything before first colon)
            if ':' in message:
                message = message.split(':', 1)[1].strip()
            
            if message:
                cleaned_messages.append(message)
        
        return jsonify({
            'cleaned_messages': cleaned_messages,
            'original_count': len(lines),
            'cleaned_count': len(cleaned_messages)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'chat-cleaner'})

if __name__ == '__main__':
    print("🐍 Python Chat Cleaner API running on http://localhost:5000")
    app.run(debug=True, port=5000)